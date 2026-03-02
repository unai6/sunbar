<script setup lang="ts">
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="hidden lg:flex shrink-0 items-center bg-white border-t border-gray-100 px-6 py-2">
    <div class="flex items-center justify-between max-w-[1800px] mx-auto w-full gap-2 text-xs text-gray-400">
      <span class="truncate">
        © {{ year }} SunBar · {{ $t('footer.label.attribution') }}
      </span>
      <NuxtLink
        :to="localePath('privacy')"
        class="shrink-0 text-amber-600 hover:text-amber-700 transition-colors"
      >
        {{ $t('footer.link.privacy') }}
      </NuxtLink>
    </div>
  </footer>
</template>
