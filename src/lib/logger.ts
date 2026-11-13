/**
 * PostCraft AI - Unified Universal Logger
 *
 * Provides distinct separation for Backend and Frontend logs:
 * - Clear [BACKEND] and [FRONTEND] visual tags in Node.js server terminal (with vibrant ANSI truecolor).
 * - Rich CSS badge pill styling in browser console.
 * - Automatic client-to-server sync: browser logs are automatically forwarded to /api/logs
 *   so developers can view both backend and frontend logs together in terminal or separated.
 * - Persistent log files in logs/ directory:
 *     - logs/backend.log
 *     - logs/frontend.log
 *     - logs/combined.log
 * - In-memory history buffer (capped at 500 entries) with real-time UI event dispatching.
 */

export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error';
export type LogSource = 'backend' | 'frontend';

export interface LogEntry {
  id: string;
  timestamp: string;
  epoch: number;
  level: LogLevel;
  scope: string;
  message: string;
  data?: unknown;
  source: LogSource;
}

// In-memory buffer of recent logs (capped at 500)
const MAX_LOGS = 500;
const logBuffer: LogEntry[] = [];

// Environment checks
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isNode = !isBrowser && typeof process !== 'undefined' && Boolean(process.versions?.node);

// ANSI color escape codes for Node.js terminal
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright / Vibrant colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',

  // 24-bit Truecolor helper
  brandViolet: '\x1b[38;2;168;85;247m',   // #a855f7
  brandIndigo: '\x1b[38;2;99;102;241m',   // #6366f1
  brandPink: '\x1b[38;2;236;72;153m',     // #ec4899
  brandEmerald: '\x1b[38;2;34;197;94m',   // #22c55e
  brandSky: '\x1b[38;2;14;165;233m',      // #0ea5e9
  brandAmber: '\x1b[38;2;245;158;11m',    // #f59e0b
  brandRose: '\x1b[38;2;244;63;94m',      // #f43f5e
  darkGray: '\x1b[38;2;113;113;122m',     // #71717a
};

function getFormattedTime(): string {
  const d = new Date();
  const pad = (n: number, s = 2) => String(n).padStart(s, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// ============================================================================
// FILE LOGGING (Node.js Server Only)
// ============================================================================

let fsModule: typeof import('node:fs') | null = null;
let pathModule: typeof import('node:path') | null = null;
let logsDirInitialized = false;
let logsDirPath = '';

if (isNode) {
  try {
    // Dynamic synchronous require to prevent bundler complications in browser builds
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fsModule = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    pathModule = require('path');
    if (pathModule && fsModule) {
      logsDirPath = pathModule.join(process.cwd(), 'logs');
      if (!fsModule.existsSync(logsDirPath)) {
        fsModule.mkdirSync(logsDirPath, { recursive: true });
      }
      logsDirInitialized = true;
    }
  } catch {
    // Ignore in edge runtime or non-fs environments
  }
}

function writeToFile(entry: LogEntry) {
  if (!logsDirInitialized || !fsModule || !pathModule) return;

  try {
    const isoTime = new Date(entry.epoch).toISOString();
    const sourceTag = entry.source === 'backend' ? '[BACKEND] ' : '[FRONTEND]';
    const levelTag = `[${entry.level.toUpperCase()}]`.padEnd(9);
    const scopeTag = `[${entry.scope.toUpperCase()}]`.padEnd(12);

    let dataStr = '';
    if (entry.data !== undefined) {
      try {
        dataStr = ` ${JSON.stringify(entry.data)}`;
      } catch {
        dataStr = ' [Unserializable data]';
      }
    }

    const logLine = `[${isoTime}] ${sourceTag} ${levelTag} ${scopeTag} ${entry.message}${dataStr}\n`;

    // 1. Write to specific source log file (logs/backend.log or logs/frontend.log)
    const specificLogFile = pathModule.join(logsDirPath, `${entry.source}.log`);
    fsModule.appendFileSync(specificLogFile, logLine, { encoding: 'utf8' });

    // 2. Write to unified combined log file (logs/combined.log)
    const combinedLogFile = pathModule.join(logsDirPath, 'combined.log');
    fsModule.appendFileSync(combinedLogFile, logLine, { encoding: 'utf8' });
  } catch {
    // Fail silently to avoid interrupting execution
  }
}

// ============================================================================
// BROWSER TO SERVER SYNC QUEUE
// ============================================================================

let clientQueue: LogEntry[] = [];
let clientSyncTimer: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;

function flushClientQueue() {
  if (!isBrowser || clientQueue.length === 0 || isSyncing) return;

  const logsToSend = [...clientQueue];
  clientQueue = [];
  isSyncing = true;

  try {
    const payload = JSON.stringify({ logs: logsToSend });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/logs', blob);
      if (sent) {
        isSyncing = false;
        return;
      }
    }

    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
      .catch(() => {
        // Silently swallow sync failures
      })
      .finally(() => {
        isSyncing = false;
      });
  } catch {
    isSyncing = false;
  }
}

function scheduleClientSync(entry: LogEntry) {
  if (!isBrowser) return;

  // Don't forward logs emitted by the sync operation itself to avoid loops
  if (entry.scope === 'LOG_SYNC') return;

  clientQueue.push(entry);

  if (clientQueue.length >= 10) {
    flushClientQueue();
    return;
  }

  if (clientSyncTimer) {
    clearTimeout(clientSyncTimer);
  }

  clientSyncTimer = setTimeout(() => {
    flushClientQueue();
  }, 250);
}

// Ensure pending browser logs flush on page unload
if (isBrowser) {
  try {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushClientQueue();
      }
    });
    window.addEventListener('pagehide', () => {
      flushClientQueue();
    });
  } catch {
    // Safe fallback
  }
}

