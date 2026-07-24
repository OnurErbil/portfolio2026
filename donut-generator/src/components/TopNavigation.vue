<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

interface NavItem {
  label: string;
  href: string;
  current?: boolean;
}

// "Meine Kreationen", "Inspiration" und "Über uns" haben noch keine echten
// Unterseiten/Routen (kein vue-router im Projekt, siehe CLAUDE.md "Noch offen").
// Die Hrefs sind bewusst Anker-Platzhalter (#...) statt echter Pfade wie
// "/inspiration" - das ist auf dem statischen IONOS-FTP-Hosting sicher (kein
// 404), bis die Seiten und ein Router dafür existieren.
const navItems: NavItem[] = [
  { label: 'Konfigurator', href: '#konfigurator', current: true },
  { label: 'Meine Kreationen', href: '#meine-kreationen' },
  { label: 'Inspiration', href: '#inspiration' },
  { label: 'Über uns', href: '#ueber-uns' },
];

const mobileOpen = ref(false);

function toggleMobileMenu() {
  mobileOpen.value = !mobileOpen.value;
}

function closeMobileMenu() {
  mobileOpen.value = false;
}

function scrollToConfigurator() {
  closeMobileMenu();
  document.getElementById('konfigurator')?.scrollIntoView({ behavior: 'smooth' });
}

// Automatisch schließen, wenn per Fenster-Resize von Mobile- in Desktop-Breite
// gewechselt wird, damit das Panel nicht "unsichtbar offen" hängen bleibt.
const desktopQuery = window.matchMedia('(min-width: 1025px)');
function handleBreakpointChange(e: MediaQueryListEvent) {
  if (e.matches) closeMobileMenu();
}

onMounted(() => {
  desktopQuery.addEventListener('change', handleBreakpointChange);
});

onBeforeUnmount(() => {
  desktopQuery.removeEventListener('change', handleBreakpointChange);
});
</script>

<template>
  <header class="nav-wrap">
    <nav class="nav-pill" aria-label="Hauptnavigation">
      <a href="#konfigurator" class="brand" @click="closeMobileMenu">
        <span class="brand-icon" aria-hidden="true">
          <span class="brand-icon-hole"></span>
          <span class="brand-icon-sprinkle s1"></span>
          <span class="brand-icon-sprinkle s2"></span>
          <span class="brand-icon-sprinkle s3"></span>
        </span>
        <span class="brand-name">DonutLab</span>
      </a>

      <ul class="nav-links">
        <li v-for="item in navItems" :key="item.href">
          <a :href="item.href" :aria-current="item.current ? 'page' : undefined">{{ item.label }}</a>
        </li>
      </ul>

      <button type="button" class="nav-cta" @click="scrollToConfigurator">Donut erstellen</button>

      <button
        type="button"
        class="nav-hamburger"
        aria-label="Menü"
        aria-controls="mobile-nav-panel"
        :aria-expanded="mobileOpen"
        @click="toggleMobileMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <div v-show="mobileOpen" id="mobile-nav-panel" class="mobile-panel">
      <a
        v-for="item in navItems"
        :key="item.href"
        :href="item.href"
        :aria-current="item.current ? 'page' : undefined"
        @click="closeMobileMenu"
        >{{ item.label }}</a
      >
      <button type="button" class="nav-cta mobile-cta" @click="scrollToConfigurator">Donut erstellen</button>
    </div>
  </header>
</template>

<style scoped>
.nav-wrap {
  padding: 20px 24px 0;
}

.nav-pill {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 999px;
  box-shadow: 0 10px 30px rgba(43, 35, 32, 0.12);
  padding: 12px 16px 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-icon {
  position: relative;
  display: block;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #d0006f;
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.brand-icon-hole {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f5f1e6;
  transform: translate(-50%, -50%);
}

.brand-icon-sprinkle {
  position: absolute;
  width: 5px;
  height: 2px;
  border-radius: 2px;
  background: #ffffff;
}

.brand-icon-sprinkle.s1 {
  top: 8px;
  left: 12px;
  background: #f47216;
  transform: rotate(30deg);
}

.brand-icon-sprinkle.s2 {
  top: 28px;
  left: 10px;
  transform: rotate(60deg);
}

.brand-icon-sprinkle.s3 {
  top: 30px;
  left: 24px;
  background: #f47216;
  transform: rotate(-45deg);
}

.brand-name {
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 22px;
  letter-spacing: 0.01em;
  color: #d0006f;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-links a {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 0.03em;
  color: #d0006f;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.nav-links a:hover,
.nav-links a:focus-visible {
  border-bottom-color: #d0006f;
}

.nav-links a[aria-current='page'] {
  /* Kein Orange hier: #F47216 auf #FFFFFF liegt bei ~2.9:1 und verfehlt sowohl
     WCAG 1.4.3 (Text, min. 4.5:1) als auch 1.4.11 (UI-Komponenten, min. 3:1).
     Das bereits geprüfte Pink (~5.4:1) erfüllt beides. */
  border-bottom-color: #d0006f;
  border-bottom-width: 3px;
}

.nav-cta {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: #2b2320;
  background: #f47216;
  border: none;
  border-radius: 999px;
  padding: 14px 28px;
  box-shadow: 0 8px 18px rgba(244, 114, 22, 0.35);
  cursor: pointer;
  white-space: nowrap;
}

a:focus-visible,
button:focus-visible {
  outline: 3px solid #d0006f;
  outline-offset: 2px;
}

.nav-hamburger {
  display: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f5f1e6;
  border: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  flex-shrink: 0;
}

.nav-hamburger span {
  width: 20px;
  height: 2px;
  background: #2b2320;
  border-radius: 2px;
}

.mobile-panel {
  display: none;
  max-width: 1180px;
  margin: 12px auto 0;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(43, 35, 32, 0.12);
  padding: 20px;
  flex-direction: column;
  gap: 8px;
}

.mobile-panel a {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 15px;
  letter-spacing: 0.03em;
  color: #d0006f;
  text-decoration: none;
  padding: 12px 8px;
  border-bottom: 1px solid #f0ebdf;
}

.mobile-panel a[aria-current='page'] {
  /* Gleicher Kontrast-Grund wie bei .nav-links oben: Pink statt Orange. */
  color: #d0006f;
  background: #fdeaf3;
  border-radius: 12px;
}

.mobile-cta {
  margin-top: 8px;
}

@media (max-width: 1024px) {
  .nav-links,
  .nav-cta:not(.mobile-cta) {
    display: none;
  }

  .nav-hamburger {
    display: flex;
  }

  /* v-show setzt bei geschlossenem Menü ein inline display:none, das diese
     Regel automatisch überstimmt (Inline-Styles schlagen Klassen-Regeln ohne
     !important) - daher hier unbedingt display:flex, kein zusätzlicher Guard nötig. */
  .mobile-panel {
    display: flex;
  }
}
</style>
