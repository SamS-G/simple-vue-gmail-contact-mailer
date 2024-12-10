import { defineEventHandler } from 'h3'
import type { StoredGoogleCredentials } from '../interfaces/stored-google-credentials'
import { loadFile, updateJson } from '~/server/helpers/files.helper'

export default defineEventHandler(async (event) => {
  try {
    // Validate HTTP method
    if (event.method !== 'GET') {
      throw new Error('Method not allowed')
    }

    const { container, config } = event.context
    const { private: { initialCredentials, tokenStorage } } = config

    // Validate required dependencies
    if (!container) {
      return { success: false, error: 'Container not initialized' }
    }
    if (!initialCredentials) {
      return { success: false, error: 'Initial credentials configuration missing' }
    }

    const apiGmailService = container.resolve('gmailApiService')
    const initializeFile = await loadFile<StoredGoogleCredentials>(initialCredentials)

    // Generate auth URL if not existing
    if (!initializeFile.auth_url) {
      const url = await apiGmailService.getAuthUrl()
      if (url) {
        await updateJson(initialCredentials, data => ({
          ...data,
          auth_url: url,
        }))
      }
    }

    // Get access token if code present
    if (initializeFile.code) {
      const credentials = await apiGmailService.getFirstAccessToken(initializeFile.code)
      await updateJson(tokenStorage, () => ({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expiry_date: credentials.expiry_date,
        token_type: credentials.token_type,
        scope: credentials.scope,
      }), true)
    }

    return { success: true }
  }
  catch (error) {
    console.error('Gmail authentication error:', error.message)
    return { success: false, error: error.message }
  }
})
