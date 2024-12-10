import type { Input, Option, Select } from '~/components/Types'

export interface InputProps {
  input: Input
}
export interface SelectProps {
  select: Select
}
export interface Select {
  id: string
  name: string
  type: string
  label?: string
  placeholder?: string
  options: Option[]
}
export interface Option {
  label: string
  value: string
}
export interface Input {
  id: string
  name: string
  class?: string
  label?: string
  placeholder?: string
  type: string
  rows?: string
  cols?: string
  value?: string | boolean
  checkboxLabel?: string
  options?: {
    excludeFromData?: false
  }
}
export interface AuthResponseData {
  url: string
}
export interface ModalStatusProps {
  visible: boolean
  status?: string
  successMessage?: string
  errorMessage?: string
  successTitle?: string
  errorTitle?: string
}
