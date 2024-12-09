import type { NitroApp } from 'nitropack/types'
import type { ErrorDetails } from '~/server/interfaces/error-details'

export interface IPluginPinoLogger extends NitroApp {
  logger?: {
    info: (message: string | ErrorDetails) => void
    warn: (message: string | ErrorDetails) => void
    error: (message: string | ErrorDetails) => void
  }
}
