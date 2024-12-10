export interface LoggerConfig {
  /**
   * The private configuration key for the log file path.
   */
  log: string
}

export interface LoggerOptions {
  level: string
  formatters: {
    level: (label: string) => { level: string }
  }
  timestamp: () => string
  transport?: {
    target: string
    options: {
      colorize: boolean
      translateTime: string
      ignore: string
      destination: string
    }
  }
  base: {
    app: string
    environment: string
  }
}
