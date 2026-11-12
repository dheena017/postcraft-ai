/**
 * PostCraft AI - Universal Colorful & Stylish Logger
 *
 * Provides vibrant ANSI-colored terminal logs on the server (Node.js)
 * and rich CSS-styled pill badge logs in the browser console.
 * Also maintains an in-memory history buffer and browser event broadcast
 * for live in-app log visualizers.
 */

export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  epoch: number;
  level: LogLevel;
  scope: string;
  message: string;
  data?: unknown;
  source: 'server' | 'client';
}

// In-memory buffer of recent logs (capped at 300)
const MAX_LOGS = 300;
const logBuffer: LogEntry[] = [];

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

// Check if running in browser
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

function getFormattedTime(): string {
  const d = new Date();
  const pad = (n: number, s = 2) => String(n).padStart(s, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function pushToBuffer(entry: LogEntry) {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.shift();
  }

  // If in browser, broadcast custom event so UI log drawers can re-render instantly
  if (isBrowser) {
    try {
      window.dispatchEvent(new CustomEvent('postcraft:log', { detail: entry }));
      // Also store on window for quick devtools inspection
      const w = window as unknown as { __POSTCRAFT_LOGS__?: LogEntry[] };
      if (!w.__POSTCRAFT_LOGS__) w.__POSTCRAFT_LOGS__ = [];
      w.__POSTCRAFT_LOGS__.push(entry);
      if (w.__POSTCRAFT_LOGS__.length > MAX_LOGS) w.__POSTCRAFT_LOGS__.shift();
    } catch {
      // Ignore if event dispatch fails
    }
  }
}

/**
 * Server-side terminal log printer with ANSI colors
 */
function logToServer(level: LogLevel, scope: string, message: string, data?: unknown) {
  const time = getFormattedTime();

  // Pick level badge with emoji and colors
  let levelBadge = '';
  switch (level) {
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

  // Format brand tag and scope badge with crisp column alignment
  const brandTag = `${ANSI.brandViolet}${ANSI.bold}[PostCraft]${ANSI.reset}`;
  const timeTag = `${ANSI.darkGray}${time}${ANSI.reset}`;
  const paddedScope = `[${scope.toUpperCase()}]`.padEnd(12);
  const scopeTag = `${ANSI.brandIndigo}${paddedScope}${ANSI.reset}`;

  const header = `${brandTag} ${timeTag} ${scopeTag} ${levelBadge}  ${message}`;

  if (level === 'error') {
    if (data !== undefined) {
      console.error(header, data);
    } else {
      console.error(header);
    }
  } else if (level === 'warn') {
    if (data !== undefined) {
      console.warn(header, data);
    } else {
      console.warn(header);
    }
  } else {
    if (data !== undefined) {
      console.log(header, data);
    } else {
      console.log(header);
    }
  }
}

/**
 * Client-side browser console log printer with rich CSS %c styles
 */
function logToBrowser(level: LogLevel, scope: string, message: string, data?: unknown) {
  const time = getFormattedTime();

  // CSS badge styles for Chrome/Firefox/Edge DevTools
  const brandStyle =
    'background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); color: #ffffff; font-weight: 700; padding: 2px 7px; border-radius: 4px; font-size: 10px; text-shadow: 0 1px 1px rgba(0,0,0,0.4);';
  const timeStyle =
    'background: #18181b; color: #71717a; padding: 2px 5px; border-radius: 4px; font-size: 10px; font-family: monospace; border: 1px solid #27272a;';
  const scopeStyle =
    'background: #1e1b4b; color: #a5b4fc; border: 1px solid #4338ca; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;';

  let levelStyle = '';
  let levelIcon = '';
  switch (level) {
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

  const formatStr = `%cPostCraft%c %c${time}%c %c${scope.toUpperCase()}%c %c${levelIcon} ${level.toUpperCase()}%c ${message}`;
  const styles = [
    brandStyle,
    '',
    timeStyle,
    '',
    scopeStyle,
    '',
    levelStyle,
    msgStyle,
  ];

  if (level === 'error') {
    if (data !== undefined) {
      console.error(formatStr, ...styles, data);
    } else {
      console.error(formatStr, ...styles);
    }
  } else if (level === 'warn') {
    if (data !== undefined) {
      console.warn(formatStr, ...styles, data);
    } else {
      console.warn(formatStr, ...styles);
    }
  } else {
    if (data !== undefined) {
      console.log(formatStr, ...styles, data);
    } else {
      console.log(formatStr, ...styles);
    }
  }
}

/**
 * Primary dispatch method that saves log to memory buffer and outputs to console
 */
export function log(level: LogLevel, scope: string, message: string, data?: unknown) {
  const entry: LogEntry = {
    id: generateId(),
    timestamp: getFormattedTime(),
    epoch: Date.now(),
    level,
    scope,
    message,
    data,
    source: isBrowser ? 'client' : 'server',
  };

  pushToBuffer(entry);

  if (isBrowser) {
    logToBrowser(level, scope, message, data);
  } else {
    logToServer(level, scope, message, data);
  }
}

/**
 * Creates a scoped logger instance for a particular component or service
 */
export function createLogger(scope: string) {
  return {
    debug: (message: string, data?: unknown) => log('debug', scope, message, data),
    info: (message: string, data?: unknown) => log('info', scope, message, data),
    success: (message: string, data?: unknown) => log('success', scope, message, data),
    warn: (message: string, data?: unknown) => log('warn', scope, message, data),
    error: (message: string, data?: unknown) => log('error', scope, message, data),
  };
}

/**
 * Pre-configured categorized loggers for common subsystems
 */
export const logger = {
  // Direct level methods with default scope
  debug: (message: string, data?: unknown) => log('debug', 'APP', message, data),
  info: (message: string, data?: unknown) => log('info', 'APP', message, data),
  success: (message: string, data?: unknown) => log('success', 'APP', message, data),
  warn: (message: string, data?: unknown) => log('warn', 'APP', message, data),
  error: (message: string, data?: unknown) => log('error', 'APP', message, data),

  // Scoped sub-loggers
  server: createLogger('SERVER'),
  api: createLogger('API'),
  ai: createLogger('AI-FLUX'),
  db: createLogger('DATABASE'),
  scheduler: createLogger('SCHEDULER'),
  pinterest: createLogger('PINTEREST'),
  notifications: createLogger('NOTIFY'),
  auth: createLogger('AUTH'),
  studio: createLogger('STUDIO'),
  queue: createLogger('QUEUE'),
  client: createLogger('CLIENT'),

  // Custom scoped logger factory
  scope: (name: string) => createLogger(name),

  // Buffer accessors
  getHistory: () => [...logBuffer],
  clearHistory: () => {
    logBuffer.length = 0;
  },
};

export default logger;

