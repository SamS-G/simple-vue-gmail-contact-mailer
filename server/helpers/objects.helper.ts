import type { PlaceholderOptions } from '~/server/interfaces/placeholder-options'
import type { ReplaceDynamicValues } from '~/server/types/replace-dynamic-values'

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
        return (val as string).replace(regex, (match: string, placeholder: string): string => {
          const replacement = values[placeholder]

          if (replacement === undefined) {
            throw new Error(`Placeholder "${match}" not found in the value dictionary.`)
          }

          if (typeof replacement === 'object') {
            throw new Error(`The value for the placeholder "${match}" cannot be an object.`)
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
            throw new Error(`Error in array index ${index}: ${(err as Error).message}`)
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
              throw new Error(`Error processing key "${key}": ${(err as Error).message}`)
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
