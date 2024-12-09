import type { H3Error, H3Event } from 'h3'
import { createError } from 'h3'
import { ApplicationError } from '~/server/errors/custom-errors'
import type { ErrorHandlerConfig } from '~/server/interfaces/error-handler-config'
import type { ErrorDetails } from '~/server/interfaces/error-details'
import type { IErrorHandlerService } from '~/server/interfaces/services'
import type { IPluginPinoLogger } from '~/server/interfaces/plugin-pino-logger'

export class ErrorHandlerService implements IErrorHandlerService {
  private readonly env: string
  private readonly isDev: boolean
  private readonly logLevel: string
  private logger: IPluginPinoLogger | undefined

  constructor(
    private config: ErrorHandlerConfig,
  ) {
    this.logger = undefined
    this.config = config
    this.env = config.nodeEnv || 'development'
    this.isDev = this.env === 'development'
    this.logLevel = config.logLevel || 'error'
  }

  public handleError(event: H3Event, error: Error | ApplicationError): void {
    if (this.isDev) console.error('Error handler service :', error)

    this.logger = event.context.logger

    try {
      this.logError(error)
      this.sendError(event, error)
    }
    catch (err) {
      console.error('handleError failed !', err)
    }
  }

  private constructError(error: Error | ApplicationError) {
    try {
      const baseErrorConfig = {
        fatal: true,
        statusCode: 500,
      }
      if (error instanceof ApplicationError) {
        return {
          ...baseErrorConfig,
          statusCode: error.statusCode ?? 500,
          statusMessage: `${error.message}${error.code ? `, code: ${error.code}` : ''}`,
          data: error.data,
          stackTrace: error.stack,
        }
      }
      return createError({
        ...baseErrorConfig,
        message: error.message,
        data: this.isDev ? { stack: error.stack } : undefined,
      })
    }
    catch (err) {
      const error = <Error>err
      throw new Error(`A critical system error has occurred from ErrorHandlerService => ${error.message}`, error)
    }
  }

  private sendError(event: H3Event, error: Error | ApplicationError) {
    const err = this.constructError(error) as H3Error
    sendError(event, err, true)
  }

  private logError(error: Error | ApplicationError): void {
    if (error instanceof ApplicationError) {
      const details: ErrorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack && this.isDev ? this.normalizeStackTrace(error.stack) : undefined,
        data: (error.data && this.isDev) ? error.data : undefined,
        code: 'code' in error ? error.code : undefined,
      }

      const level = this.getLogLevel(error.statusCode ?? 500)

      if (this.logger) {
        (this.logger[level as keyof typeof this.logger] as (message: string | ErrorDetails) => void)(details)
      }
    }
    else {
      console.error('Logger unavailable. No log files generated')
    }
  }

  private getLogLevel(statusCode?: number): 'error' | 'warn' | 'info' {
    if (!statusCode) return 'error'
    if (statusCode >= 500) return 'error'
    if (statusCode >= 400) return 'warn'
    return 'info'
  }

  private normalizeStackTrace(stackTrace: string) {
    // Split the stack trace into individual lines
    const lines = stackTrace.split('\n')

    // Remove full path, keep only filename and line/column numbers
    const normalizedLines = lines.map((line) => {
      const match = line.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/)
      if (match) {
        const [, functionName, filename, lineNumber, columnNumber] = match
        const shortFilename = filename.split('/').pop()
        return `at ${functionName} (${shortFilename}:${lineNumber}:${columnNumber})`
      }
      return line
    })

    // Join the lines back together
    return normalizedLines.join('\n')
  }
  // private shouldNotifyCriticalError(error: Error & { statusCode?: number }): boolean {
  //   return this.env === 'production' && (error.statusCode || 500) >= 500
  // }
  // private notifyCriticalError(error: Error & { statusCode?: number }): void {
  //   const details: ErrorDetails = {
  //     timestamp: new Date().toISOString(),
  //     name: error.name,
  //     message: error.message,
  //     stack: this.isDev ? error.stack : undefined,
  //   }
  // console.error('Critical error notification:', details)
  // Implémentation de la notification (ex: Slack, Email, etc.)
  // if (this.config.notificationEndpoint) { ... }
  // }
}
