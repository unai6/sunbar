import { isTauri } from '@tauri-apps/api/core'
import { useCookieConsentStore } from '~/stores/cookieConsent'

export default defineNuxtPlugin(() => {
  if (isTauri()) {
    const store = useCookieConsentStore()
    if (!store.hasInteracted) {
      store.acceptAll()
    }
  }
})