// ============================================================================
// BUFFER MANAGEMENT
// ============================================================================

function pushToBuffer(entry: LogEntry) {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.shift();
  }

  if (isBrowser) {
    try {
      window.dispatchEvent(new CustomEvent('postcraft:log', { detail: entry }));
      const w = window as unknown as { __POSTCRAFT_LOGS__?: LogEntry[] };
      if (!w.__POSTCRAFT_LOGS__) w.__POSTCRAFT_LOGS__ = [];
      w.__POSTCRAFT_LOGS__.push(entry);
      if (w.__POSTCRAFT_LOGS__.length > MAX_LOGS) w.__POSTCRAFT_LOGS__.shift();
    } catch {
      // Ignore
    }
    scheduleClientSync(entry);
  } else if (isNode) {
    writeToFile(entry);
  }
}

// ============================================================================
// TERMINAL LOG PRINTER (Node.js Server)
// ============================================================================

function logToServer(entry: LogEntry) {
  const time = entry.timestamp;

  // Level badge
  let levelBadge = '';
  switch (entry.level) {
    case 'success':
      levelBadge = `${ANSI.brightGreen}${ANSI.bold}✓ SUCCESS${ANSI.reset}`;
      break;
    case 'info':
      levelBadge = `${ANSI.brightCyan}${ANSI.bold}ℹ INFO   ${ANSI.reset}`;
      break;
    case 'warn':
      levelBadge = `${ANSI.brightYellow}${ANSI.bold}⚠ WARN   ${ANSI.reset}`;
      break;
    case 'error':
      levelBadge = `${ANSI.brightRed}${ANSI.bold}✗ ERROR  ${ANSI.reset}`;
      break;
    case 'debug':
      levelBadge = `${ANSI.brightMagenta}${ANSI.bold}⚡ DEBUG  ${ANSI.reset}`;
      break;
  }

  // Source Badge: [BACKEND] vs [FRONTEND]
  const sourceTag =
    entry.source === 'backend'
      ? `${ANSI.brandIndigo}${ANSI.bold}[BACKEND] ${ANSI.reset}`
      : `${ANSI.brandEmerald}${ANSI.bold}[FRONTEND]${ANSI.reset}`;

  // Brand tag & scope badge
  const brandTag = `${ANSI.brandViolet}${ANSI.bold}[PostCraft]${ANSI.reset}`;
  const timeTag = `${ANSI.darkGray}${time}${ANSI.reset}`;
  const paddedScope = `[${entry.scope.toUpperCase()}]`.padEnd(12);
  const scopeTag = `${ANSI.brightBlue}${paddedScope}${ANSI.reset}`;

  const header = `${brandTag} ${timeTag} ${sourceTag} ${scopeTag} ${levelBadge}  ${entry.message}`;

  if (entry.level === 'error') {
    if (entry.data !== undefined) {
      console.error(header, entry.data);
    } else {
      console.error(header);
    }
  } else if (entry.level === 'warn') {
    if (entry.data !== undefined) {
      console.warn(header, entry.data);
    } else {
      console.warn(header);
    }
  } else {
    if (entry.data !== undefined) {
      console.log(header, entry.data);
    } else {
      console.log(header);
    }
  }
}

