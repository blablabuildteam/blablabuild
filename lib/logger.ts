export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  sessionId?: string;
  endpoint?: string;
  userAgent?: string;
  ipAddress?: string;
  [key: string]: any;
}

/**
 * Simple logger utility using console
 */
class Logger {
  private writeLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const timestamp = new Date().toISOString();
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    
    const logData = {
      timestamp,
      level,
      message,
      ...context,
      ...(error?.stack ? { stack: error.stack } : {}),
    };
    
    consoleMethod(`[${level.toUpperCase()}] ${timestamp}`, message, context || '');
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.writeLog('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.writeLog('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | string, context?: LogContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.writeLog('error', message, context, errorObj);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      this.writeLog('debug', message, context);
    }
  }

  /**
   * Create a logger instance with default context
   */
  withContext(defaultContext: LogContext): LoggerInstance {
    return {
      info: (message: string, context?: LogContext) => 
        this.info(message, { ...defaultContext, ...context }),
      warn: (message: string, context?: LogContext) => 
        this.warn(message, { ...defaultContext, ...context }),
      error: (message: string, error?: Error | string, context?: LogContext) => 
        this.error(message, error, { ...defaultContext, ...context }),
      debug: (message: string, context?: LogContext) => 
        this.debug(message, { ...defaultContext, ...context }),
    };
  }
}

export interface LoggerInstance {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: Error | string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions that match console API
export const log = logger.info.bind(logger);
export const logError = logger.error.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logDebug = logger.debug.bind(logger);
