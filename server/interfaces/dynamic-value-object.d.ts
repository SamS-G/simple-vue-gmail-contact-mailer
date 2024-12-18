/**
 * Interface générique pour les objets avec des valeurs dynamiques.
 * Cela permet de traiter des objets avec des propriétés de types variés (string, number, object, etc.).
 */
export interface DynamicValuesObject {
  [key: string]: string | number | boolean | null | undefined | DynamicValuesObject | DynamicValuesObject[]
}
