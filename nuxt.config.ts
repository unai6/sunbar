// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@primevue/nuxt-module',
    '@nuxtjs/leaflet'
  ],

  css: [
    'primeicons/primeicons.css',
    '~/assets/css/main.css'
  ],

  primevue: {
    options: {
      ripple: true
    },
    components: {
      include: '*'
    }
  },

  runtimeConfig: {
    public: {
      overpassApiUrl: 'https://overpass-api.de/api/interpreter'
    }
  },

  app: {
    head: {
      title: 'SunBar - Find Sunny Terraces',
      meta: [
        { name: 'description', content: 'Discover bars and restaurants with sunny terraces' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' }
      ]
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  compatibilityDate: '2024-09-01'
})
