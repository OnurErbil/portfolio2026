<template>
  <a class="skip-link" href="#konfigurator">Zum Hauptinhalt springen</a>
  <TopNavigation />
  <main id="konfigurator" tabindex="-1" class="configurator-layout container">
    <ConfiguratorPanel />
    <!-- Reihenfolge = Ebenen: Studio-Hintergrund (CSS) unten, Three.js-Canvas
         transparent darüber. Die UI liegt komplett außerhalb dieses Wrappers. -->
    <div class="canvas-wrap">
      <StudioBackground />
      <canvas ref="canvasEl"></canvas>
    </div>
  </main>
  <CollectionBar />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { initScene } from './three/main';
import TopNavigation from './components/TopNavigation.vue';
import ConfiguratorPanel from './components/ConfiguratorPanel.vue';
import CollectionBar from './components/CollectionBar.vue';
import StudioBackground from './components/StudioBackground.vue';

const canvasEl = ref<HTMLCanvasElement | null>(null);
let cleanup: (() => void) | null = null;

onMounted(() => {
  if (canvasEl.value) {
    cleanup = initScene(canvasEl.value);
  }
});

onUnmounted(() => {
  cleanup?.();
});
</script>

<style scoped>

.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  z-index: 100;
  background: #2b2320;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 20px;
  border-radius: 999px;
  text-decoration: none;
  transition: top 0.15s ease;
}

.skip-link:focus {
  top: 16px;
}

.configurator-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 24px;
  padding-bottom: var(--collection-bar-space);
  box-sizing: border-box;
  background: #f5f1e6;
  outline: none;
}

.canvas-wrap {
  flex: 1 1 480px;
  min-width: 320px;
  min-height: 320px;
  position: relative;
  border-radius: 24px;
}

/* Canvas selbst ist transparent (renderer mit alpha), der Hintergrund kommt
   aus StudioBackground.vue darunter - z-index hält die Ebenen unabhängig von
   der DOM-Reihenfolge stabil. */
.canvas-wrap canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 24px;
  background: transparent;
}
</style>