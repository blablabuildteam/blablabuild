import { supabaseAdmin } from './supabase';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  sessionId?: string;
  endpoint?: string;
  userAgent?: string;
  ipAddress?: string;
  [key: string]: any;
}

/**
 * Logger utility that stores logs in Supabase for sharing with contributors
 * Replaces console.log/error/warn with persistent, shareable logs
 */
class Logger {
  private async writeLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    // Always log to console for immediate visibility
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleMethod(`[${level.toUpperCase()}]`, message, context || '');

    // Store in Supabase (non-blocking)
    try {
      const logData: any = {
        level,
        message,
        context: context || {},
        created_at: new Date().toISOString(),
      };

      if (context?.sessionId) {
        logData.session_id = context.sessionId;
      }

      if (context?.endpoint) {
        logData.endpoint = context.endpoint;
      }

      if (context?.userAgent) {
        logData.user_agent = context.userAgent;
      }

      if (context?.ipAddress) {
        logData.ip_address = context.ipAddress;
      }

      if (error?.stack) {
        logData.stack_trace = error.stack;
      }

      // Fire and forget - don't block execution if logging fails
      supabaseAdmin.from('logs').insert(logData).catch((err) => {
        // Only log to console if Supabase logging fails
        console.error('[Logger] Failed to write log to Supabase:', err);
      });
    } catch (err) {
      // Silently fail - don't break the app if logging fails
      console.error('[Logger] Error writing log:', err);
    }
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

