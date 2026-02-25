<script setup lang="ts">
import Toast from 'primevue/toast'
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
    <header class="hidden md:block bg-white border-b border-gray-200 px-6 py-3 shrink-0">
      <div class="flex items-center justify-between max-w-[1800px] mx-auto">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <i class="pi pi-sun text-2xl text-amber-500" />
            <span class="text-2xl font-bold bg-gradient-to-br from-amber-500 to-amber-600 bg-clip-text text-transparent">
              SunBar
            </span>
          </div>
          <p class="text-gray-500 text-sm hidden sm:block">{{ $t('header.label.tagline') }}</p>
        </div>
        <div class="flex items-center">
          <LocaleSwitcher />
        </div>
      </div>
    </header>

    <main id="main-content" class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
