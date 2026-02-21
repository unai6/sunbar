<script setup lang="ts">
import { DatePicker } from 'primevue'

type Props = {
  showTime?: boolean
  showIcon?: boolean
  isInline?: boolean
  hourFormat?: '12' | '24'
  showButtonBar?: boolean
  dateFormat?: string
}

const props = withDefaults(defineProps<Props>(), {
  showTime: true,
  showIcon: true,
  showButtonBar: false,
  isInline: false,
  hourFormat: '24',
  dateFormat: 'dd/mm/yy'
})

const localDateTime = defineModel<Date>({
  type: Date,
  required: true
})

function handleDateTimeChange(value: Date | Date[] | (Date | null)[] | null | undefined): void {
  if (value instanceof Date) {
    localDateTime.value = value
  }
}
</script>

<template>
  <DatePicker
    v-model="localDateTime"
    :show-time="props.showTime"
    :show-icon="props.showIcon"
    :show-button-bar="props.showButtonBar"
    :inline="$props.isInline"
    :hour-format="props.hourFormat"
    :date-format="props.dateFormat"
    class="w-full"
    @update:model-value="handleDateTimeChange"
  >
  <template #footer>
    <slot name="footer" />
  </template>
  </DatePicker>
</template>