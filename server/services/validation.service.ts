import type { Schema } from 'yup'
import yup from 'yup'
import type { z, ZodIssue } from 'zod'
import { YupDataValidationError } from '~/server/errors/custom-errors'
import type { IValidationService } from '~/server/interfaces/services'

export class ValidationService implements IValidationService {
  /**
   * Using Yup schema constraints to validate data from user form
   * @param data - The data to validate
   * @param validationSchema - The Yup validation schema to use
   * @returns A promise that resolves with the validated data if successful, or throws an error if validation fails
   */
  async yupDataValidate<T>(data: T, validationSchema: Schema<T>): Promise<T> {
    try {
      return await validationSchema.validate(data, { abortEarly: false })
    }
    catch (err) {
      if (err instanceof yup.ValidationError) {
        throw new YupDataValidationError(
          'The data validation has failed. Check your data.',
          err.errors.join(', '),
        )
      }
      throw err // Relancer toute autre erreur non liée à Yup
    }
  }

  /**
   * Check if provided timestamp to be greater than now timestamp
   * @param timestamp
   */
  compareDates(timestamp: number): boolean {
    return Date.now() >= timestamp
  }

  /**
   * Validates a given object against a Zod pattern.
   * @template T - The expected type of the object to be validated.
   * @param obj - The object to be validated (unknown type).
   * @param schema - The Zod schema, which defines the validation rules for type T.
   * @returns {boolean} - Returns `success: true + obj` if the object is valid and conforms to the schema, otherwise `sucess: false + zod errors`.
   */
  validateType<T>(obj: unknown, schema: z.ZodType<T, z.ZodTypeDef, T>): {
    success: true
    type: 'validated'
    data: T
  } | {
    success: false
    type: 'error'
    errors: ZodIssue[] | unknown
  } {
    try {
      const result = schema.safeParse(obj) // Validate data without thow exception

      return (!result.success)
        ? { success: false, type: 'error', errors: result.error.errors }
        : {
            success: true,
            type: 'validated',
            data: result.data,
          }
    }
    catch (error) {
      return {
        success: false,
        type: 'error',
        errors: error,
      }
    }
  }
}
