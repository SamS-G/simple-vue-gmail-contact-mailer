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

export default defineNitroPlugin((nitroApp) => {
  try {
    const container = createContainer<Awilix>({
      injectionMode: InjectionMode.CLASSIC, // CLASSIC = injection declared on the construct
    })
    // Add container to Nitro context
    nitroApp.hooks.hook('request', (event) => {
      try {
        // Register the services required for the server
        container.register({
          // Config
          config: asValue({
            nodeEnv: process.env.NODE_ENV,
            logLevel: process.env.LOG_LEVEL,
            notificationEndpoint: process.env.NOTIF_ENDPOINT,
          }),
          // Services
          tokenManagerService: asClass(TokenManagerService, {
            lifetime: Lifetime.SINGLETON, // Instance unique dans l'application
          }),
          // readJson: asValue(readJson),
          gmailApiService: asClass(GmailApiService, {
            lifetime: Lifetime.SINGLETON,
          }),
          gmailService: asClass(GmailService, {
            lifetime: Lifetime.SINGLETON,
          }),
          validationService: asClass(ValidationService, {
            lifetime: Lifetime.SINGLETON,
          }),
          templateService: asClass(TemplateService, {
            lifetime: Lifetime.SINGLETON,
          }),
          errorHandlerService: asClass(ErrorHandlerService, {
            lifetime: Lifetime.SINGLETON, // Nouveau controller pour chaque requête
          }),
          emailConfigService: asClass(EmailConfigService, {
            lifetime: Lifetime.SINGLETON,
          }),
          // Controllers
          emailController: asClass(EmailController, {
            lifetime: Lifetime.SCOPED, // Nouveau controller pour chaque requête
          }),
        })
        // Creates a scope for each query
        event.context.container = container.createScope()
      }
      catch (error) {
        console.error('Error creating container scope: ', error)
        throw error
      }
    })

    nitroApp.hooks.hook('error', async (error, event) => {
      console.error('An error has occurred: ', { error, context: event })
    })

    nitroApp.hooks.hook('afterResponse', async (event) => {
      try {
        // Clear after response
        if (event.context.container) {
          await event.context.container.dispose()
          delete event.context.container
        }
      }
      catch (error) {
        console.error('Error deleting container: ', error)
      }
    })
  }
  catch (error) {
    console.error('Awilix container configuration error: ', error)
  }
})
