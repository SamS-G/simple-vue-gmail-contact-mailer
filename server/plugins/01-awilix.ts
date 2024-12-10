import { createContainer, asClass, asValue, InjectionMode, Lifetime } from 'awilix'
import { GmailService } from '~/server/services/gmail.service'
import { GmailApiService } from '~/server/services/gmail.api.service'
import { TemplateService } from '~/server/services/template.service'
import { TokenManagerService } from '~/server/services/token-manager.service'
import { ValidationService } from '~/server/services/validation.service'
import { ErrorHandlerService } from '~/server/services/error-handler.service'
import { EmailController } from '~/server/controller/email.controller'
import { EmailConfigService } from '~/server/services/email-config.service'
import type { Awilix } from '~/server/interfaces/awilix'

let globalContainer: ReturnType<typeof createContainer>

export default defineNitroPlugin((nitroApp) => {
  try {
    const container = createContainer<Awilix>({
      injectionMode: InjectionMode.CLASSIC,
    })

    // Register shared services
    container.register({
      config: asValue({
        nodeEnv: process.env.NODE_ENV,
        logLevel: process.env.LOG_LEVEL,
        notificationEndpoint: process.env.NOTIF_ENDPOINT,
      }),
      tokenManagerService: asClass(TokenManagerService, { lifetime: Lifetime.SINGLETON }),
      gmailApiService: asClass(GmailApiService, { lifetime: Lifetime.SINGLETON }),
      gmailService: asClass(GmailService, { lifetime: Lifetime.SINGLETON }),
      validationService: asClass(ValidationService, { lifetime: Lifetime.SINGLETON }),
      templateService: asClass(TemplateService, { lifetime: Lifetime.SINGLETON }),
      errorHandlerService: asClass(ErrorHandlerService, { lifetime: Lifetime.SINGLETON }),
      emailConfigService: asClass(EmailConfigService, { lifetime: Lifetime.SINGLETON }),
      emailController: asClass(EmailController, { lifetime: Lifetime.SCOPED }),
    })

    globalContainer = container

    // Hook into Nitro's request lifecycle
    nitroApp.hooks.hook('request', (event) => {
      try {
        // Ensure logger exists in the request context
        if (!event.context.logger) {
          console.error('Logger not found in the request context.') // Debugging
          throw new Error('Logger not found in the request context.')
        }

        const scopedContainer = container.createScope()

        // Register logger in the scoped container
        scopedContainer.register({
          logger: asValue(event.context.logger),
        })

        event.context.container = scopedContainer
        console.log('Scoped container created and logger registered.') // Debug log
      }
      catch (error) {
        console.error('Error creating container scope: ', error)
        throw error
      }
    })
  }
  catch (error) {
    console.error('Awilix container configuration error: ', error)
  }
})

export const getContainer = () => globalContainer
