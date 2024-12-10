import type {
  IEmailConfigService,
  IGmailApiService,
  IGmailService,
  ITemplateService,
  IValidationService,
} from '~/server/interfaces/services'
import { email as emailSchema } from '~/server/schema/email'
import { encodeToBase64 } from '~/server/helpers/base64.helper'
import type { EmailForm } from '~/server/types/email-form'
import type { UniversalForm } from '~/server/types/universal-form'
import type { Email } from '~/server/types/email'

export class GmailService implements IGmailService {
  constructor(
    private validationService: IValidationService,
    private gmailApiService: IGmailApiService,
    private templateService: ITemplateService,
    private emailConfigService: IEmailConfigService,
  ) {}

  /**
   * Create email template
   * Validate content
   * Config and send the email with gmail API
   * @param formData
   * @param access_token
   * @return object
   */
  async sendGmail(formData: UniversalForm<EmailForm>, access_token: string): Promise<{ success: boolean, message: string }> {
    // Create email template
    const email = await this.templateService.createTemplate(formData)
    // Validate created email
    const emailValidate = await this.validationService.yupDataValidate(email, emailSchema) as Email
    // Create emailConfig and encode to base64
    const emailConfig = this.emailConfigService.createGmailConfig(emailValidate)
    const base64Email = encodeToBase64(emailConfig)
    // Sending email
    return this.gmailApiService.send(base64Email, access_token)
  }
}
