<script setup lang="ts">
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
  <!-- Blocking backdrop — prevents any interaction with the app behind -->
  <div
    v-if="isVisible"
    class="fixed inset-0 z-[8999] bg-black/40"
    aria-hidden="true"
  />

  <!-- Cookie Banner -->
  <Transition name="cookie-banner">
    <div
      v-if="isVisible"
      ref="cookieDialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
      class="fixed bottom-0 left-0 right-0 z-[9000] bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      @keydown.tab="handleTab"
    >
      <div class="max-w-5xl mx-auto px-4 py-4">
        <!-- Header -->
        <div class="flex items-start gap-3 mb-3">
          <i class="pi pi-shield text-amber-500 text-lg mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p id="cookie-banner-title" class="font-semibold text-gray-900 text-sm">{{ t('cookies.popup.title') }}</p>
            <p class="text-gray-600 text-sm mt-0.5">{{ t('cookies.popup.description') }}</p>
          </div>
        </div>

        <!-- Customize panel -->
        <div
          v-if="isCustomizing"
          class="mb-4 border border-gray-200 rounded-lg bg-gray-50 divide-y divide-gray-200 overflow-hidden"
        >
          <!-- Necessary cookies (always on) -->
          <div class="flex items-start justify-between gap-4 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ t('cookies.category.necessary.title') }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ t('cookies.category.necessary.description') }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 mt-0.5">
              <span class="text-xs text-gray-400">{{ t('cookies.label.alwaysActive') }}</span>
              <!-- Non-interactive toggle (always on) -->
              <div
                class="relative w-10 h-5 bg-amber-400/60 rounded-full cursor-not-allowed shrink-0"
                aria-hidden="true"
              >
                <span class="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>

          <!-- Mapping / ArcGIS cookies -->
          <div class="flex items-start justify-between gap-4 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ t('cookies.category.mapping.title') }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ t('cookies.category.mapping.description') }}</p>
            </div>
            <button
              role="switch"
              :aria-checked="mappingEnabled"
              :aria-label="t('cookies.category.mapping.title')"
              class="relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
              :class="mappingEnabled ? 'bg-amber-500' : 'bg-gray-300'"
              @click="mappingEnabled = !mappingEnabled"
            >
              <span
                class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                :class="mappingEnabled ? 'left-[calc(100%-1.125rem)]' : 'left-0.5'"
              />
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-2 justify-end">
          <button
            v-if="!isCustomizing"
            class="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-900 transition-colors"
            @click="openCustomize"
          >
            {{ t('cookies.button.customize') }}
          </button>
          <button
            v-if="!isCustomizing"
            class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            @click="store.rejectNonEssential()"
          >
            {{ t('cookies.button.rejectNonEssential') }}
          </button>
          <button
            v-if="isCustomizing"
            class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            @click="savePreferences"
          >
            {{ t('cookies.button.savePreferences') }}
          </button>
          <button
            class="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            @click="store.acceptAll()"
          >
            {{ t('cookies.button.acceptAll') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-banner-enter-active,
.cookie-banner-leave-active {
  transition: transform 0.3s ease;
}

.cookie-banner-enter-from,
.cookie-banner-leave-to {
  transform: translateY(100%);
}
</style>
