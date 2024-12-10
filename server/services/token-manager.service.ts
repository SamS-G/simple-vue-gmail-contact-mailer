import type { RuntimeConfig } from 'nuxt/schema'
import { updateJson, loadFile } from '~/server/helpers/files.helper'
import {
  ApplicationError, GetStoredCredentialsError, InvalidCredentialsError,
  RefreshCredentialsError, TokenValidityCheckError,
} from '~/server/errors/custom-errors'
import type { IGmailApiService, ITokenManagerService, IValidationService } from '~/server/interfaces/services'
import type { StoredGoogleCredentials } from '~/server/interfaces/stored-google-credentials'
import { StoredCredentialSchema } from '~/server/interfaces/zschema/stored-credential-schema'
import { NewCredentialSchema } from '~/server/interfaces/zschema/new-credential-schema'
import type { NewGoogleCredentials } from '~/server/interfaces/new-google-credentials'

export class TokenManagerService implements ITokenManagerService {
  private config: RuntimeConfig

  constructor(
    private gmailApiService: IGmailApiService,
    private validationService: IValidationService,
  ) {
    this.config = useRuntimeConfig()
  }

  /**
   * Retrieves token stored in JSON file
   * @private
   */
  private async getStoredCredentials(): Promise<StoredGoogleCredentials> {
    const tokenStorage = this.config.private.tokenStorage

    if (!tokenStorage) {
      throw new GetStoredCredentialsError('No token config data are not provided', { tokenStorage: tokenStorage })
    }
    const tokenFile = await loadFile<StoredGoogleCredentials>(tokenStorage)

    if (!tokenFile) {
      throw new GetStoredCredentialsError('No token provided', { tokenFile: tokenFile })
    }
    return tokenFile
  }

  /**
   * Checks whether the token needs updating
   * @param expiryDate Token expiry date
   * @private
   */
  private mustRefreshCredentials(expiryDate: number): boolean {
    try {
      return this.validationService.compareDates(expiryDate)
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        throw error
      }
      throw new TokenValidityCheckError('Unable to check token validity date', error)
    }
  }

  /**
   * Refresh credentials
   * @param refreshToken
   * @private
   */
  private async refreshCredentials(refreshToken: string): Promise<string> {
    try {
      // Obtenir de nouveaux identifiants
      const newCredentials = await this.gmailApiService.getNewCredentials(refreshToken)
      // Validate credentials datas from Google Auth API
      const validatedCredentials = this.validationService.validateType<NewGoogleCredentials>(newCredentials, NewCredentialSchema)
      if (!validatedCredentials.success) {
        throw new InvalidCredentialsError(
          'Access token is invalid or missing',
          { zodError: validatedCredentials.errors },
        )
      }

      // Update storage file with new credentials
      await updateJson(this.config.private.tokenStorage, data => ({
        ...data,
        access_token: newCredentials.access_token,
        refresh_token: newCredentials.refresh_token ?? data.refresh_token,
        expiry_date: newCredentials.expiry_date,
      }), true)

      return validatedCredentials.data.access_token
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        throw error
      }
      throw new RefreshCredentialsError('Credentials update failure', error)
    }
  }

  /**
   * Returns a valid access token
   */
  async getCredentialsFromStorage(): Promise<string> {
    try {
      const tokens = await this.getStoredCredentials()
      const validatedCredentials = this.validationService.validateType<StoredGoogleCredentials>(tokens, StoredCredentialSchema)

      if (validatedCredentials.type === 'error') {
        throw new GetStoredCredentialsError(
          'The content of token is not compliant',
          { zodError: validatedCredentials.errors },
        )
      }
      const { expiry_date, refresh_token, access_token } = validatedCredentials.data

      if (this.mustRefreshCredentials(expiry_date)) {
        return await this.refreshCredentials(refresh_token)
      }
      return access_token
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        throw error
      }
      throw new GetStoredCredentialsError('Error retrieving token from storage', error)
    }
  }
}
