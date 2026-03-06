import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import i18nPages from './i18n/i18n.pages'

const SunBarPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '{amber.400}',
      500: '#D97706',
      600: '{amber.700}',
      700: '{amber.800}',
      800: '{amber.900}',
      900: '{amber.950}'
    }
  }
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/seo',
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/content'
  ],

  site: {
    url: process.env.BASE_URL || 'https://sunbbar.com',
    name: 'SunBar',
    indexable: process.env.NUXT_SITE_ENV === 'production'
  },

  robots: {
    blockNonSeoRobots: true
  },
  i18n: {
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ca', name: 'Català', file: 'ca.json' }
    ],
    defaultLocale: 'es',
    langDir: './',
    strategy: 'prefix_except_default',
    vueI18n: './i18n.config.ts',
    customRoutes: 'config',
    pages: i18nPages
  },

  css: ['~/assets/css/main.css'],

  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: SunBarPreset,
        options: {
          darkModeSelector: false
        }
      }
    }
  },

  runtimeConfig: {
    public: {
      // Required: all API calls go to sunbar-api (NUXT_PUBLIC_API_BASE_URL must be set)
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || ''
    }
  },

  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover'
        },
        { name: 'theme-color', content: '#D97706' },
        { name: 'msapplication-TileColor', content: '#D97706' },
        { name: 'msapplication-config', content: '/browserconfig.xml' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'SunBar' },
        { property: 'og:image', content: 'https://sunbbar.com/og-image.png' },
        { property: 'og:image:alt', content: 'SunBar - Find Sunny Terraces Near You' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@sunbbar' },
        { name: 'twitter:image', content: 'https://sunbbar.com/og-image.png' },
        { name: 'twitter:image:alt', content: 'SunBar - Find Sunny Terraces Near You' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png'
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png'
        },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://cdn.arcgis.com' },
        { rel: 'preconnect', href: 'https://basemaps.arcgis.com' },
        { rel: 'preconnect', href: 'https://services.arcgisonline.com' },
        { rel: 'dns-prefetch', href: 'https://nominatim.openstreetmap.org' }
      ]
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  vite: {
    clearScreen: false,
    server: {
      strictPort: true
    },
    optimizeDeps: {
      exclude: ['@arcgis/core']
    },
    resolve: {
      alias: {
        '@arcgis/core': '@arcgis/core'
      }
    },
    build: {
      target: 'esnext'
    },
    plugins: [
      {
        name: 'font-display-swap',
        transform(code: string, id: string) {
          if (!id.endsWith('.css')) return
          if (!id.includes('primeicons') && !id.includes('arcgis')) return
          return code
            .replaceAll(/font-display:\s*auto/g, 'font-display: swap')
            .replaceAll(/font-display:\s*block/g, 'font-display: swap')
        }
      }
    ]
  },

  nitro: {
    preset: 'netlify',
    prerender: {
      routes: ['/', '/en', '/ca', '/privacidad', '/en/privacy', '/ca/privacitat', '/sitemap.xml', '/robots.txt']
    }
  },

  ssr: false,

  compatibilityDate: '2024-09-01',

  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ]
})
