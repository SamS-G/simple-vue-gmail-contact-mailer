import { z } from 'zod'

export const storedTokensSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh_token can\'t be empty'),
  scope: z.string().min(1, 'Scope can\'t be empty'),
  access_token: z.string().min(1, 'access_token can\'t be empty'),
  token_type: z.string().min(1, 'token_type can\'t be empty'),
  expiry_date: z.number(),
})
