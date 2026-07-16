<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { initScene } from './three/main';

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