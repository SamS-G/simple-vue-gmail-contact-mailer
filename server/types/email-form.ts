export type EmailForm = {
  subject: string
  message: string
  reason?: string
  email: string
  name?: string
  submit?: boolean
} & Record<string, string | number | boolean>
