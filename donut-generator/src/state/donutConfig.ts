import { reactive } from 'vue';

export interface IconCardOption {
  id: string;
  label: string;
  desc: string;
  // Farbe des Orientierungs-Punkts in OptionCardGroup und der Chips in der
  // CollectionBar - hat keinen Bezug zur 3D-Szene bei Form/Füllung
  // (siehe Platzhalter-Hinweis unten).
  hex: number;
}

export interface ColorOption {
  id: string;
  label: string;
  hex: number;
}

export interface ToppingOption {
  id: string;
  label: string;
  hex: number;
}

// Teig & Icing sind auf echte Meshes ('donut' / 'icing') im donut.glb gemappt,
// siehe src/three/main.ts.
export const doughOptions: IconCardOption[] = [
  { id: 'hefe', label: 'Hefeteig', desc: 'Locker & luftig', hex: 0xe8c177 },
  { id: 'schoko', label: 'Schokoladenteig', desc: 'Reicher Kakao-Teig', hex: 0x6b4226 },
  { id: 'vollkorn', label: 'Vollkorn', desc: 'Mit Vollkornmehl', hex: 0xc9a15e },
  { id: 'vegan', label: 'Vegan-Teig', desc: 'Pflanzlich, ohne Ei', hex: 0xf3e4c0 },
];

export const icingColors: ColorOption[] = [
  { id: 'orange', label: 'Orange', hex: 0xf47216 },
  { id: 'pink', label: 'Magenta', hex: 0xd0006f },
  { id: 'white', label: 'Weiß', hex: 0xffffff },
  { id: 'choc', label: 'Schoko', hex: 0x4b2e1a },
  { id: 'mint', label: 'Minze', hex: 0x7fd1ae },
  { id: 'lemon', label: 'Zitrone', hex: 0xf5d95e },
];

// --- Platzhalter-Bereiche ---
// Im aktuellen donut.glb existieren nur die Meshes 'donut' und 'icing' (siehe
// Mesh-Namenskonvention in CLAUDE.md). Form und Füllung haben noch keine
// Entsprechung im Modell. Die UI dafür ist voll bedienbar und der State wird
// gepflegt, wirkt sich aber bewusst noch nicht auf die 3D-Szene aus - die
// Anwendung passiert hinter den Platzhalter-Funktionen in
// src/three/placeholders.ts, die befüllt werden, sobald die Meshes da sind.
// (Toppings sind kein Platzhalter mehr, siehe src/three/toppings.ts.)
// Vorerst bewusst nur die klassische Form - weitere Formen (Ring mit Twist,
// Länglich/Bar, Mini-Donuts, siehe context/Konfigurator Seite.dc.html) kommen
// evtl. später dazu, sobald es dafür Meshes gibt.
export const shapeOptions: IconCardOption[] = [
  { id: 'classic', label: 'Klassisch rund', desc: 'Der Original-Ring', hex: 0xf4a62a },
];

export const fillingOptions: IconCardOption[] = [
  { id: 'ohne', label: 'Ohne', desc: 'Pur ohne Füllung', hex: 0xffffff },
  { id: 'vanille', label: 'Vanillecreme', desc: 'Cremig & süß', hex: 0xf5e1a4 },
  { id: 'erdbeer', label: 'Erdbeermarmelade', desc: 'Fruchtig-fein', hex: 0xe23d6b },
  { id: 'schoko', label: 'Schokolade', desc: 'Zartschmelzend', hex: 0x4b2e1a },
  { id: 'karamell', label: 'Karamell', desc: 'Salzig-süß', hex: 0xc97b2e },
];

// Toppings werden echt in 3D generiert (src/three/toppings.ts) - vorerst nur die
// beiden Sorten, für die es dort Geometrie gibt: Streusel (Kapseln) und
// Schokostückchen (Kugeln). Der Hex-Wert hier ist die Farbe in der UI (Chip-Punkt);
// im 3D gilt er nur für Schokostückchen - Streusel werden bunt gemischt eingefärbt
// (Palette in src/three/toppings.ts).
export const toppingOptions: ToppingOption[] = [
  { id: 'streusel', label: 'Streusel', hex: 0xf47216 },
  { id: 'schoko', label: 'Schokostückchen', hex: 0x4b2e1a },
];

export const donutConfig = reactive({
  shapeId: shapeOptions[0].id,
  doughId: doughOptions[0].id,
  fillingId: fillingOptions[0].id,
  icingColorId: icingColors[1].id,
  glossValue: 50,
  toppingIds: [] as string[],
  vegan: false,
  glutenfrei: false,
});

export function toggleTopping(id: string): void {
  const idx = donutConfig.toppingIds.indexOf(id);
  if (idx === -1) {
    donutConfig.toppingIds.push(id);
  } else {
    donutConfig.toppingIds.splice(idx, 1);
  }
}

export function getDoughHex(): number {
  return doughOptions.find((o) => o.id === donutConfig.doughId)?.hex ?? doughOptions[0].hex;
}

export function getIcingHex(): number {
  return icingColors.find((c) => c.id === donutConfig.icingColorId)?.hex ?? icingColors[0].hex;
}

// Der Regler zeigt bewusst die volle Skala 0-100 %, wirkt im 3D aber nur in
// diesem eingeschränkten Band - darüber/darunter wirkt die Glasur zu spiegelnd
// bzw. zu stumpf. 0 % Regler = EFFECTIVE_GLOSS_MIN, 100 % = EFFECTIVE_GLOSS_MAX.
const EFFECTIVE_GLOSS_MIN = 10;
const EFFECTIVE_GLOSS_MAX = 50;

// Glanzgrad in Prozent -> Roughness (1 = ganz matt, 0.1 = fast spiegelnd).
// Ergebnis liegt durch das Band oben zwischen ~0.91 (matt) und ~0.55 (seidig).
export function getIcingRoughness(): number {
  const effectiveGloss =
    EFFECTIVE_GLOSS_MIN +
    (donutConfig.glossValue / 100) * (EFFECTIVE_GLOSS_MAX - EFFECTIVE_GLOSS_MIN);
  return 1 - (effectiveGloss / 100) * 0.9;
}

const BASE_PRICE = 3.2;
const FILLING_PRICE = 0.4;
const TOPPING_PRICE = 0.3;
const DIET_SURCHARGE = 0.5;

export function getPrice(): number {
  let price = BASE_PRICE + donutConfig.toppingIds.length * TOPPING_PRICE;
  if (donutConfig.fillingId !== 'ohne') price += FILLING_PRICE;
  if (donutConfig.vegan) price += DIET_SURCHARGE;
  if (donutConfig.glutenfrei) price += DIET_SURCHARGE;
  return price;
}
