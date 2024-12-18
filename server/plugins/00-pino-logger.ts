import pino from 'pino'
import { defineNitroPlugin } from 'nitropack/runtime'
import type { Logger } from 'pino'
import { pathResolver } from '../helpers/path.helper'
import type { LoggerConfig, LoggerOptions } from '~/server/interfaces/plugin-pino-logger'

let globalLogger: Logger | null = null

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig() as { private: LoggerConfig }

  const logFilePath = pathResolver(config.private?.log, true)
  const isProduction = process.env.NODE_ENV === 'production'

  globalLogger = pino(<LoggerOptions>{
    level: isProduction ? 'debug' : 'info',
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() }
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: isProduction
      ? undefined
      : {
          target: 'pino/file',
          options: {
            colorize: true,
            translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
            ignore: 'pid, hostname',
            destination: logFilePath,
          },
        },
    base: {
      app: 'myApp',
      environment: process.env.NODE_ENV ?? 'development',
    },
  })

  nitroApp.hooks.hook('request', (event) => {
    if (globalLogger) {
      event.context.logger = globalLogger
      console.log('Pino logger initialized and available globally')
    }
    else {
      console.warn('Warning Pino logger is not available !')
    }
  })
})

export const getLogger = (): Logger | null => {
  if (!globalLogger) {
    console.warn('Logger has not been initialized yet. Make sure the plugin has been loaded.')
  }
  return globalLogger
}
