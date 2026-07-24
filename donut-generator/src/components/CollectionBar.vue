<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import {
  donutConfig,
  shapeOptions,
  doughOptions,
  fillingOptions,
  icingColors,
  toppingOptions,
  getPrice,
} from '../state/donutConfig';
import { addCurrentDonutToCollection } from '../state/collection';
import { hexToCss } from '../utils/color';

interface SelectionChip {
  key: string;
  label: string;
  hex: number;
  outlined: boolean;
}

// Sehr helle Farben (Weiß & das cremefarbene Kokos-Topping) brauchen einen
// sichtbaren Rand, sonst verschwindet der Punkt im hellen Chip-Hintergrund.
function needsOutline(hex: number): boolean {
  return hex === 0xffffff || hex === 0xf5f1e6;
}

const selectionChips = computed<SelectionChip[]>(() => {
  const chips: SelectionChip[] = [];
  const shape = shapeOptions.find((o) => o.id === donutConfig.shapeId);
  const dough = doughOptions.find((o) => o.id === donutConfig.doughId);
  const filling = fillingOptions.find((o) => o.id === donutConfig.fillingId);
  const icing = icingColors.find((c) => c.id === donutConfig.icingColorId);

  if (shape) chips.push({ key: 'shape', label: shape.label, hex: shape.hex, outlined: needsOutline(shape.hex) });
  if (dough) chips.push({ key: 'dough', label: dough.label, hex: dough.hex, outlined: needsOutline(dough.hex) });
  if (filling) {
    chips.push({
      key: 'filling',
      label: filling.label,
      hex: filling.hex,
      outlined: needsOutline(filling.hex),
    });
  }
  if (icing) {
    chips.push({
      key: 'icing',
      label: `Icing ${icing.label}`,
      hex: icing.hex,
      outlined: needsOutline(icing.hex),
    });
  }
  for (const id of donutConfig.toppingIds) {
    const topping = toppingOptions.find((t) => t.id === id);
    if (topping) {
      chips.push({ key: `topping-${id}`, label: topping.label, hex: topping.hex, outlined: needsOutline(topping.hex) });
    }
  }
  if (donutConfig.vegan) chips.push({ key: 'vegan', label: 'Vegan', hex: 0x4c8b5f, outlined: false });
  if (donutConfig.glutenfrei) chips.push({ key: 'glutenfrei', label: 'Glutenfrei', hex: 0x4c8b5f, outlined: false });

  return chips;
});

const priceLabel = computed(() => `${getPrice().toFixed(2)} €`);

const CONFETTI_PARTICLES = [
  { left: '14%', color: '#F47216', delay: '0ms' },
  { left: '30%', color: '#D0006F', delay: '60ms' },
  { left: '48%', color: '#F5D95E', delay: '20ms' },
  { left: '64%', color: '#4B2E1A', delay: '90ms' },
  { left: '78%', color: '#7FD1AE', delay: '40ms' },
  { left: '90%', color: '#F47216', delay: '110ms' },
];

const confettiActive = ref(false);
const toastActive = ref(false);
let confettiTimer: ReturnType<typeof setTimeout> | undefined;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

function handleAddToCollection() {
  addCurrentDonutToCollection();

  clearTimeout(confettiTimer);
  clearTimeout(toastTimer);

  confettiActive.value = true;
  toastActive.value = true;
  confettiTimer = setTimeout(() => {
    confettiActive.value = false;
  }, 700);
  toastTimer = setTimeout(() => {
    toastActive.value = false;
  }, 2200);
}

onBeforeUnmount(() => {
  clearTimeout(confettiTimer);
  clearTimeout(toastTimer);
});
</script>

<template>
  <div class="collection-bar">
    <div class="collection-bar-inner">
      <ul class="chip-row" aria-label="Ausgewählte Optionen">
        <li v-for="chip in selectionChips" :key="chip.key" class="summary-chip">
          <span
            class="summary-chip-dot"
            :class="{ outlined: chip.outlined }"
            :style="{ background: hexToCss(chip.hex) }"
            aria-hidden="true"
          ></span>
          {{ chip.label }}
        </li>
      </ul>

      <div class="collection-bar-footer">
        <div class="price-block">
          <div class="price-eyebrow">Dein Donut</div>
          <div class="price-value">{{ priceLabel }}</div>
        </div>
        <button type="button" class="add-button" @click="handleAddToCollection">
          Zur Sammlung hinzufügen
          <span class="confetti" aria-hidden="true">
            <span
              v-for="(particle, i) in CONFETTI_PARTICLES"
              v-show="confettiActive"
              :key="i"
              class="confetti-particle"
              :style="{ left: particle.left, background: particle.color, animationDelay: particle.delay }"
            ></span>
          </span>
        </button>
      </div>
    </div>

    <div class="toast" :class="{ visible: toastActive }" role="status" aria-live="polite">
      Donut gespeichert! 🍩
    </div>
  </div>
</template>

<style scoped>
.collection-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 0 -8px 24px rgba(43, 35, 32, 0.12);
  padding: 14px 24px;
  z-index: 40;
}

.collection-bar-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chip-row {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.summary-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f1e6;
  border-radius: 999px;
  padding: 5px 12px 5px 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #5c5148;
  white-space: nowrap;
  flex-shrink: 0;
}

.summary-chip-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.summary-chip-dot.outlined {
  border: 1px solid #8a7f74;
}

.collection-bar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.price-eyebrow {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  color: #5c5148;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.price-value {
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-size: 26px;
  color: #d0006f;
}

.add-button {
  position: relative;
  overflow: visible;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 15px;
  /* Dunkler Text statt Weiß auf #F47216: Weiß auf Orange liegt bei ~2.9:1
     Kontrast und verfehlt WCAG 1.4.3 (min. 4.5:1 bei dieser Schriftgröße).
     #2B2320 auf #F47216 erreicht ~5.3:1. */
  color: #2b2320;
  background: #f47216;
  border: none;
  border-radius: 999px;
  padding: 16px 36px;
  box-shadow: 0 8px 18px rgba(244, 114, 22, 0.35);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
}

.add-button:hover {
  /* Kein dunkleres Orange auf Hover: würde den Textkontrast unter 4.5:1 drücken.
     Stattdessen nur ein optischer "Lift". */
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(244, 114, 22, 0.45);
}

.add-button:focus-visible {
  outline: 3px solid #d0006f;
  outline-offset: 3px;
}

.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.confetti-particle {
  position: absolute;
  top: 6px;
  width: 7px;
  height: 7px;
  border-radius: 2px;
  animation: confetti-fall 650ms ease-out forwards;
  opacity: 0;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-6px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(54px) rotate(320deg);
    opacity: 0;
  }
}

.toast {
  position: fixed;
  bottom: 92px;
  left: 50%;
  transform: translateX(-50%);
  background: #2b2320;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 14px 24px;
  border-radius: 999px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  opacity: 0;
  transition: bottom 0.25s ease, opacity 0.25s ease;
  pointer-events: none;
  z-index: 50;
}

.toast.visible {
  bottom: 108px;
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .confetti-particle {
    animation: none;
    opacity: 0;
  }

  .toast {
    transition: none;
  }
}
</style>
