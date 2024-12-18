import { z } from 'zod'

export const NewCredentialSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh_token can\'t be empty').optional(),
  scope: z.string().min(1, 'Scope can\'t be empty'),
  access_token: z.string().min(1, 'Access_token can\'t be empty'),
  token_type: z.string().min(1, 'Token_type can\'t be empty'),
  expiry_date: z.number().min(1, 'Expiry_date can\'t be empty'),
})
