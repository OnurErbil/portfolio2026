<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
}>();

const modelValue = defineModel<boolean>({ required: true });
</script>

<template>
  <div class="switch-row">
    <span class="switch-label" :id="`${id}-label`">{{ label }}</span>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-labelledby="`${id}-label`"
      class="switch-track"
      :class="{ on: modelValue }"
      @click="modelValue = !modelValue"
    >
      <span class="switch-knob"></span>
    </button>
  </div>
</template>

<style scoped>
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-label {
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #2b2320;
}

.switch-track {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  /* #8a7f74 statt eines helleren Creme-Tons: erreicht ~3.9:1 Kontrast zum
     weißen Panel-Hintergrund (WCAG 1.4.11 Non-Text Contrast, min. 3:1). */
  background: #8a7f74;
  position: relative;
  cursor: pointer;
  border: none;
  padding: 0;
  transition: background 0.15s;
}

.switch-track:focus-visible {
  outline: 3px solid #d0006f;
  outline-offset: 2px;
}

.switch-track.on {
  background: #f47216;
}

.switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.15s;
}

.switch-track.on .switch-knob {
  left: 22px;
}
</style>