// ============================================================================
// BROWSER CONSOLE LOG PRINTER (Client Browser)
// ============================================================================

function logToBrowser(entry: LogEntry) {
  const time = entry.timestamp;

  // CSS badge styles for DevTools
  const brandStyle =
    'background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); color: #ffffff; font-weight: 700; padding: 2px 7px; border-radius: 4px; font-size: 10px; text-shadow: 0 1px 1px rgba(0,0,0,0.4);';
  const timeStyle =
    'background: #18181b; color: #71717a; padding: 2px 5px; border-radius: 4px; font-size: 10px; font-family: monospace; border: 1px solid #27272a;';
  const sourceStyle =
    entry.source === 'backend'
      ? 'background: #1e1b4b; color: #818cf8; border: 1px solid #4338ca; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;'
      : 'background: #022c22; color: #34d399; border: 1px solid #059669; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;';
  const scopeStyle =
    'background: #27272a; color: #e4e4e7; border: 1px solid #3f3f46; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;';

  let levelStyle = '';
  let levelIcon = '';
  switch (entry.level) {
    case 'success':
      levelIcon = '✓';
      levelStyle =
        'background: #052e16; color: #4ade80; border: 1px solid #16a34a; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;';
      break;
    case 'info':
      levelIcon = 'ℹ';
      levelStyle =
        'background: #082f49; color: #38bdf8; border: 1px solid #0284c7; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;';
      break;
    case 'warn':
      levelIcon = '⚠';
      levelStyle =
        'background: #451a03; color: #fbbf24; border: 1px solid #d97706; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;';
      break;
    case 'error':
      levelIcon = '✗';
      levelStyle =
        'background: #450a0a; color: #f87171; border: 1px solid #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;';
      break;
    case 'debug':
      levelIcon = '⚡';
      levelStyle =
        'background: #2e1065; color: #c084fc; border: 1px solid #7c3aed; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;';
      break;
  }

  const msgStyle = 'color: #f4f4f5; font-size: 11px; font-weight: 500; margin-left: 4px;';

  const sourceLabel = entry.source.toUpperCase();
  const formatStr = `%cPostCraft%c %c${time}%c %c[${sourceLabel}]%c %c${entry.scope.toUpperCase()}%c %c${levelIcon} ${entry.level.toUpperCase()}%c ${entry.message}`;
  const styles = [
    brandStyle,
    '',
    timeStyle,
    '',
    sourceStyle,
    '',
    scopeStyle,
    '',
    levelStyle,
    msgStyle,
  ];

  if (entry.level === 'error') {
    if (entry.data !== undefined) {
      console.error(formatStr, ...styles, entry.data);
    } else {
      console.error(formatStr, ...styles);
    }
  } else if (entry.level === 'warn') {
    if (entry.data !== undefined) {
      console.warn(formatStr, ...styles, entry.data);
    } else {
      console.warn(formatStr, ...styles);
    }
  } else {
    if (entry.data !== undefined) {
      console.log(formatStr, ...styles, entry.data);
    } else {
      console.log(formatStr, ...styles);
    }
  }
}

// ============================================================================
// PRIMARY DISPATCH METHOD
// ============================================================================

export function log(
  level: LogLevel,
  scope: string,
  message: string,
  data?: unknown,
  explicitSource?: LogSource | 'server' | 'client'
) {
  // Normalize source
  let source: LogSource;
  if (explicitSource === 'frontend' || explicitSource === 'client') {
    source = 'frontend';
  } else if (explicitSource === 'backend' || explicitSource === 'server') {
    source = 'backend';
  } else {
    source = isBrowser ? 'frontend' : 'backend';
  }

  const entry: LogEntry = {
    id: generateId(),
    timestamp: getFormattedTime(),
    epoch: Date.now(),
    level,
    scope,
    message,
    data,
    source,
  };

  pushToBuffer(entry);

  if (isBrowser) {
    logToBrowser(entry);
  } else {
    logToServer(entry);
  }
}

/**
 * Creates a scoped logger instance for a specific component or subsystem
 */
export function createLogger(scope: string, defaultSource?: LogSource | 'server' | 'client') {
  return {
    debug: (message: string, data?: unknown) => log('debug', scope, message, data, defaultSource),
    info: (message: string, data?: unknown) => log('info', scope, message, data, defaultSource),
    success: (message: string, data?: unknown) => log('success', scope, message, data, defaultSource),
    warn: (message: string, data?: unknown) => log('warn', scope, message, data, defaultSource),
    error: (message: string, data?: unknown) => log('error', scope, message, data, defaultSource),
  };
}

