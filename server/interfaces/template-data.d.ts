/**
 * [key: string] définit un objet dont les clés sont des chaînes.
 * T extends Record<string, string> garantit que T est un objet avec des clés de type string.
 * string & K garantissent que K est une chaîne pour permettre son interpolation.
 * Les placeholders comme {{${K}}} sont définis à l'aide de modèles de chaînes TypeScript (Template Literal Types).
 */
export interface TemplateData<T> {
  [key: string]: string | number & { [K in keyof T]: `{{ ${string & K} }}` }
}
