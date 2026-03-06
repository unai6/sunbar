<script setup lang="ts">
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { ZodError } from 'zod'
import { createVenueDefaults, createVenueSchema, type CreateVenueInput } from '@/shared/schemas/venue.schema'

const isOpen = defineModel<boolean>({
  type: Boolean,
  required: true
})

const props = defineProps<{
  initialCoordinates?: { latitude: number; longitude: number }
}>()

const emit = defineEmits<{
  'venue-created': []
}>()

const toast = useToast()
const { t } = useI18n()

const formData = ref<CreateVenueInput>({ ...createVenueDefaults })
const latitudeInput = ref('')
const longitudeInput = ref('')
const errors = ref<Partial<Record<keyof CreateVenueInput, string>>>({})
const isSubmitting = ref(false)

const venueTypes = computed(() => [
  { label: t('venueType.label.bar'), value: 'bar' },
  { label: t('venueType.label.cafe'), value: 'cafe' },
  { label: t('venueType.label.restaurant'), value: 'restaurant' },
  { label: t('venueType.label.pub'), value: 'pub' },
  { label: t('venueType.label.nightclub'), value: 'nightclub' }
])

// Initialize coordinates if provided
watch(() => props.initialCoordinates, (coords) => {
  if (coords) {
    formData.value.latitude = coords.latitude
    formData.value.longitude = coords.longitude
    latitudeInput.value = coords.latitude.toString()
    longitudeInput.value = coords.longitude.toString()
  }
}, { immediate: true })

// Sync number inputs with formData
watch(latitudeInput, (val) => {
  formData.value.latitude = Number.parseFloat(val) || 0
})

watch(longitudeInput, (val) => {
  formData.value.longitude = Number.parseFloat(val) || 0
})

function validateField(field: keyof CreateVenueInput): boolean {
  try {
    const fieldSchema = createVenueSchema.shape[field]
    if (fieldSchema) {
      fieldSchema.parse(formData.value[field])
      errors.value[field] = undefined
      return true
    }
    return true
  } catch (error) {
    if (error instanceof ZodError) {
      errors.value[field] = error.issues[0]?.message
    }
    return false
  }
}

function validateForm(): boolean {
  try {
    createVenueSchema.parse(formData.value)
    errors.value = {}
    return true
  } catch (error) {
    if (error instanceof ZodError) {
      const newErrors: Partial<Record<keyof CreateVenueInput, string>> = {}
      error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CreateVenueInput
        if (!newErrors[field]) {
          newErrors[field] = issue.message
        }
      })
      errors.value = newErrors
    }
    return false
  }
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: t('toast.error.title'),
      detail: t('toast.error.validationDetail'),
      life: 3000
    })
    return
  }

  isSubmitting.value = true

  try {
    // Transform data to match backend API format
    const venueData = {
      venueId: `manual-${Date.now()}`,
      osmId: `manual-${Date.now()}`,
      osmType: 'node' as const,
      name: formData.value.name,
      venueType: formData.value.venueType,
      latitude: formData.value.latitude,
      longitude: formData.value.longitude,
      outdoorSeating: formData.value.outdoorSeating,
      address: formData.value.address,
      phone: formData.value.phone || undefined,
      website: formData.value.website || undefined,
      openingHours: formData.value.openingHours || undefined
    }

    await $fetch('/api/venues/manual-create', {
      method: 'POST',
      body: { venue: venueData }
    })

    toast.add({
      severity: 'success',
      summary: t('toast.success.title'),
      detail: t('toast.success.venueCreated'),
      life: 3000
    })

    emit('venue-created')
    handleClose()
  } catch (error) {
    console.error('Failed to create venue:', error)
    toast.add({
      severity: 'error',
      summary: t('toast.error.title'),
      detail: t('toast.error.createVenue'),
      life: 3000
    })
  } finally {
    isSubmitting.value = false
  }
}

function handleClose(): void {
  formData.value = { ...createVenueDefaults }
  latitudeInput.value = ''
  longitudeInput.value = ''
  errors.value = {}
  isOpen.value = false
}
</script>

<template>
  <Dialog
    v-model:visible="isOpen"
    modal
    :closable="true"
    :draggable="false"
    class="w-full max-w-2xl mx-4"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <span class="font-bold">{{ t('venueForm.title.createVenue') }}</span>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Venue Name -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="venue-name" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('venueForm.label.name') }} <span class="text-red-500">*</span>
          </label>
          <InputText
            id="venue-name"
            v-model="formData.name"
            class="w-full"
            :class="{ 'p-invalid': errors.name }"
            @blur="validateField('name')"
          />
          <small v-if="errors.name" class="text-red-500">{{ t(errors.name) }}</small>
        </div>

        <!-- Venue Type -->
        <div>
          <label for="venue-type" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('venueForm.label.type') }} <span class="text-red-500">*</span>
          </label>
          <Select
            id="venue-type"
            v-model="formData.venueType"
            class="w-full"
            :options="venueTypes"
            :class="{ 'p-invalid': errors.venueType }"
            option-label="label"
            option-value="value"
          />
          <small v-if="errors.venueType" class="text-red-500">{{ t(errors.venueType) }}</small>
        </div>
      </div>

      <!-- Outdoor Seating -->
      <div class="flex items-center gap-2">
        <Checkbox
          id="outdoor-seating"
          v-model="formData.outdoorSeating"
          binary
        />
        <label for="outdoor-seating" class="text-sm font-medium text-gray-700">
          {{ t('venueForm.label.outdoorSeating') }}
        </label>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Phone -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('venueForm.label.phone') }}
          </label>
          <InputText
            id="phone"
            v-model="formData.phone"
            class="w-full"
            type="tel"
            placeholder="+34 123 456 789"
            :class="{ 'p-invalid': errors.phone }"
            @blur="validateField('phone')"
          />
          <small v-if="errors.phone" class="text-red-500">{{ t(errors.phone) }}</small>
        </div>

        <!-- Website -->
        <div>
          <label for="website" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('venueForm.label.website') }}
          </label>
          <InputText
            id="website"
            v-model="formData.website"
            class="w-full"
            type="url"
            placeholder="https://example.com"
            :class="{ 'p-invalid': errors.website }"
            @blur="validateField('website')"
          />
          <small v-if="errors.website" class="text-red-500">{{ t(errors.website) }}</small>
        </div>

      </div>
      <!-- Opening Hours -->
      <div>
        <label for="opening-hours" class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('venueForm.label.openingHours') }}
        </label>
        <Textarea
          id="opening-hours"
          v-model="formData.openingHours"
          class="w-full"
          rows="3"
          :placeholder="t('venueForm.placeholder.openingHours')"
          :class="{ 'p-invalid': errors.openingHours }"
        />
        <small v-if="errors.openingHours" class="text-red-500">{{ t(errors.openingHours) }}</small>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          severity="secondary"
          outlined
          :label="t('common.cta.cancel')"
          :disabled="isSubmitting"
          @click="handleClose"
        />
        <Button
          severity="warning"
          :label="t('common.cta.create')"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          @click="handleSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>
