import type { RuntimeConfig } from 'nuxt/schema'
import { encodeToBase64 } from '~/server/helpers/base64.helper'
import type { IEmailConfigService } from '~/server/interfaces/services'
import type { Email } from '~/server/types/email'
import { EmailConfigError } from '~/server/errors/custom-errors'

export class EmailConfigService implements IEmailConfigService {
  private readonly config: RuntimeConfig
  constructor() {
    this.config = useRuntimeConfig()
  }

  /**
     * Create email configuration
     * This is Gmail config format
     * @param emailForm
     */
  createGmailConfig(emailForm: Email): string {
    try {
      const emailConfig = {
        to: this.config.private.sendEmailTo,
        subject: emailForm.subject,
        message: emailForm.message,
      }

      return [
        `To: ${emailConfig.to}`,
        'Content-Type: text/html; charset=UTF-8',
        'MIME-Version: 1.0',
        `Subject: =?UTF-8?B?${encodeToBase64(emailConfig.subject)}?=\n`, // Special characters
        '',
        emailConfig.message,
      ].join('\n')
    }
    catch (err) {
      throw new EmailConfigError('Error when creating the EmailConfig', <Error>err)
    }
  }
}
