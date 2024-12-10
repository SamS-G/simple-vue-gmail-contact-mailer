import * as fs from 'node:fs'
import path from 'node:path'
import type { RuntimeConfig } from 'nuxt/schema'
import Handlebars from 'handlebars'
import { contact } from 'assets/templates/pages/data/contact'
import type { TemplateData } from '~/server/interfaces/template-data'
import { replaceDynamicValues } from '~/server/helpers/objects.helper'
import { loadFile, parseJson } from '~/server/helpers/files.helper'
import {
  ApplicationError,
  CompileTemplateError, CreateEmailTemplateError,
  CreateTemplateDataError, RegisterTemplatePartialError,
} from '~/server/errors/custom-errors'
import { resolvePartialPaths } from '~/server/helpers/path.helper'
import type { ITemplateService } from '~/server/interfaces/services'
import type { TemplatesConfig } from '~/server/interfaces/templates-config'
import type { ReplacementValue } from '~/server/types/replacement-value'

export class TemplateService implements ITemplateService {
  private config: RuntimeConfig
  constructor() {
    this.config = useRuntimeConfig()
  }

  /**
   * Formats and models e-mail
   * @param data UniversalForm data to hydrate the template
   */
  async createTemplate(data: Record<string, ReplacementValue>): Promise<Record<string, string>> {
    await this.registerPartials()

    const templates = this.config.private.templates
    if (!templates) {
      throw new CreateEmailTemplateError('Error when creating template, no templates path provided', { formData: data })
    }
    const hydratedTemplates = await this.createTemplateData(contact, data)
    const templatesConfig = parseJson<TemplatesConfig>(templates)

    const message = await this.compileTemplate(
      templatesConfig.base_template,
      hydratedTemplates,
    )

    if (!message) {
      throw new CreateEmailTemplateError('Error when creating template', { formData: data })
    }
    return { ...data, message }
  }

  /**
   * Hydrate template with user form datas. Using placeholder replace function
   * @param template
   * @param values
   * @private
   */
  private async createTemplateData<T>(template: TemplateData<T>, values: Record<string, ReplacementValue>): Promise<unknown> {
    if (!(template && values) || typeof template !== 'object' || typeof values !== 'object') {
      throw new CreateTemplateDataError('Invalid template or dynamic data provided', { templateData: template, data: values })
    }
    return replaceDynamicValues(template, values)
  }

  /**
   * Compile for use
   * @param templatePath
   * @param data
   * @private
   */
  private async compileTemplate(templatePath: string, data: unknown): Promise<string> {
    const baseTemplate = await this.loadTemplate(templatePath)

    if (!baseTemplate) {
      throw new CompileTemplateError('Error when loading base template', { templatePath: templatePath })
    }
    const compileTemplate = Handlebars.compile(baseTemplate)

    return compileTemplate(data)
  }

  /**
   * Loads the template file content as a string for Handlebars compilation.
   * @param filePath - Path to the template file.
   * @returns The content of the template file as a string or exception.
   */
  private async loadTemplate(filePath: string): Promise<string> {
    return await loadFile<string>(path.resolve(filePath))
  }

  /**
   * Register partials for Handlebars before model hydrating and template compiling
   */
  private async registerPartials(): Promise<void> {
    const templates = this.config.private.templates

    if (!templates) {
      throw new RegisterTemplatePartialError('No templates folder path provided !')
    }

    const templatesConfig = parseJson<TemplatesConfig>(templates)
    const partialsDir = resolvePartialPaths(templatesConfig.base_dir, templatesConfig.partials)

    if (!partialsDir || partialsDir.length === 0) {
      // No partials directories to register
      return
    }

    for (const dir of partialsDir) {
      try {
        const files = fs.readdirSync(dir)

        if (!files || files.length === 0) {
          // No files found in the folder
          continue
        }
        for (const file of files) {
          const partialPath = path.join(dir, file)
          const partialName = path.parse(file).name
          const partialContent = await this.loadTemplate(partialPath)
          Handlebars.registerPartial(partialName, partialContent)
        }
      }
      catch (err) {
        if (err instanceof ApplicationError) {
          throw err
        }
        else {
          const error = <Error>err
          throw new Error(error.message, error)
        }
      }
    }
  }
}
