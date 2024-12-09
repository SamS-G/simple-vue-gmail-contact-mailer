import * as yup from 'yup'

export const form = yup.object().shape({
  email: yup
    .string()
    .required('L\'email est requis')
    .email('Format d\'email invalide')
    .max(254, 'L\'adresse mail ne peux pas dépasser 254 caractères'),
  name: yup
    .string()
    .required('Votre nom est nécessaire')
    .min(4, 'Votre nom et prénom doivent faire plus de 4 caractères'),
  message: yup
    .string()
    .required('Le message ne peut être vide')
    .min(16, 'Votre message doit faire plus de 16 caractères')
    .max(100000, 'Le message est trop long'),
  subject: yup.string().required('Veuillez saisir un sujet de votre demande')
    .min(4, 'Votre sujet doit faire plus de 4 caractères')
    .max(78, 'Le sujet ne doit pas dépasser 78 caractères'),
  reason: yup
    .string()
    .required('N\'oubliez pas le motif')
    .oneOf(['Commerce', 'Après-vente', 'Autre']),
  terms: yup
    .boolean()
    .oneOf([true], 'Veuillez accepter les conditions d\'utilisation')
    .required('Veuillez accepter les conditions d\'utilisation'),
})
