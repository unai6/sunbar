<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: () => t('app.title.main'),
  meta: [
    { name: 'description', content: () => t('app.meta.description') },
    { property: 'og:title', content: () => t('app.title.main') },
    { property: 'og:description', content: () => t('app.meta.description') }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
