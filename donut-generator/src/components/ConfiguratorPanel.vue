<script setup lang="ts">
import { computed, ref } from 'vue';
import AccordionSection from './configurator/AccordionSection.vue';
import OptionCardGroup from './configurator/OptionCardGroup.vue';
import ColorSwatchGroup from './configurator/ColorSwatchGroup.vue';
import ToppingChipGroup from './configurator/ToppingChipGroup.vue';
import SwitchToggle from './configurator/SwitchToggle.vue';
import {
  donutConfig,
  doughOptions,
  icingColors,
  shapeOptions,
  fillingOptions,
  toppingOptions,
  toggleTopping,
} from '../state/donutConfig';

const openSectionId = ref('form');

function toggleSection(id: string) {
  openSectionId.value = openSectionId.value === id ? '' : id;
}

const shapeSummary = computed(
  () => shapeOptions.find((o) => o.id === donutConfig.shapeId)?.label ?? ''
);
const doughSummary = computed(
  () => doughOptions.find((o) => o.id === donutConfig.doughId)?.label ?? ''
);
const fillingSummary = computed(
  () => fillingOptions.find((o) => o.id === donutConfig.fillingId)?.label ?? ''
);
const icingSummary = computed(() => {
  const name = icingColors.find((c) => c.id === donutConfig.icingColorId)?.label ?? 'Individuell';
  return `${name} · Glanz ${donutConfig.glossValue}%`;
});
const toppingsSummary = computed(() => {
  if (donutConfig.toppingIds.length === 0) return 'Keine Toppings';
  return donutConfig.toppingIds
    .map((id) => toppingOptions.find((t) => t.id === id)?.label)
    .filter(Boolean)
    .join(', ');
});
const dietSummary = computed(() => {
  const parts: string[] = [];
  if (donutConfig.vegan) parts.push('Vegan');
  if (donutConfig.glutenfrei) parts.push('Glutenfrei');
  return parts.length ? parts.join(' · ') : 'Keine Filter';
});
</script>

<template>
  <aside class="configurator-panel">
    <div class="panel-header">
      <div class="panel-eyebrow">Konfigurator</div>
      <h1 class="panel-title">Bau deinen Donut</h1>
    </div>

    <div class="accordion">
      <AccordionSection
        id="form"
        icon="🍩"
        icon-bg="#FCE9DA"
        title="Form"
        :summary="shapeSummary"
        :open="openSectionId === 'form'"
        @toggle="toggleSection('form')"
      >
        <OptionCardGroup
          v-model="donutConfig.shapeId"
          :options="shapeOptions"
          group-label="Form auswählen"
          dom-id-prefix="shape"
        />
      </AccordionSection>

      <AccordionSection
        id="teig"
        icon="🥖"
        icon-bg="#F3E4C0"
        title="Teig"
        :summary="doughSummary"
        :open="openSectionId === 'teig'"
        @toggle="toggleSection('teig')"
      >
        <OptionCardGroup
          v-model="donutConfig.doughId"
          :options="doughOptions"
          group-label="Teig auswählen"
          dom-id-prefix="dough"
        />
      </AccordionSection>

      <AccordionSection
        id="fuellung"
        icon="🍇"
        icon-bg="#EDE3F5"
        title="Füllung"
        :summary="fillingSummary"
        :open="openSectionId === 'fuellung'"
        @toggle="toggleSection('fuellung')"
      >
        <OptionCardGroup
          v-model="donutConfig.fillingId"
          :options="fillingOptions"
          group-label="Füllung auswählen"
          dom-id-prefix="filling"
        />
      </AccordionSection>

      <AccordionSection
        id="icing"
        icon="🍥"
        icon-bg="#FBE1EE"
        title="Icing / Glasur"
        :summary="icingSummary"
        :open="openSectionId === 'icing'"
        @toggle="toggleSection('icing')"
      >
        <div class="icing-content">
          <ColorSwatchGroup
            v-model="donutConfig.icingColorId"
            :options="icingColors"
            group-label="Icing-Farbe auswählen"
            dom-id-prefix="icing"
          />
          <div class="gloss-control">
            <div class="gloss-label-row">
              <label for="gloss-slider">Glanzgrad</label>
              <span aria-hidden="true">{{ donutConfig.glossValue }}%</span>
            </div>
            <input
              id="gloss-slider"
              type="range"
              min="0"
              max="100"
              v-model.number="donutConfig.glossValue"
              :aria-valuetext="`${donutConfig.glossValue}% glänzend`"
            />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        id="toppings"
        icon="✨"
        icon-bg="#FCE9DA"
        title="Toppings"
        :summary="toppingsSummary"
        :open="openSectionId === 'toppings'"
        @toggle="toggleSection('toppings')"
      >
        <ToppingChipGroup
          :model-value="donutConfig.toppingIds"
          :options="toppingOptions"
          group-label="Toppings auswählen"
          @toggle="toggleTopping"
        />
      </AccordionSection>

      <AccordionSection
        id="diaet"
        icon="🌱"
        icon-bg="#E3F0E6"
        title="Ernährungsfilter"
        :summary="dietSummary"
        :open="openSectionId === 'diaet'"
        @toggle="toggleSection('diaet')"
      >
        <div class="diet-content">
          <SwitchToggle id="vegan" label="Vegan" v-model="donutConfig.vegan" />
          <SwitchToggle id="glutenfrei" label="Glutenfrei" v-model="donutConfig.glutenfrei" />
        </div>
      </AccordionSection>
    </div>
  </aside>
</template>

<style scoped>
.configurator-panel {
  font-family: 'Poppins', sans-serif;
  color: #2b2320;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(43, 35, 32, 0.1);
  width: 380px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 24px 24px 0;
}

.panel-eyebrow {
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #d0006f;
}

.panel-title {
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 26px;
  margin: 4px 0 20px;
}

.accordion {
  overflow-y: auto;
  border-top: 1px solid #f0ebdf;
}

.icing-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.gloss-control label {
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #5c5148;
}

.gloss-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #5c5148;
  margin-bottom: 8px;
}

.gloss-control input[type='range'] {
  width: 100%;
  accent-color: #f47216;
}

.diet-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
