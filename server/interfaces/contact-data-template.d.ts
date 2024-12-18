// Interface de configuration du contact
import type { DynamicValuesObject } from '~/server/interfaces/dynamic-value-object'

export interface ContactConfig extends DynamicValuesObject {
  title: string
  button?: {
    title?: string
    link?: string
  }
  banner?: {
    h1?: string
    text?: string
  }
  footer?: {
    text?: string
  }
  metadata?: {
    year?: string
    timestamp?: string
  }

  contact?: {
    name?: string
    email?: string
    reason?: string
    subject?: string
    message?: string
  }
}
