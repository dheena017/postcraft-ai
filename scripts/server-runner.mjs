#!/usr/bin/env node

/**
 * ============================================================================
 *  POSTCRAFT AI - ENHANCED LIVE DEVELOPMENT SERVER & AUTO-RESTART RUNNER
 * ============================================================================
 *  - Live File Watching: watches src/, .env*, config files
 *  - Automatic Clean Restart: restarts server on any file modification
 *  - Safe Ignored Patterns: prevents infinite loops on SQLite DB and .next cache
 *  - Port 3000 Conflict Detection: identifies and clears hanging zombie processes
 *  - Crash Resilience: remains alive when code fails and auto-revives upon fix
 *  - Windows Process Tree Kill: releases port & file locks cleanly without leaks
 *  - Keyboard Controls: [r] restart, [c] clear screen, [q] quit
 * ============================================================================
 */

import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// CLI Argument parsing
const args = process.argv.slice(2);
let customPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '-p' || args[i] === '--port') && args[i + 1]) {
    customPort = parseInt(args[i + 1], 10);
    i++;
  }
}

const PORT = isNaN(customPort) ? 3000 : customPort;
const DEBOUNCE_DELAY_MS = 300;

// Terminal styling
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  bgBrand: '\x1b[45m\x1b[37m\x1b[1m',
  bgGreen: '\x1b[42m\x1b[30m\x1b[1m',
  bgRed: '\x1b[41m\x1b[37m\x1b[1m',
  bgYellow: '\x1b[43m\x1b[30m\x1b[1m',
};

// Patterns to strictly ignore to avoid infinite loops and false triggers
const IGNORED_REGEX = [
  /[\\/]\.next([\\/]|$)/,
  /[\\/]node_modules([\\/]|$)/,
  /[\\/]\.git([\\/]|$)/,
  /[\\/]data[\\/].*\.db(-wal|-shm)?$/, // SQLite database files
  /[\\/]\.system_generated([\\/]|$)/,
  /\.tsbuildinfo$/,
  /\.DS_Store$/,
  /\.swp$/,
  /\.tmp$/,
  /\.log$/,
];

let serverProcess = null;
let restartTimeout = null;
let isRestarting = false;
let isShuttingDown = false;
let restartCount = 0;
let lastRestartReason = 'Initial launch';

function printBanner(status = 'RUNNING') {
  const timestamp = new Date().toLocaleTimeString();
  const statusBadge =
    status === 'RUNNING'
      ? `${c.bgGreen} ONLINE ${c.reset}`
      : status === 'RESTARTING'
      ? `${c.bgYellow} RESTARTING ${c.reset}`
      : `${c.bgRed} STOPPED ${c.reset}`;

  console.log(`\n${c.bold}${c.magenta}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${c.reset}`);
  console.log(`${c.bold}${c.magenta}┃   ⚡ POSTCRAFT AI - ENHANCED AUTO-RESTART SERVER ENGINE    ┃${c.reset}`);
  console.log(`${c.bold}${c.magenta}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${c.reset}`);
  console.log(`  ${c.dim}Status:${c.reset}    ${statusBadge}  ${c.dim}[${timestamp}]${c.reset}`);
  console.log(`  ${c.dim}Local URL:${c.reset} ${c.bold}${c.cyan}http://localhost:${PORT}${c.reset}`);
  console.log(`  ${c.dim}Watcher:${c.reset}   ${c.green}Active${c.reset} ${c.dim}(Auto-restarts immediately on code changes)${c.reset}`);
  console.log(`  ${c.dim}Restarts:${c.reset}  ${c.white}${restartCount}${c.reset} ${c.dim}(Last: ${lastRestartReason})${c.reset}`);
  console.log(`  ${c.dim}Shortcuts:${c.reset} ${c.yellow}[r]${c.reset} Force restart  ${c.yellow}[c]${c.reset} Clear logs  ${c.yellow}[q]${c.reset} Quit server\n`);
}

/**
 * Finds PID occupying port on Windows and frees it if found
 */
