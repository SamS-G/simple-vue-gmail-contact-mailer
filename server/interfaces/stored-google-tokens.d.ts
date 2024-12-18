export interface StoredGoogleTokens {
  [key: string]: string | number | undefined
  refresh_token: string
  scope?: string | undefined
  access_token: string
  token_type: string
  expiry_date: number
}
