<script setup lang="ts">
import type { ColorOption } from '../../state/donutConfig';
import { handleRadioGroupKeydown } from '../../composables/useRadioGroupKeyboard';
import { hexToCss } from '../../utils/color';

const props = defineProps<{
  options: ColorOption[];
  groupLabel: string;
  domIdPrefix: string;
}>();

const modelValue = defineModel<string>({ required: true });

function select(id: string) {
  modelValue.value = id;
}

function onKeydown(event: KeyboardEvent) {
  handleRadioGroupKeydown(
    event,
    props.options.map((o) => o.id),
    modelValue.value,
    props.domIdPrefix,
    select
  );
}
</script>

<template>
  <div class="swatch-row" role="radiogroup" :aria-label="groupLabel">
    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      role="radio"
      class="swatch"
      :class="{ active: modelValue === opt.id }"
      :id="`${domIdPrefix}-${opt.id}`"
      :aria-checked="modelValue === opt.id"
      :aria-label="opt.label"
      :title="opt.label"
      :tabindex="modelValue === opt.id ? 0 : -1"
      :style="{ background: hexToCss(opt.hex) }"
      @click="select(opt.id)"
      @keydown="onKeydown"
    ></button>
  </div>
</template>

<style scoped>
.swatch-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  /* #8a7f74 statt des helleren #e4d9c1: erreicht ~3.9:1 Kontrast zum weißen
     Panel-Hintergrund (WCAG 1.4.11 Non-Text Contrast, min. 3:1) - wichtig
     v.a. beim weißen Swatch, dessen Rand sonst kaum sichtbar wäre. */
  border: 2px solid #8a7f74;
  cursor: pointer;
  padding: 0;
  transition: transform 0.18s;
}

.swatch:hover {
  transform: translateY(-2px) scale(1.06);
}

.swatch:focus-visible {
  outline: 3px solid #d0006f;
  outline-offset: 2px;
}

.swatch.active {
  border: 3px solid #2b2320;
  box-shadow: 0 0 0 3px #f5f1e6, 0 0 0 5px #2b2320;
}
</style>
