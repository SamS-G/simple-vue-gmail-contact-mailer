export interface NewGoogleCredentials {
  [key: string]: string | number | undefined
  refresh_token?: string | undefined
  scope: string
  access_token: string
  token_type: string
  expiry_date: number
}
