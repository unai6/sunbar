<script setup lang="ts">
import Button from 'primevue/button'

type Props = {
  variant?: 'desktop' | 'mobile'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'desktop'
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <!-- Desktop variant -->
  <Button
    v-if="props.variant === 'desktop'"
    :label="$t('common.cta.contribute')"
    icon="pi pi-plus"
    class="w-full"
    severity="warning"
    @click="emit('click')"
  />

  <!-- Mobile variant -->
  <Button
    v-else
    variant="outlined"
    severity="warning"
    class="flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all duration-200 active:scale-95 active:bg-amber-600"
    @click="emit('click')"
  >
    <span class="contents">
      <i class="pi pi-plus text-base" />
      <span class="text-[10px] mt-0.5 font-medium">{{ $t('controlPanel.mobile.contribute') }}</span>
    </span>
  </Button>
</template>
