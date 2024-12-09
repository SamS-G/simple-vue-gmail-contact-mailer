import type { H3Event } from 'h3'
import type { ApplicationError } from '~/server/errors/custom-errors'
import { NoAccessTokenError } from '~/server/errors/custom-errors'
import type {
  IErrorHandlerService,
  IGmailService, ITokenManagerService,
} from '~/server/interfaces/services'

export class EmailController {
  constructor(
    private gmailService: IGmailService,
    private errorHandlerService: IErrorHandlerService,
    private tokenManagerService: ITokenManagerService,
  ) {}

  async sendingWithGmail(event: H3Event) {
    try {
      const formData = await readBody(event)
      const accessToken = await this.tokenManagerService.getCredentialsFromStorage()

      if (!accessToken) {
        throw new NoAccessTokenError('No access token found.', { accessToken: accessToken })
      }

      return await this.gmailService.sendGmail(formData, accessToken)
    }
    catch (err) {
      this.errorHandlerService.handleError(event, <Error | ApplicationError>err)
    }
  }
}
