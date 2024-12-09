import type { Credentials, OAuth2Client } from 'google-auth-library'
import type { H3Error, H3Event } from 'h3'
import type { Schema } from 'yup'
import type { z, ZodIssue } from 'zod'
import type { ApplicationError } from '~/server/errors/custom-errors'
import type { EmailForm } from '~/server/types/email-form'
import type { ReplacementValue } from '~/server/types/replacement-value'
import type { Email } from '~/server/types/email'

export interface IGmailService {
  sendGmail(emailForm: EmailForm, access_token: string): Promise<{ success: boolean, message: string }>
}
export interface IValidationService {
  yupDataValidate<T>(data: T, validationSchema: Schema<T>): Promise<T>
  validateType<T>(obj: unknown, schema: z.ZodType<T, z.ZodTypeDef, T>): {
    success: true
    type: 'validated'
    data: T
  } | {
    success: false
    type: 'error'
    errors: ZodIssue[] | unknown
  }
  compareDates(tokenExpiration: number): boolean
}
export interface IGmailApiService {
  newAuth(): void
  getNewCredentials(refreshToken: string): Promise<Credentials>
  getAuth(): OAuth2Client
  send(encodedEmail: string, access_token: string): Promise<{ success: boolean, message: string }>
}
export interface IErrorHandlerService {
  handleError(event: H3Event, error: Error | ApplicationError | H3Error & { statusCode?: number, data?: never }): void
}
export interface ITokenManagerService {
  getCredentialsFromStorage(): Promise<string>
}
export interface IEmailConfigService {
  createGmailConfig(emailForm: Email): string
}
export interface ITemplateService {
  createTemplate(data: Record<string, ReplacementValue>): Promise<Record<string, string>>
}
