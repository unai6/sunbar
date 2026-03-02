<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const open = ref(false)

const availableLocales = computed(() =>
  (locales.value as { code: string; name: string }[])
)

async function switchLocale(code: string): Promise<void> {
  await setLocale(code as 'es' | 'en' | 'ca')
  open.value = false
}

function closeOnNav(): void {
  open.value = false
}

router.afterEach(closeOnNav)
</script>

<template>
  <!-- Burger button (stays in top bar) -->
  <button
    class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
    :class="open ? 'bg-gray-200' : 'hover:bg-gray-100'"
    :aria-label="$t('header.button.menu')"
    :aria-expanded="open"
    @click="open = !open"
  >
    <i
      class="text-gray-600 text-sm transition-all"
      :class="open ? 'pi pi-times' : 'pi pi-bars'"
      aria-hidden="true"
    />
  </button>

  <!-- Overlay (teleported to body to escape stacking context) -->
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[399]"
      aria-hidden="true"
      @click="open = false"
    />
  </Teleport>

  <!-- Dropdown (teleported to body, positioned below safe-area-inset-top) -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="fixed right-3 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[400] origin-top-right"
        style="top: calc(2.75rem + 0.5rem + env(safe-area-inset-top, 0px))"
      >
        <!-- Language -->
        <div class="px-3 pt-3 pb-2.5 border-b border-gray-100">
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {{ $t('header.label.language') }}
          </p>
          <div class="flex gap-1">
            <button
              v-for="loc in availableLocales"
              :key="loc.code"
              class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              :class="locale === loc.code
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              @click="switchLocale(loc.code)"
            >
              {{ loc.code.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Links -->
        <div class="p-1">
          <NuxtLink
            :to="localePath('privacy')"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            @click="open = false"
          >
            <i class="pi pi-shield text-gray-400 text-xs" aria-hidden="true" />
            {{ $t('footer.link.privacy') }}
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
