import { defineStore } from 'pinia'

export type CookieCategory = 'necessary' | 'mapping'

interface ConsentData {
  necessary: boolean
  mapping: boolean
}

export const useCookieConsentStore = defineStore('cookieConsent', () => {
  const consentCookie = useCookie<ConsentData | null>('cookie_consent', {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'strict',
    default: () => null
  })

  const isOpenOverride = ref(false)

  const hasInteracted = computed(() => consentCookie.value !== null)
  const isMappingConsented = computed(() => consentCookie.value?.mapping === true)
  const isVisible = computed(() => !hasInteracted.value || isOpenOverride.value)

  function acceptAll() {
    consentCookie.value = { necessary: true, mapping: true }
    isOpenOverride.value = false
  }

  function rejectNonEssential() {
    consentCookie.value = { necessary: true, mapping: false }
    isOpenOverride.value = false
  }

  function savePreferences(preferences: Partial<Record<CookieCategory, boolean>>) {
    consentCookie.value = {
      necessary: true,
      mapping: preferences.mapping ?? false
    }
    isOpenOverride.value = false
  }

  function openPopup() {
    isOpenOverride.value = true
  }

  return {
    hasInteracted,
    isMappingConsented,
    isVisible,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    openPopup
  }
})
