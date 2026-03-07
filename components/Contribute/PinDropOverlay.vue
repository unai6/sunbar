<script setup lang="ts">
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
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            class="w-10 h-10 text-red-500 drop-shadow-lg"
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25a7.5 7.5 0 0 0-7.5 7.5c0 4.125 2.364 7.54 5.107 10.39a30.066 30.066 0 0 0 1.871 1.77l.032.027.01.008.003.003a.75.75 0 0 0 .954 0l.004-.003.01-.008.032-.027.09-.076a31.898 31.898 0 0 0 1.78-1.694c2.743-2.85 5.107-6.265 5.107-10.39a7.5 7.5 0 0 0-7.5-7.5Zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="w-2 h-2 rounded-full bg-red-500/40 mt-[-2px]" />
        </div>
      </div>

      <!-- Floating action card below pin -->
      <div
        class="absolute top-1/2 left-1/2 z-[401] pointer-events-auto"
        style="transform: translate(-50%, 12px)"
      >
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl px-4 py-3 flex flex-col items-center gap-3 min-w-[160px]">
          <p class="text-xs font-semibold text-gray-600 text-center leading-tight">
            {{ $t('contribute.pinDrop.instruction') }}
          </p>
          <div class="flex gap-2">
            <button
              class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              :aria-label="$t('common.cta.cancel')"
              @click="emit('cancel')"
            >
              <i class="pi pi-times text-sm" />
            </button>
            <button
              class="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-500 flex items-center justify-center text-white transition-colors shadow-sm cursor-pointer"
              :aria-label="$t('contribute.pinDrop.confirm')"
              @click="emit('confirm')"
            >
              <i class="pi pi-check text-sm" />
            </button>
          </div>
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
