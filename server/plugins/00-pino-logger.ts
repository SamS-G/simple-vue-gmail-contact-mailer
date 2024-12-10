import pino from 'pino'
import { defineNitroPlugin } from 'nitropack/runtime'
import { pathResolver } from '../helpers/path.helper'

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()
  const logFilePath = pathResolver(config.private?.log, true)
  const isProduction = process.env.NODE_ENV === 'production'

  // Créer l'instance de Pino
  const logger = pino({
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
      environment: process.env.NODE_ENV || 'development',
    },
  })
  nitroApp.hooks.hook('request', (event) => {
    event.context.logger = logger
  })
})
