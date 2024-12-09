import yup from 'yup'

export const email = yup.object().shape({
  email: yup
    .string()
    .email()
    .max(254)
    .required(),
  subject: yup
    .string()
    .max(78)
    .required(),
  message: yup
    .string()
    .max(100000)
    .required(),
})
