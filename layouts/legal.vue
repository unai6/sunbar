<script setup lang="ts">
import Toast from 'primevue/toast'

const localePath = useLocalePath()
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-gray-50">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      {{ $t('common.label.skipToContent') }}
    </a>
    <Toast position="top-center" />
    <header class="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
      <div class="flex items-center justify-between max-w-3xl mx-auto">
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <i class="pi pi-sun text-2xl text-amber-500" />
          <span class="text-2xl font-bold bg-gradient-to-br from-amber-500 to-amber-600 bg-clip-text text-transparent">
            SunBar
          </span>
        </NuxtLink>
        <LocaleSwitcher />
      </div>
    </header>

    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-white px-6 py-4">
      <div class="max-w-3xl mx-auto flex items-center justify-between text-sm text-gray-500">
        <span>© {{ new Date().getFullYear() }} SunBar</span>
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors font-medium"
        >
          <i class="pi pi-arrow-left text-xs" />
          {{ $t('privacy.label.backToApp') }}
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>
