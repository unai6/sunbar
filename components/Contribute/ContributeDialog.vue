<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

const isOpen = defineModel<boolean>({
  type: Boolean,
  required: true
})


const emit = defineEmits<{
  'create-venue': []
}>()

function handleAction(action: string): void {
  isOpen.value = false
  if (action === 'create') {
    emit('create-venue')
  }
}
</script>

<template>
  <Dialog
    v-model:visible="isOpen"
    modal
    closable
    :draggable="false"
    class="w-full max-w-sm mx-4"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-plus-circle text-amber-500" />
        <span class="font-bold">{{ $t('contribute.title') }}</span>
      </div>
    </template>

    <p class="text-sm text-gray-500 mb-4">{{ $t('contribute.description') }}</p>

    <div class="flex flex-col gap-2">
      <Button
        severity="warning"
        class="w-full justify-start"
        @click="handleAction('create')"
      >
        <i class="pi pi-map-marker mr-3" />
        <div class="text-left">
          <div class="font-medium">{{ $t('contribute.action.createVenue') }}</div>
          <div class="text-xs opacity-80">{{ $t('contribute.action.createVenueHint') }}</div>
        </div>
      </Button>
    </div>

    <template #footer>
      <Button
        severity="secondary"
        outlined
        :label="$t('common.cta.cancel')"
        class="w-full"
        @click="isOpen = false"
      />
    </template>
  </Dialog>
</template>
