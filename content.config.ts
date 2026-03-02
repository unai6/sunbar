import { defineCollection, defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/**'
      }
    }),
    content_es: defineCollection({
      type: 'page',
      source: {
        include: 'es/**'
      }
    }),
    content_ca: defineCollection({
      type: 'page',
      source: {
        include: 'ca/**'
      }
    })
  }
})
