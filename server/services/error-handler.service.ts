/**
 * Service to handle application errors, providing consistent error logging, formatting, and responses.
 */
import type { H3Error, H3Event } from 'h3'
import { createError } from 'h3'
import type { Logger } from 'pino'
import { ApplicationError } from '~/server/errors/custom-errors'
import type { ErrorHandlerConfig } from '~/server/interfaces/error-handler-config'
import type { ErrorDetails } from '~/server/interfaces/error-details'
import type { IErrorHandlerService } from '~/server/interfaces/services'

export class ErrorHandlerService implements IErrorHandlerService {
  private readonly env: string
  private readonly isDev: boolean
  private readonly logLevel: string

  constructor(
    private readonly config: ErrorHandlerConfig,
    private readonly logger: Logger,
  ) {
    this.config = config
    this.env = config.nodeEnv ?? 'development' // Determine the current environment
    this.isDev = this.env === 'development' // Check if it's a development environment
    this.logLevel = config.logLevel ?? 'error' // Default log level is 'error'
  }

  /**
   * Handles an error by logging it and sending a formatted error response.
   * @param event The current H3 event.
   * @param error The error to handle.
   */
  public handleError(event: H3Event, error: Error | ApplicationError): void {
    if (this.isDev) console.error('Error handler service :', error)

    try {
      this.logError(error) // Log the error
      this.sendError(event, error) // Send the error response
    }
    catch (err) {
      console.error('handleError failed!', err)
    }
  }

  /**
   * Constructs a detailed error object based on the type of error.
   * @param error The error to construct.
   * @returns A formatted error object.
   */
  private constructError(error: Error | ApplicationError) {
    try {
      const baseErrorConfig = {
        fatal: true,
        statusCode: 500,
      }

      if (error instanceof ApplicationError) {
        // Application-specific errors
        const errorCodePart = error.code ? `, code: ${error.code}` : ''
        return {
          ...baseErrorConfig,
          statusCode: error.statusCode ?? 500,
          statusMessage: errorCodePart,
          data: error.data,
          stackTrace: error.stack,
        }
      }

      // Generic errors
      return createError({
        ...baseErrorConfig,
        message: error.message,
        data: this.isDev ? { stack: error.stack } : undefined, // Include stack trace in dev mode
      })
    }
    catch (err) {
      const error = <Error>err
      throw new Error(`A critical system error has occurred in ErrorHandlerService => ${error.message}`, error)
    }
  }

  /**
   * Sends a formatted error response to the client.
   * @param event The current H3 event.
   * @param error The error to send.
   */
  private sendError(event: H3Event, error: Error | ApplicationError) {
    const err = this.constructError(error) as H3Error
    sendError(event, err, true) // Send the error response
  }

  /**
   * Logs an error using the logger or console if the logger is unavailable.
   * @param error The error to log.
   */
  private logError(error: Error | ApplicationError): void {
    if (!this.logger) {
      console.error('Logger is not initialized')
      return
    }

    // Helper function to build error details
    const buildErrorDetails = (error: Error | ApplicationError): ErrorDetails => {
      const details: ErrorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack && this.isDev ? this.normalizeStackTrace(error.stack) : undefined,
      }

      // Additional data for ApplicationError
      if (error instanceof ApplicationError) {
        details.data = this.isDev && error.data ? error.data : undefined
        details.code = 'code' in error ? error.code : undefined
      }
      return details
    }

    // Build the error details once to avoid duplication
    const details = buildErrorDetails(error)

    // Determine log level based on the error status code for ApplicationError
    const level = error instanceof ApplicationError
      ? this.getLogLevel(error.statusCode ?? 500)
      : 'error'

    try {
      this.logger[level](details) // Log error
    }
    catch (err) {
      console.warn('Pino logger have a problem ! No log files generated', err)
    }
  }

  /**
   * Determines the appropriate log level based on the status code.
   * @param statusCode The HTTP status code of the error.
   * @returns The log level ('error', 'warn', or 'info').
   */
  private getLogLevel(statusCode?: number): 'error' | 'warn' | 'info' {
    if (!statusCode) return 'error'
    if (statusCode >= 500) return 'error' // Server errors
    if (statusCode >= 400) return 'warn' // Client errors
    return 'info' // Informational logs
  }

  /**
   * Normalizes stack traces to remove full paths and keep only filenames with line/column numbers.
   * @param stackTrace The original stack trace.
   * @returns A normalized stack trace.
   */
  private normalizeStackTrace(stackTrace: string): string {
    // Split the stack trace into individual lines
    const lines = stackTrace.split('\n')

    // Normalize each line to show only filenames and line/column numbers
    const normalizedLines = lines.map((line) => {
      const match = (/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/).exec(line)
      if (match) {
        const [, functionName, filename, lineNumber, columnNumber] = match
        const shortFilename = filename.split('/').pop() // Extract the file name
        return `at ${functionName} (${shortFilename}:${lineNumber}:${columnNumber})`
      }
      return line // Return the original line if no match
    })

    // Join the normalized lines back together
    return normalizedLines.join('\n')
  }
}
