<script setup lang="ts">
import type { ToppingOption } from '../../state/donutConfig';
import { hexToCss } from '../../utils/color';

defineProps<{
  options: ToppingOption[];
  modelValue: string[];
  groupLabel: string;
}>();

defineEmits<{ toggle: [id: string] }>();
</script>

<template>
  <div class="chip-row" role="group" :aria-label="groupLabel">
    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      role="checkbox"
      class="chip"
      :class="{ active: modelValue.includes(opt.id) }"
      :aria-checked="modelValue.includes(opt.id)"
      @click="$emit('toggle', opt.id)"
    >
      <span class="chip-dot" :style="{ background: hexToCss(opt.hex) }" aria-hidden="true"></span>
      <span class="chip-label">{{ opt.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 2px solid #f0ebdf;
  background: #ffffff;
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s, background 0.18s;
}

.chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(43, 35, 32, 0.12);
}

.chip:focus-visible {
  outline: 3px solid #d0006f;
  outline-offset: 2px;
}

.chip.active {
  border-color: #f47216;
  background: #fff7ee;
}

.chip-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #8a7f74;
  flex-shrink: 0;
}

.chip-label {
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #2b2320;
}
</style>