// ============================================================================
// PRE-CONFIGURED SCATEGORIZED LOGGERS
// ============================================================================

export const logger = {
  // Direct level methods (auto-detects source)
  debug: (message: string, data?: unknown) => log('debug', 'APP', message, data),
  info: (message: string, data?: unknown) => log('info', 'APP', message, data),
  success: (message: string, data?: unknown) => log('success', 'APP', message, data),
  warn: (message: string, data?: unknown) => log('warn', 'APP', message, data),
  error: (message: string, data?: unknown) => log('error', 'APP', message, data),

  // Dedicated Backend Loggers
  backend: createLogger('BACKEND', 'backend'),
  server: createLogger('SERVER', 'backend'),
  api: createLogger('API', 'backend'),
  ai: createLogger('AI-FLUX', 'backend'),
  db: createLogger('DATABASE', 'backend'),
  scheduler: createLogger('SCHEDULER', 'backend'),
  pinterest: createLogger('PINTEREST', 'backend'),
  sheets: createLogger('SHEETS', 'backend'),
  auth: createLogger('AUTH', 'backend'),
  notifications: createLogger('NOTIFY', 'backend'),

  // Dedicated Frontend Loggers
  frontend: createLogger('FRONTEND', 'frontend'),
  client: createLogger('CLIENT', 'frontend'),
  studio: createLogger('STUDIO', 'frontend'),
  queue: createLogger('QUEUE', 'frontend'),
  ui: createLogger('UI', 'frontend'),

  // Custom scoped logger factory
  scope: (name: string, source?: LogSource | 'server' | 'client') => createLogger(name, source),

  // Ingest logs originating remotely (e.g. from frontend via /api/logs)
  recordRemoteLog: (entry: Partial<LogEntry> & { message: string; scope?: string; level?: LogLevel }) => {
    const fullEntry: LogEntry = {
      id: entry.id || generateId(),
      timestamp: entry.timestamp || getFormattedTime(),
      epoch: entry.epoch || Date.now(),
      level: entry.level || 'info',
      scope: entry.scope || 'FRONTEND',
      message: entry.message,
      data: entry.data,
      source: entry.source === 'backend' ? 'backend' : 'frontend',
    };

    // Push into memory buffer and write to disk
    logBuffer.push(fullEntry);
    if (logBuffer.length > MAX_LOGS) logBuffer.shift();

    if (isNode) {
      writeToFile(fullEntry);
      logToServer(fullEntry);
    }
  },

  // Buffer queries with filtering
  getHistory: (filter?: {
    source?: LogSource | 'all';
    level?: LogLevel | 'all';
    search?: string;
    limit?: number;
  }): LogEntry[] => {
    let result = [...logBuffer];

    if (filter?.source && filter.source !== 'all') {
      result = result.filter((e) => e.source === filter.source);
    }

    if (filter?.level && filter.level !== 'all') {
      result = result.filter((e) => e.level === filter.level);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.message.toLowerCase().includes(q) ||
          e.scope.toLowerCase().includes(q) ||
          e.level.toLowerCase().includes(q)
      );
    }

    if (filter?.limit && filter.limit > 0) {
      result = result.slice(-filter.limit);
    }

    return result;
  },

  // Truncate logs
  clearHistory: (source?: LogSource | 'all') => {
    if (!source || source === 'all') {
      logBuffer.length = 0;
    } else {
      for (let i = logBuffer.length - 1; i >= 0; i--) {
        if (logBuffer[i].source === source) {
          logBuffer.splice(i, 1);
        }
      }
    }

    // Truncate log files if on server
    if (isNode && logsDirInitialized && fsModule && pathModule) {
      try {
        if (!source || source === 'all' || source === 'backend') {
          fsModule.writeFileSync(pathModule.join(logsDirPath, 'backend.log'), '');
        }
        if (!source || source === 'all' || source === 'frontend') {
          fsModule.writeFileSync(pathModule.join(logsDirPath, 'frontend.log'), '');
        }
        if (!source || source === 'all') {
          fsModule.writeFileSync(pathModule.join(logsDirPath, 'combined.log'), '');
        }
      } catch {
        // Safe fallback
      }
    }
  },
};

export default logger;
