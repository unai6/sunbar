<script setup lang="ts">
type Props = {
  loading: boolean
  venuesCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  search: []
  contribute: []
  'show-venues': []
}>()
</script>

<template>
  <div
    class="lg:hidden fixed bottom-0 left-0 right-0 z-[300] bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom,0px)]"
  >
    <div class="grid grid-cols-3 gap-1 p-1.5">
      <SearchButton
        :loading="loading"
        variant="mobile"
        @search="emit('search')"
      />
      <ContributeButton
        variant="mobile"
        @click="emit('contribute')"
      />
      <VenuesButton
        :venues-count="venuesCount"
        @show-venues="emit('show-venues')"
      />
    </div>
  </div>
</template>
