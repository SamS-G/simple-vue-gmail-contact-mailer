import { z } from 'zod'

export const NewCredentialSchema = z.object({
  refresh_token: z.string().optional(),
  scope: z.string(),
  access_token: z.string(),
  token_type: z.string(),
  expiry_date: z.number(),
})
