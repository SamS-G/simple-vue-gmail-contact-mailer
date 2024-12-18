import type { DynamicValuesObject } from '~/server/interfaces/dynamic-value-object'

export interface BaseEmailData extends DynamicValuesObject {
  header?: {
    img_url?: string
    img_alt?: string
  }
  email: string
  address: string
  phone: string
  year: string
  metadata?: {
    year?: string
    timestamp?: string
  }
  company?: {
    name?: string
    domain?: string
  }
}
