import { ucfirst } from '@/lib/util';

export const LogLevel = {
    INFO: 0,
    DEBUG: 1,
    NOTICE: 2,
    WARNING: 3,
    ERROR: 4,
} as const;

export type LogLevelName = keyof typeof LogLevel;
export type LogLevel = (typeof LogLevel)[LogLevelName];

const levelEntries = Object.entries(LogLevel) as [LogLevelName, LogLevel][];

export function logLevelName(level: LogLevel): LogLevelName {
    for (const [k, v] of levelEntries) {
        if (v === level) {
            return k;
        }
    }

    return null as never;
}

export type LogContext = Record<string, any>;

export interface LoggerAdapter {
    log(level: LogLevel, message: string, context?: LogContext): void;

    _health(): true | { reason: string; timestamp: number };
}

class StdoutLoggerAdapter implements LoggerAdapter {
    _health(): true | { reason: string; timestamp: number } {
        if (typeof console === 'undefined') {
            return { reason: '???', timestamp: Date.now() };
        }

        return true;
    }

    log(level: LogLevel, message: string, context?: LogContext): void {
        switch (level) {
            case LogLevel.INFO:
            case LogLevel.DEBUG:
                console.log(`${ucfirst(logLevelName(level).toLowerCase())}: ${message}`, context);
                break;

            case LogLevel.NOTICE:
                console.log(`Notice: !!!${message}!!!`, context);
                break;

            case LogLevel.WARNING:
            case LogLevel.ERROR:
                console.error(`${ucfirst(logLevelName(level).toLowerCase())}: ${message}`, context);
                break;
        }
    }
}

let envLogger: Logger | null = null;

export default class Logger {
    readonly #adapter: LoggerAdapter;

    static fromEnv(): Logger {
        if (!envLogger) {
            envLogger = new Logger(new StdoutLoggerAdapter());
        }

        // TODO(hauschwitz): production logger
        return envLogger;
    }

    constructor(adapter: LoggerAdapter) {
        this.#adapter = adapter;
    }

    info(message: string, context?: LogContext) {
        return this.#adapter.log(LogLevel.INFO, message, context);
    }

    debug(message: string, context?: LogContext) {
        return this.#adapter.log(LogLevel.DEBUG, message, context);
    }

    notice(message: string, context?: LogContext) {
        return this.#adapter.log(LogLevel.NOTICE, message, context);
    }

    warning(message: string, context?: LogContext) {
        return this.#adapter.log(LogLevel.WARNING, message, context);
    }

    error(message: string, context?: LogContext) {
        return this.#adapter.log(LogLevel.ERROR, message, context);
    }

    checkHealth(): ReturnType<LoggerAdapter['_health']> {
        return this.#adapter._health();
    }
}
