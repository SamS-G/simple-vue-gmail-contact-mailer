import { z } from 'zod'

export const StoredCredentialSchema = z.object({
  refresh_token: z.string(),
  scope: z.string(),
  access_token: z.string(),
  token_type: z.string(),
  expiry_date: z.number(),
})
