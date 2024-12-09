/**
 * Supprime les propriétés définies dans le tableau updates
 * @param originalObject
 * @param updates
 */
export const sanitizeObject = async <T extends object>(originalObject: T, updates: Array<Extract<keyof T, string>>): Promise<Omit<T, keyof T>> => {
  // Check object before sanitize
  await hasRequiredProperty(originalObject, updates)

  // Création d'une copie et suppression des propriétés
  const updatedObject = { ...originalObject }

  for (const key of updates) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete updatedObject[key]
  }
  return updatedObject
}

/**
 * Vérifie si l'objet contient toutes les propriétés attendues avec des valeurs définies
 * @param obj
 * @param requiredProperties
 * @param valueMode
 */
export const hasRequiredProperty = async <T extends object>(obj: T, requiredProperties: Array<Extract<keyof T, string>>, valueMode = false): Promise<boolean> => {
  const missingProperties: string[] = []
  const missingValues: string[] = []

  requiredProperties.forEach((prop) => {
    if (!(prop in obj)) {
      missingProperties.push(prop)
    }
    if (valueMode) {
      if (obj[prop] === undefined || obj[prop] === null || obj[prop] === '') {
        missingValues.push(prop)
      }
    }
  })
  if (missingProperties.length > 0) {
    throw new Error(`These properties has missing : ${missingProperties.join(', ')}`)
  }
  if (missingValues.length > 0) {
    throw new Error(`The values of these properties are missing : ${missingValues.join(', ')}`)
  }

  return true
}
