import type { PlaceholderOptions } from '~/server/interfaces/placeholder-options'
import type { ReplaceDynamicValues } from '~/server/types/replace-dynamic-values'
import { ReplacePlaceholdersError } from '~/server/errors/custom-errors'

export const replaceDynamicValues = <T extends Record<string, unknown>, U>(
  value: T,
  values: Record<string, U>,
  options?: PlaceholderOptions,
  replaceFunction?: ReplaceDynamicValues<U>,
): T => {
  const { delimiter = '{{', delimiterEnd = '}}' } = options || {}
  const regex = new RegExp(`${delimiter}(\\w+)${delimiterEnd}`, 'g')

  /**
   * Replaces placeholders in a given value, which can be a string, array or object.
   *
   * @param val - The value to process, which could be of any type.
   * @returns - The processed value with placeholders replaced.
   */
  const replacePlaceholders = (val: unknown): unknown => {
    switch (true) {
      case typeof val === 'string': {
        // Replace placeholders in a string
        return (val).replace(regex, (match: string, placeholder: string): string => {
          const replacement = values[placeholder]

          if (replacement === undefined) {
            throw new ReplacePlaceholdersError(`Placeholder "${match}" not found in the value dictionary.`)
          }

          if (typeof replacement === 'object') {
            throw new ReplacePlaceholdersError(`The value for the placeholder "${match}" cannot be an object.`)
          }
          // Ensure the replacement is always a string
          return String(replaceFunction
            ? replaceFunction(match, placeholder)
            : (replacement))
        })
      }

      case Array.isArray(val): {
        // Process each element in an array
        return (val as unknown[]).map((item, index) => {
          try {
            return replacePlaceholders(item)
          }
          catch (err) {
            throw new ReplacePlaceholdersError(`Error in array index ${index}: ${(err as Error).message}`)
          }
        })
      }

      case typeof val === 'object' && val !== null: {
        // Process each property in an object
        return Object.fromEntries(
          Object.entries(val as Record<string, unknown>).map(([key, value]) => {
            try {
              return [key, replacePlaceholders(value)] as [string, unknown]
            }
            catch (err) {
              throw new ReplacePlaceholdersError(`Error processing key "${key}": ${(err as Error).message}`)
            }
          }),
        )
      }

      default:
        // Return the value as is for other types (number, boolean, null, undefined, etc.)
        return val
    }
  }
  // Transform the input object
  return replacePlaceholders(value) as T
}

/**
 * Flattens a nested object into a single-depth object with prefixed keys reflecting the hierarchy.
 *
 * @template T - The type of the input object.
 * @param obj - The object to flatten.
 * @param prefix - The prefix for the keys (empty string by default).
 * @returns A flattened object with string keys and allowed primitive values.
 */
export const flattenObject = <T extends Record<string, unknown>>(
  obj: T,
  prefix: string = '',
): Record<string, string | undefined> => {
  // Check if is authorized type (type guard)
  const isPrimitiveValue = (
    value: unknown,
  ): value is string | number | boolean | null | undefined => {
    return (
      typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
      || value === null
      || value === undefined
    )
  }

  // Initialize object result
  const result: Record<string, string | undefined> = {}

  // Object key path
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      // Generate prefixed key
      const prefixedKey = prefix ? `${prefix}_${key}` : key // Default { prop: value } = key_ = prop_
      const value = obj[key] // Nested object

      // Check if is nested object
      if (
        value
        && typeof value === 'object' // Is an object
        && !Array.isArray(value) // Is not an array
        && !(value instanceof Date) // Is not an instance of Date
      ) {
        // Appel récursif avec la clé préfixée
        Object.assign(
          result,
          flattenObject(value as Record<string, unknown>, prefixedKey),
        )
      }
      else if (isPrimitiveValue(value)) {
        // Adds the primitive value to the result
        result[prefixedKey] = value?.toString()
      }
      else {
        // Ignorer les types non pris en charge
        throw new Error(
          `Unsupported value type for key "${prefixedKey}": ${typeof value}`,
        )
      }
    }
  }

  // Retourne l'objet aplati
  return result
}
