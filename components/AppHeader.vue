<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <header
    class="bg-white border-b border-gray-200 px-4 shrink-0 pt-[calc(0.375rem_+_env(safe-area-inset-top,0px))] pb-1.5"
  >
    <div class="flex items-center justify-between max-w-[1800px] mx-auto">
      <NuxtLink
        :to="localePath('/')"
        class="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <i class="pi pi-sun text-base lg:text-xl text-amber-500" aria-hidden="true" />
        <span class="text-base lg:text-xl font-bold bg-gradient-to-br from-amber-500 to-amber-600 bg-clip-text text-transparent">SunBar</span>
      </NuxtLink>

      <!-- Desktop -->
      <div class="hidden lg:block">
        <LocaleSwitcher />
      </div>

      <!-- Mobile -->
      <div class="lg:hidden">
        <MobileMenuButton />
      </div>
    </div>
  </header>
</template>
