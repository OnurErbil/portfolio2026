<template>
  <div class="configurator-layout">
    <ConfiguratorPanel />
    <div class="canvas-wrap">
      <canvas ref="canvasEl"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { initScene } from './three/main';
import ConfiguratorPanel from './components/ConfiguratorPanel.vue';

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
.configurator-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  width: 100%;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  background: #f5f1e6;
}

.canvas-wrap {
  flex: 1 1 480px;
  min-width: 320px;
  min-height: 320px;
  position: relative;
}

.canvas-wrap canvas {
  position: absolute;
  inset: 0;
}
</style>