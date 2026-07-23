<script setup lang="ts">
defineProps<{
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  summary: string;
  open: boolean;
}>();

defineEmits<{ toggle: [] }>();
</script>

<template>
  <div class="accordion-section">
    <h3 class="accordion-heading">
      <button
        type="button"
        class="accordion-trigger"
        :id="`accordion-btn-${id}`"
        :aria-expanded="open"
        :aria-controls="`accordion-panel-${id}`"
        @click="$emit('toggle')"
      >
        <span class="accordion-icon" :style="{ background: iconBg }" aria-hidden="true">{{ icon }}</span>
        <span class="accordion-heading-text">
          <span class="accordion-title">{{ title }}</span>
          <span class="accordion-summary">{{ summary }}</span>
        </span>
        <svg
          class="accordion-chevron"
          :class="{ open }"
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </h3>
    <div
      v-show="open"
      :id="`accordion-panel-${id}`"
      role="region"
      :aria-labelledby="`accordion-btn-${id}`"
      class="accordion-panel"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.accordion-section {
  border-bottom: 1px solid #f0ebdf;
}

.accordion-section:last-child {
  border-bottom: none;
}

.accordion-heading {
  margin: 0;
}

.accordion-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  cursor: pointer;
  background: none;
  border: none;
  font: inherit;
  color: inherit;
  text-align: left;
}

.accordion-trigger:focus-visible {
  outline: 3px solid #d0006f;
  outline-offset: -3px;
}

.accordion-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 22px;
}

.accordion-heading-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.accordion-title {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #2b2320;
}

.accordion-summary {
  font-size: 12px;
  color: #5c5148;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.accordion-chevron {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #d0006f;
  transition: transform 0.18s;
}

.accordion-chevron.open {
  transform: rotate(180deg);
}

.accordion-panel {
  padding: 0 24px 24px;
}
</style>
