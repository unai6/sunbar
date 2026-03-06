<script setup lang="ts">
import Button from 'primevue/button'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[400] pointer-events-none">
      <!-- Center pin -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[401]">
        <div class="flex flex-col items-center animate-bounce-in">
          <i class="pi pi-map-marker text-4xl text-red-500/80 drop-shadow-lg" />
          <div class="w-2 h-2 rounded-full bg-red-500/40 mt-[-2px]" />
        </div>
      </div>

      <!-- Instruction banner -->
      <div class="absolute top-40 left-1/2 -translate-x-1/2 z-[401] pointer-events-auto">
        <div class="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 text-center max-w-xs">
          <p class="text-sm font-bold text-gray-800">{{ $t('contribute.pinDrop.instruction') }}</p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="absolute bottom-20 lg:bottom-0 flex justify-center w-full bg-white p-2 rounded-md left-1/2 -translate-x-1/2 z-[401] pointer-events-auto">
        <div class="flex gap-2">
          <Button
            severity="secondary"
            outlined
            :label="$t('common.cta.cancel')"
            icon="pi pi-times"
            @click="emit('cancel')"
          />
          <Button
            severity="warning"
            :label="$t('contribute.pinDrop.confirm')"
            icon="pi pi-check"
            @click="emit('confirm')"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes bounce-in {
  0% { transform: translate(-50%, -100%) scale(0.3); opacity: 0; }
  50% { transform: translate(-50%, -100%) scale(1.05); }
  70% { transform: translate(-50%, -100%) scale(0.95); }
  100% { transform: translate(-50%, -100%) scale(1); opacity: 1; }
}

.animate-bounce-in {
  animation: bounce-in 0.4s ease-out;
}
</style>
