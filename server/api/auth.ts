import { defineEventHandler } from 'h3'
import type { StoredGoogleTokens } from '../interfaces/stored-google-tokens'
import { loadFileContent, updateJson } from '~/server/helpers/files.helper'

export default defineEventHandler(async (event) => {
  try {
    // Validate HTTP method
    if (event.method !== 'GET') {
      throw new Error('Method not allowed')
    }

    const { container } = event.context
    const config = (useRuntimeConfig()).private
    const { initializeCredentials, tokenStorage } = config
    const apiGmailService = container.resolve('gmailApiService')
    const initializeFile = await loadFileContent<StoredGoogleTokens>(initializeCredentials, true)

    // Generate auth URL if not existing
    if (!initializeFile.code) {
      const url = await apiGmailService.getAuthUrl()

      if (url) {
        await updateJson(initializeCredentials, data => ({
          ...data,
          auth_url: url,
        }))
      }
      return { success: true, type: 'URL' }
    }

    // Get access token if code present
    if (!initializeFile.code) {
      const credentials = await apiGmailService.getFirstAccessToken(initializeFile.code)

      await updateJson(tokenStorage, () => ({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expiry_date: credentials.expiry_date,
        token_type: credentials.token_type,
        scope: credentials.scope,
      }), true)
      // Reset JSON
      await updateJson(initializeCredentials, () => ({ auth_url: '', code: '' }))

      return { success: true, type: 'token' }
    }
  }
  catch (error) {
    console.error('Gmail authentication error:', error.message, JSON.stringify(error))
    return { success: false, error: error.message }
  }
})
