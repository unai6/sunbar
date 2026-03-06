<script setup lang="ts">
import 'primeicons/primeicons.css'
import Toast from 'primevue/toast'

const { t } = useI18n()
const i18nHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])]
}))

useHead({
  title: () => t('app.title.main'),
  meta: [
    { name: 'description', content: () => t('app.meta.description') },
    { property: 'og:title', content: () => t('app.title.main') },
    { property: 'og:description', content: () => t('app.meta.description') },
    { name: 'twitter:title', content: () => t('app.title.main') },
    { name: 'twitter:description', content: () => t('app.meta.description') },
    ...i18nHead.value.meta || []
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'SunBar',
        url: 'https://sunbbar.com',
        description: t('app.meta.description'),
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR'
        }
      })
    }
  ],
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: [...(i18nHead.value.link || [])]
})
</script>

<template>
  <div class="flex flex-col h-dvh overflow-hidden">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      {{ $t('common.label.skipToContent') }}
    </a>
    <Toast position="top-center" />
    <AppHeader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
