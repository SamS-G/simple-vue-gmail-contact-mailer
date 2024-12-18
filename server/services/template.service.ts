import * as fs from 'node:fs'
import path from 'node:path'
import type { RuntimeConfig } from 'nuxt/schema'
import Handlebars from 'handlebars'
import type { DynamicValuesObject } from '~/server/interfaces/dynamic-value-object'
import { replaceDynamicValues, flattenObject } from '~/server/helpers/objects.helper'
import { loadFileContent, parseJson } from '~/server/helpers/files.helper'
import {
  ApplicationError,
  CompileTemplateError, ConfigDataError, CreateEmailTemplateError,
  CreateTemplateDataError, CreateTemplateDataModel, RegisterTemplatePartialError,
} from '~/server/errors/custom-errors'
import { pathResolver, resolvePartialPaths } from '~/server/helpers/path.helper'
import type { ITemplateService } from '~/server/interfaces/services'
import type { TemplatesConfig } from '~/server/interfaces/templates-config'
import type { ReplacementValue } from '~/server/types/replacement-value'
import type { BaseEmailData } from '~/server/interfaces/base-email-data'

export class TemplateService implements ITemplateService {
  private readonly config: RuntimeConfig
  constructor() {
    this.config = useRuntimeConfig()
  }

  /**
   * Formats and models e-mail
   * With complete custom data model or base model + custom
   * @param data Form data to hydrate template
   * @param dataModel
   */
  async createTemplate(data: Record<string, ReplacementValue>, dataModel: DynamicValuesObject): Promise<Record<string, string>> {
    await this.registerPartials()

    const templates = this.config.private.templates
    if (!templates) {
      throw new ConfigDataError('Error when creating template, no templates path provided from config', { templatesPaths: templates })
    }
    const templatesConfig = parseJson<TemplatesConfig>(templates)
    const templateDataModel = await this.createTemplateDataModel(dataModel)
    const hydratedTemplates = await this.createTemplateData(templateDataModel, data)

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
   * Create the data model used to create content
   * @param dataModel
   */
  async createTemplateDataModel(dataModel: DynamicValuesObject) {
    let baseDataModel: null | BaseEmailData | string = null

    try {
      if (this.config.private.baseDataModel) {
        const baseFilePath = pathResolver(this.config.private.baseDataModel)
        baseDataModel = await loadFileContent(baseFilePath, true)
      }

      return typeof baseDataModel !== 'string' && baseDataModel !== null
        ? { ...flattenObject(baseDataModel), ...flattenObject(dataModel) } // base data model + custom model
        : flattenObject(dataModel) // only custom model
    }
    catch (err) {
      const error = <Error>err
      throw new CreateTemplateDataModel('Can\'t create template model data with provided models', { dataModel: dataModel, error: error })
    }
  }

  /**
   * Hydrate template with user form datas. Using placeholder replace function
   * @param template
   * @param values
   * @private
   */
  private async createTemplateData(template: DynamicValuesObject, values: Record<string, ReplacementValue>): Promise<unknown> {
    if (!(template && values)
      || typeof template !== 'object'
      || typeof values !== 'object'
    ) {
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
    return await loadFileContent<string>(path.resolve(filePath))
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
