<script setup lang="ts">
import type { IconCardOption } from '../../state/donutConfig';
import { handleRadioGroupKeydown } from '../../composables/useRadioGroupKeyboard';

const props = defineProps<{
  options: IconCardOption[];
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
  <div class="option-card-group" role="radiogroup" :aria-label="groupLabel">
    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      role="radio"
      class="option-card"
      :class="{ active: modelValue === opt.id }"
      :id="`${domIdPrefix}-${opt.id}`"
      :aria-checked="modelValue === opt.id"
      :tabindex="modelValue === opt.id ? 0 : -1"
      @click="select(opt.id)"
      @keydown="onKeydown"
    >
      <span class="option-card-icon" aria-hidden="true">{{ opt.icon }}</span>
      <span class="option-card-text">
        <span class="option-card-label">{{ opt.label }}</span>
        <span class="option-card-desc">{{ opt.desc }}</span>
      </span>
      <span class="option-card-radio" aria-hidden="true"></span>
    </button>
  </div>
</template>

<style scoped>
.option-card-group {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.option-card {
  position: relative;
  border: 2px solid #f0ebdf;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  background: #ffffff;
  font: inherit;
  color: inherit;
  text-align: left;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s, background 0.18s;
}

.option-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(43, 35, 32, 0.12);
}

.option-card:focus-visible {
  outline: 3px solid #d0006f;
  outline-offset: 2px;
}

.option-card.active {
  border-color: #f47216;
  background: #fff7ee;
}

.option-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e8dcc4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.option-card-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.option-card-label {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #2b2320;
  overflow-wrap: break-word;
}

.option-card-desc {
  font-size: 11px;
  color: #5c5148;
  margin-top: 1px;
  overflow-wrap: break-word;
}

.option-card-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #8a7f74;
  flex-shrink: 0;
}

.option-card.active .option-card-radio {
  border-color: #f47216;
  background: #f47216;
}
</style>