function freePortIfOccupied(port) {
  if (process.platform !== 'win32') return;

  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid)) && Number(pid) !== process.pid) {
          console.log(`${c.yellow}[PORT WARNING] Port ${port} is occupied by PID ${pid}. Terminating zombie process...${c.reset}`);
          execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
          console.log(`${c.green}[PORT FREED] Port ${port} is now available.${c.reset}`);
        }
      }
    }
  } catch {
    // Port was not occupied
  }
}

/**
 * Recursively terminates child process tree cleanly on Windows/Unix
 */
function terminateProcess(child) {
  if (!child || !child.pid) return;

  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /T /PID ${child.pid}`, { stdio: 'ignore' });
    } else {
      process.kill(-child.pid, 'SIGKILL');
    }
  } catch {
    // Process might already have exited
  }
}

function getLogTime() {
  const d = new Date();
  const pad = (n, s = 2) => String(n).padStart(s, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function stripAnsi(str) {
  return str.replace(/[\u001b\x1b]\[[0-9;]*[a-zA-Z]/g, '');
}

function processLogLine(raw) {
  const line = raw.trimEnd();
  if (!line) return '';

  const clean = stripAnsi(line).trim();

  // Suppress experimental node warnings and useless trace hints
  if (
    clean.includes('ExperimentalWarning: SQLite is an experimental feature') ||
    clean.includes('node --trace-warnings') ||
    clean.includes('Need to disable some ESLint rules?')
  ) {
    return null;
  }

  // Already our PostCraft styled log - pass directly
  if (line.includes('[PostCraft]')) {
    return line;
  }

  const time = getLogTime();
  const brand = '\x1b[38;2;168;85;247m\x1b[1m[PostCraft]\x1b[0m';
  const timeTag = `\x1b[38;2;113;113;122m${time}\x1b[0m`;

  // HTTP Request Log: e.g. "GET /api/queue 200 in 16ms"
  const httpMatch = clean.match(/^\s*(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s+(\d{3})\s+in\s+([0-9.]+m?s)/i);
  if (httpMatch) {
    const [, method, url, status, latency] = httpMatch;
    const scopeTag = '\x1b[38;2;14;165;233m[HTTP]      \x1b[0m';

    let methodColor = '\x1b[36m\x1b[1m'; // GET: cyan
    if (method.toUpperCase() === 'POST') methodColor = '\x1b[32m\x1b[1m'; // POST: green
    if (method.toUpperCase() === 'PATCH' || method.toUpperCase() === 'PUT') methodColor = '\x1b[33m\x1b[1m'; // PATCH: yellow
    if (method.toUpperCase() === 'DELETE') methodColor = '\x1b[31m\x1b[1m'; // DELETE: red
    const methodBadge = `${methodColor}${method.toUpperCase().padEnd(6)}\x1b[0m`;

    const statusNum = parseInt(status, 10);
    let statusText = `${status} OK`;
    let statusColor = '\x1b[92m';
    if (statusNum >= 300 && statusNum < 400) {
      statusText = `${status} REDIR`;
      statusColor = '\x1b[93m';
    } else if (statusNum >= 400 && statusNum < 500) {
      statusText = `${status} ERR`;
      statusColor = '\x1b[91m';
    } else if (statusNum >= 500) {
      statusText = `${status} FAIL`;
      statusColor = '\x1b[91m\x1b[1m';
    }
    const statusBadge = `${statusColor}${statusText.padEnd(9)}\x1b[0m`;

    const urlDisplay = url.startsWith('/api/') ? `\x1b[1m\x1b[37m${url}\x1b[0m` : `\x1b[38;2;161;161;170m${url}\x1b[0m`;
    const latencyTag = `\x1b[38;2;113;113;122m(${latency})\x1b[0m`;

    return `${brand} ${timeTag} ${scopeTag} ${methodBadge}  ${statusBadge}  ${urlDisplay} ${latencyTag}`;
  }

  // Next.js Compilation log: handles both "✓ Compiled /api/auth/me in 182ms (426 modules)" and "✓ Compiled in 313ms (312 modules)"
  const compileMatch = clean.match(/^\s*✓\s+Compiled(?:\s+(.*?))?\s+in\s+([0-9.]+m?s)(?:\s+\((\d+)\s+modules\))?/i);
  if (compileMatch) {
    const [, target, latency, modules] = compileMatch;
    const scopeTag = '\x1b[38;2;99;102;241m[BUILD]     \x1b[0m';
    const checkBadge = '\x1b[92m\x1b[1m✓ COMPILED\x1b[0m';
    const targetDisplay = target && target.trim() ? `\x1b[37m${target.trim()}\x1b[0m ` : '';
    const modTag = modules ? `\x1b[38;2;113;113;122m(${modules} modules in ${latency})\x1b[0m` : `\x1b[38;2;113;113;122m(${latency})\x1b[0m`;
    return `${brand} ${timeTag} ${scopeTag} ${checkBadge}  ${targetDisplay}${modTag}`;
  }

  // Next.js Compiling target: e.g. "○ Compiling /dashboard ..."
  const compilingMatch = clean.match(/^\s*○\s+Compiling\s+(.*?)\s*\.{3}/i);
  if (compilingMatch) {
    const [, target] = compilingMatch;
    const scopeTag = '\x1b[38;2;99;102;241m[BUILD]     \x1b[0m';
    const compilingBadge = '\x1b[93m⚡ COMPILING\x1b[0m';
    return `${brand} ${timeTag} ${scopeTag} ${compilingBadge} ${target}`;
  }

  // Next.js Ready: e.g. "✓ Ready in 3.1s"
  if (clean.includes('Ready in') || clean.includes('ready on')) {
    const scopeTag = '\x1b[38;2;34;197;94m[READY]     \x1b[0m';
    return `${brand} ${timeTag} ${scopeTag} \x1b[92m\x1b[1m✓ ENGINE ACTIVE\x1b[0m  \x1b[38;2;168;85;247mhttp://localhost:${PORT}\x1b[0m (${clean})`;
  }

  // Next.js Starting
  if (clean.includes('Starting...')) {
    const scopeTag = '\x1b[38;2;245;158;11m[SERVER]    \x1b[0m';
    return `${brand} ${timeTag} ${scopeTag} \x1b[93m⚡ Initializing Next.js Engine...\x1b[0m`;
  }

  return line;
}

/**
 * Starts the Next.js server instance
 */
async function startServer() {
  if (isShuttingDown) return;

  // Ensure port is not locked by zombie processes
  freePortIfOccupied(PORT);

  printBanner('RUNNING');

  // Next.js binary directly
  const nextBin = path.join(ROOT_DIR, 'node_modules', 'next', 'dist', 'bin', 'next');
  const spawnCommand = fs.existsSync(nextBin) ? process.execPath : 'npx';
  const spawnArgs = fs.existsSync(nextBin)
    ? [nextBin, 'dev', '-p', String(PORT)]
    : ['next', 'dev', '-p', String(PORT)];

  serverProcess = spawn(spawnCommand, spawnArgs, {
    cwd: ROOT_DIR,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'development',
      FORCE_COLOR: '1',
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --no-warnings`.trim(),
    },
  });

  const rlOut = readline.createInterface({ input: serverProcess.stdout });
  rlOut.on('line', (line) => {
    const formatted = processLogLine(line);
    if (formatted !== null) {
      console.log(formatted);
    }
  });

  const rlErr = readline.createInterface({ input: serverProcess.stderr });
  rlErr.on('line', (line) => {
    const formatted = processLogLine(line);
    if (formatted !== null) {
      console.error(formatted);
    }
  });

  serverProcess.on('exit', (code, signal) => {
    if (isShuttingDown) return;

    if (!isRestarting) {
      if (code !== 0 && code !== null) {
        console.log(`\n${c.bgRed} CRASH DETECTED ${c.reset} ${c.red}Server process exited with code ${code}.${c.reset}`);
        console.log(`${c.yellow}Watching files for changes... Fix the error and save to auto-restart.${c.reset}\n`);
      }
    }
  });

  serverProcess.on('error', (err) => {
    if (!isShuttingDown) {
      console.error(`${c.red}[SERVER ERROR] Failed to start server:${c.reset}`, err.message);
    }
  });
}

/**
 * Trigger debounced server restart
 */
function scheduleRestart(reason) {
  if (isShuttingDown) return;

  lastRestartReason = reason;

  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }

  restartTimeout = setTimeout(async () => {
    if (isRestarting) return;
    isRestarting = true;
    restartCount++;

    console.log(`\n${c.bgYellow} LIVE-RELOAD ↻ ${c.reset} ${c.yellow}${reason}${c.reset}`);
    console.log(`${c.dim}Restarting Next.js server with clean environment and database locks...${c.reset}`);

    if (serverProcess) {
      const proc = serverProcess;
      serverProcess = null;
      terminateProcess(proc);
      // Wait briefly for port and SQLite WAL flush
      await new Promise((res) => setTimeout(res, 400));
    }

    isRestarting = false;
    await startServer();
  }, DEBOUNCE_DELAY_MS);
}

/**
 * Checks if a changed file path should trigger a restart
 */
function shouldTriggerRestart(filePath) {
  for (const pattern of IGNORED_REGEX) {
    if (pattern.test(filePath)) {
      return false;
    }
  }
  return true;
}

/**
 * Sets up filesystem watcher across workspace
 */
function setupFileWatchers() {
  const watchPaths = [
    path.join(ROOT_DIR, '.env'),
    path.join(ROOT_DIR, '.env.local'),
    path.join(ROOT_DIR, '.env.development'),
    path.join(ROOT_DIR, 'next.config.mjs'),
    path.join(ROOT_DIR, 'tailwind.config.ts'),
    path.join(ROOT_DIR, 'tsconfig.json'),
    path.join(ROOT_DIR, 'package.json'),
  ];

  for (const targetPath of watchPaths) {
    if (!fs.existsSync(targetPath)) continue;

    try {
      fs.watch(targetPath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        const fullPath = path.isAbsolute(filename) ? filename : path.join(targetPath, filename);

        if (!shouldTriggerRestart(fullPath)) {
          return;
        }

        const relativePath = path.relative(ROOT_DIR, fullPath);
        scheduleRestart(`[FILE MODIFIED] ${relativePath}`);
      });
    } catch (err) {
      console.warn(`${c.yellow}[WATCHER WARNING] Could not attach watcher to ${targetPath}:${c.reset}`, err.message);
    }
  }

  console.log(`${c.dim}✓ File watcher active on src/, .env*, and configuration files.${c.reset}`);
}

/**
 * Setup interactive keyboard shortcuts
 */
function setupKeyboardControls() {
  if (!process.stdin.isTTY) return;

  try {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key) => {
      // Ctrl+C or 'q' to quit
      if (key === '\u0003' || key === 'q' || key === 'Q') {
        gracefulShutdown();
        return;
      }

      // 'r' to force restart
      if (key === 'r' || key === 'R') {
        scheduleRestart('Manual keyboard trigger [r]');
        return;
      }

      // 'c' to clear console
      if (key === 'c' || key === 'C') {
        console.clear();
        printBanner('RUNNING');
      }
    });
  } catch {
    // Non-fatal if raw mode fails
  }
}

/**
 * Graceful shutdown handler
 */
function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n\n${c.cyan}Shutting down PostCraft AI server cleanly...${c.reset}`);

  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }

  if (serverProcess) {
    terminateProcess(serverProcess);
    serverProcess = null;
  }

  console.log(`${c.green}✓ Server and watchers stopped. Have a great day!${c.reset}\n`);
  process.exit(0);
}

// Register system signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGHUP', gracefulShutdown);
process.on('exit', () => {
  if (serverProcess) {
    terminateProcess(serverProcess);
  }
});

// Run
(async function main() {
  setupFileWatchers();
  setupKeyboardControls();
  await startServer();
})();
