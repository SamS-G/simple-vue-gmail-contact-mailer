import type { H3Event } from 'h3'
import type { ApplicationError } from '~/server/errors/custom-errors'
import type {
  IErrorHandlerService,
  IGmailService, ITokenManagerService,
} from '~/server/interfaces/services'

export class EmailController {
  constructor(
    private readonly gmailService: IGmailService,
    private readonly errorHandlerService: IErrorHandlerService,
    private readonly tokenManagerService: ITokenManagerService,
  ) {}

  /**
   * 1- Retrieve stored token / renew if necessary
   * 2- Create email template
   * 3- Send email.
   * @param event
   * @return object
   */
  async sendingWithGmail(event: H3Event) {
    try {
      const formData = await readBody(event)
      const tokens = await this.tokenManagerService.getTokensFromStorage()

      return await this.gmailService.sendGmail(formData, tokens)
    }
    catch (err) {
      this.errorHandlerService.handleError(event, <Error | ApplicationError>err)
    }
  }
}
