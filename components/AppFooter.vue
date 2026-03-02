<script setup lang="ts">
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="shrink-0 bg-white border-t border-gray-100 px-4 py-2 lg:px-6"
    :style="{ paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }"
    :class="{ 'lg:!pb-2': true }"
  >
    <div class="flex items-center justify-between max-w-[1800px] mx-auto gap-2 text-xs text-gray-400">
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
