<template>
  <div class="layout">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <i class="pi pi-sun sun-icon" style="font-size: 1.5rem; color: var(--sunbar-sunny)"></i>
          <span class="logo-text">SunBar</span>
        </div>
        <p class="tagline">Find sunny terraces near you</p>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  max-width: 1800px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  color: #6b7280;
  font-size: 0.9rem;
}

.main {
  flex: 1;
  overflow: hidden;
}
</style>
