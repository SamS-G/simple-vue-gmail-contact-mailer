import * as yup from 'yup'

export const form = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Invalid email format')
    .max(254, 'The e-mail address may not exceed 254 characters.'),
  name: yup
    .string()
    .trim()
    .required('Your name is required')
    .min(4, 'Your first and last name must be more than 4 characters long'),
  message: yup
    .string()
    .trim()
    .required('The message cannot be empty')
    .min(16, 'Your message must be longer than 16 characters')
    .max(100000, 'The message is too long'),
  subject: yup
    .string()
    .trim()
    .required('Please enter the subject of your request')
    .min(4, 'Your subject must be more than 4 characters long')
    .max(78, 'The subject must not exceed 78 characters'),
  reason: yup
    .string()
    .required('Don\'t forget the motif')
    .oneOf(['sales', 'after-sales', 'other'], 'Select valid option'),
  terms: yup
    .boolean()
    .oneOf([true], 'Please accept the terms of use')
    .required('Please accept the terms of use'),
})
