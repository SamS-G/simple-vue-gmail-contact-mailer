import type { ContactConfig } from '~/server/interfaces/contact-data-template'

export const contact: ContactConfig = {
  button: {
    title: 'Reply to message',
    link: `mailto:{{email}}`,
  },
  title: 'New contact request',
  banner: {
    h1: 'New contact request',
    text: `Received on ${(new Date()).toLocaleDateString('fr-FR')}`,
  },
  contact: {
    name: '{{name}}',
    email: '{{email}}',
    reason: '{{reason}}',
    subject: '{{subject}}',
    message: '{{message}}',
  },
}
