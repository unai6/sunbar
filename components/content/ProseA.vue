<script setup lang="ts">
defineProps<{ href?: string }>()
</script>

<template>
  <a
    :href="href"
    class="text-amber-600 hover:text-amber-700 underline underline-offset-2 transition-colors"
    v-bind="href?.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
  >
    <slot />
  </a>
</template>
