<script setup lang="ts">
definePageMeta({
  layout: 'legal'
})

const { t, locale, fallbackLocale } = useI18n()
const { path } = useRoute()

const routePath =  locale.value === fallbackLocale.value ? `/${locale.value}${path}` : path

const { data: page } = await useAsyncData(`content:privacy-${locale.value}`, () =>
  queryCollection(`content_${locale.value}`).path(routePath).first()
)

useHead({
  title: () => `${t('privacy.title')} — SunBar`,
  meta: [
    { name: 'description', content: () => t('privacy.meta.description') },
    { property: 'og:title', content: () => `${t('privacy.title')} — SunBar` },
    { property: 'og:description', content: () => t('privacy.meta.description') }
  ]
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-12">
    <p class="text-sm text-gray-400 mb-8">
      {{ $t('privacy.label.lastUpdated') }}: {{ $t('privacy.label.lastUpdatedDate') }}
    </p>
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>
