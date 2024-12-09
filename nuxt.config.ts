// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@vesp/nuxt-fontawesome', 'usebootstrap', '@nuxt/eslint'],
  devtools: { enabled: true },
  css: ['~/assets/css/base.css', '~/assets/css/main.css'],
  runtimeConfig: {
    private: {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI,
      apiScope: process.env.API_SCOPE,
      encryptionKey: process.env.ENCRYPTION_KEY,
      sendEmailTo: process.env.SEND_EMAIL_TO,
      templates: process.env.TEMPLATES,
      tokenStorage: process.env.TOKEN_LOCAL,
      log: process.env.LOG,
    },
    rootDir: process.cwd(),
  },
  routeRules: {
    '/api/send-email': {
      cache: false,
      cors: true,
      headers: {
        'Access-Control-Allow-Methods': 'GET,POST',
        'Access-Control-Allow-Origin': '*',
      },
      appMiddleware: 'content',
      ssr: true,
    },
  },
  dev: true,
  compatibilityDate: '2024-04-03',
  nitro: {
    debug: true,
    esbuild: {
      options: { target: 'es2022' },
    },
  },
  vite: {
    esbuild: {
      target: 'es2022',
    },
    build: {
      target: 'es2022',
    },
  },
  debug: true,
  eslint: {
    checker: true,
    config: {
      stylistic: true,
    },
  },
  fontawesome: {
    icons: {
      solid: [
        'house',
        'portrait',
        'code',
        'comment',
        'envelope',
        'quote-right',
        'star',
        'gears',
        'terminal',
        'arrow-down-long',
        'address-card',
        'caret-down',
        'caret-up',
        'map-marker',
        'phone',
        'check',
      ],
      regular: ['message'],
      brands: ['laravel', 'vuejs', 'faLinkedinIn', 'faInstagram'],
    },
  },
})
