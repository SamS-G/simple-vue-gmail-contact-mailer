export interface StoredGoogleCredentials {
  [key: string]: string | number
  refresh_token: string
  scope: string
  access_token: string
  token_type: string
  expiry_date: number
}
