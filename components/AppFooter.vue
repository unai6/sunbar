<script setup lang="ts">
import { version } from '../package.json'

const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="hidden lg:flex shrink-0 items-center bg-white border-t border-gray-100 px-6 py-2">
    <div class="flex items-center justify-between max-w-[1800px] mx-auto w-full gap-2 text-xs text-gray-400">
      <span class="truncate">
        © {{ year }} SunBar · {{ $t('footer.label.attribution') }}
      </span>
      <div class="flex items-center gap-3 shrink-0">
        <span class="text-gray-300">v{{ version }}</span>
        <NuxtLink
          :to="localePath('privacy')"
          class="text-amber-600 hover:text-amber-700 transition-colors"
        >
          {{ $t('footer.link.privacy') }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
