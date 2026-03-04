<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-auto bg-gray-50">
    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-white px-6 pt-4 pb-[calc(1rem_+_env(safe-area-inset-bottom,0px))]">
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
