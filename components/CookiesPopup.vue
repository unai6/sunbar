<script setup lang="ts">
import Button from 'primevue/button'
import { storeToRefs } from 'pinia'
import { useCookieConsentStore } from '~/stores/cookieConsent'

const { t } = useI18n()
const store = useCookieConsentStore()
const { isVisible, isMappingConsented } = storeToRefs(store)

const isCustomizing = ref(false)
const mappingEnabled = ref(true)
const dialogRef = useTemplateRef<HTMLElement>('cookieDialog')

function openCustomize() {
  mappingEnabled.value = isMappingConsented.value
  isCustomizing.value = true
}

function savePreferences() {
  store.savePreferences({ mapping: mappingEnabled.value })
  isCustomizing.value = false
}

function getFocusableElements(): HTMLElement[] {
  if (!dialogRef.value) return []
  return Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

function handleTab(event: KeyboardEvent): void {
  const focusable = getFocusableElements()
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }
  } else if (document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(isVisible, (visible) => {
  if (visible) {
    nextTick(() => getFocusableElements()[0]?.focus())
  }
}, { immediate: true })
</script>

<template>
  <!-- Blocking backdrop -->
  <div
    v-if="isVisible"
    class="fixed inset-0 z-[8999] bg-black/40 backdrop-blur-[2px]"
    aria-hidden="true"
  />

  <!-- Cookie banner -->
  <Transition name="cookie-banner">
    <div
      v-if="isVisible"
      ref="cookieDialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
      class="fixed bottom-0 left-0 right-0 z-[9000] bg-white border-t-2 border-amber-500 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
      @keydown.tab="handleTab"
    >
      <div class="max-w-5xl mx-auto px-5 py-4">

        <!-- Main row: icon+text | actions -->
        <div class="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">

          <!-- Icon + text -->
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <i class="pi pi-shield text-amber-500 text-sm" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <p id="cookie-banner-title" class="font-semibold text-gray-900 text-sm">
                {{ t('cookies.popup.title') }}
              </p>
              <p class="text-gray-500 text-xs mt-0.5 leading-relaxed">
                {{ t('cookies.popup.description') }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4 lg:shrink-0">
            <div class="flex items-center gap-4">
              <Button
                v-if="!isCustomizing"
                unstyled
                class="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
                @click="store.rejectNonEssential()"
              >
                {{ t('cookies.button.rejectNonEssential') }}
              </Button>
              <Button
                v-if="!isCustomizing"
                unstyled
                class="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
                @click="openCustomize"
              >
                {{ t('cookies.button.customize') }}
              </Button>
              <Button
                v-if="isCustomizing"
                outlined
                severity="secondary"
                size="small"
                :label="t('cookies.button.savePreferences')"
                @click="savePreferences"
              />
            </div>
            <Button
              severity="warning"
              size="small"
              :label="t('cookies.button.acceptAll')"
              class="shrink-0"
              @click="store.acceptAll()"
            />
          </div>
        </div>

        <!-- Customize panel -->
        <div
          v-if="isCustomizing"
          class="mt-3 rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100 overflow-hidden"
        >
          <!-- Necessary (always on) -->
          <div class="flex items-start justify-between gap-6 px-4 py-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {{ t('cookies.category.necessary.title') }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {{ t('cookies.category.necessary.description') }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0 pt-0.5">
              <span class="text-xs text-gray-400">{{ t('cookies.label.alwaysActive') }}</span>
              <div
                class="relative w-9 h-5 bg-amber-200 rounded-full cursor-not-allowed shrink-0"
                aria-hidden="true"
              >
                <span class="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          <!-- Mapping / ArcGIS -->
          <div class="flex items-start justify-between gap-6 px-4 py-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {{ t('cookies.category.mapping.title') }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {{ t('cookies.category.mapping.description') }}
              </p>
            </div>
            <Button
              unstyled
              role="switch"
              :aria-checked="mappingEnabled"
              :aria-label="t('cookies.category.mapping.title')"
              class="relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 mt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              :class="mappingEnabled ? 'bg-amber-500' : 'bg-gray-200'"
              @click="mappingEnabled = !mappingEnabled"
            >
              <span
                class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-[left] duration-200"
                :class="mappingEnabled ? 'left-[calc(100%-1.125rem)]' : 'left-0.5'"
              />
            </Button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-banner-enter-active,
.cookie-banner-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cookie-banner-enter-from,
.cookie-banner-leave-to {
  transform: translateY(100%);
}
</style>
