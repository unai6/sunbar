<template>
  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <main id="main-content" class="flex-1 overflow-hidden">
      <slot />
    </main>

    <AppFooter />

    <ClientOnly>
      <CookiesPopup />
    </ClientOnly>
  </div>
</template>
