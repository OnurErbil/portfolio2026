import { reactive } from 'vue';

// Welche Accordion-Sektion im Konfigurator gerade offen ist.
//
// Liegt bewusst hier im Store statt als lokales ref in ConfiguratorPanel.vue:
// die Three.js-Schicht (src/three/main.ts) hängt sich per watch() dran, um die
// passende Kamera-/Produkt-Szene anzufahren - dasselbe Muster wie bei Material
// und Toppings. So greift kein Three.js-Code in eine Vue-Komponente hinein.
//
// Leerer String = alle Sektionen zu = neutrale Ansicht. Der Konfigurator startet
// bewusst zugeklappt, damit die neutrale Anfangsszene überhaupt sichtbar ist.
export const sceneFocus = reactive({
  openSectionId: '',
});

export function toggleSection(id: string): void {
  sceneFocus.openSectionId = sceneFocus.openSectionId === id ? '' : id;
}
