import type { RuntimeConfig } from 'nuxt/schema'
import type { Logger } from 'pino'
import { updateJson, loadFileContent } from '~/server/helpers/files.helper'
import {
  ApplicationError, ConfigDataError, GetStoredTokensError, InvalidCredentialsError,
  RefreshCredentialsError, TokenValidityCheckError,
} from '~/server/errors/custom-errors'
import type { IGmailApiService, ITokenManagerService, IValidationService } from '~/server/interfaces/services'
import type { StoredGoogleTokens } from '~/server/interfaces/stored-google-tokens'
import { storedTokensSchema } from '~/server/interfaces/zschema/stored-tokens.schema'
import { NewCredentialSchema } from '~/server/interfaces/zschema/new-credential.schema'
import type { NewGoogleCredentials } from '~/server/interfaces/new-google-credentials'

export class TokenManagerService implements ITokenManagerService {
  private readonly config: RuntimeConfig

  constructor(
    private readonly gmailApiService: IGmailApiService,
    private readonly validationService: IValidationService,
    private readonly logger: Logger,
  ) {
    this.config = useRuntimeConfig()
  }

  /**
   * Retrieves token stored in JSON file
   * @private
   */
  private async getStoredTokens(): Promise<string | StoredGoogleTokens> {
    const tokenStorage = this.config.private.tokenStorage

    if (!tokenStorage) {
      throw new ConfigDataError('A config data missing: token_storage path', { tokenStorage: tokenStorage })
    }
    const tokensFromStorage = await loadFileContent<StoredGoogleTokens>(tokenStorage, true)

    if (!tokensFromStorage) {
      throw new GetStoredTokensError('No token provided', { fileContent: tokensFromStorage })
    }
    return tokensFromStorage
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
    catch (err) {
      throw new TokenValidityCheckError('Unable to check token validity date', err.message)
    }
  }

  /**
   * Refresh credentials
   * @param refreshToken
   * @private
   */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Obtenir de nouveaux identifiants
      const newCredentials = await this.gmailApiService.getNewToken(refreshToken)
      // Validate credentials datas from Google Auth API
      const validatedCredentials = this.validationService.validateType<NewGoogleCredentials>(newCredentials, NewCredentialSchema)
      if (!validatedCredentials.success) {
        throw new InvalidCredentialsError(
          'Access token is invalid or missing',
          { zodError: validatedCredentials.errors },
        )
      }

      // Update storage file with new credentials
      const tokenStorage = this.config.private.tokenStorage
      if (!tokenStorage) {
        throw new ConfigDataError('A config data missing: token_storage path', { tokenStorage: tokenStorage })
      }
      await updateJson(tokenStorage, data => ({
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
   * Returns a valid access_token
   */
  async getTokensFromStorage(): Promise<string> {
    try {
      const tokens = await this.getStoredTokens()
      // Check property exist, not null or empty
      const validatedTokens = this.validationService.validateType<StoredGoogleTokens>(tokens, storedTokensSchema)

      if (!validatedTokens.success) {
        throw new GetStoredTokensError(
          'The content of token is not compliant',
          { zodError: validatedTokens.errors },
        )
      }
      const { expiry_date, refresh_token, access_token } = validatedTokens.data

      if (this.mustRefreshCredentials(expiry_date)) {
        this.logger.info('Token expired, needs refresh')
        return await this.refreshAccessToken(refresh_token)
      }
      return access_token
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        throw error
      }
      throw new GetStoredTokensError('Error retrieving token from storage', error)
    }
  }
}
