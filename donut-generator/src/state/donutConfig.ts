import { reactive } from 'vue';

export interface IconCardOption {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

export interface DoughOption extends IconCardOption {
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
export const doughOptions: DoughOption[] = [
  { id: 'hefe', label: 'Hefeteig', desc: 'Locker & luftig', icon: '🍞', hex: 0xe8c177 },
  { id: 'schoko', label: 'Schokoladenteig', desc: 'Reicher Kakao-Teig', icon: '🍫', hex: 0x6b4226 },
  { id: 'vollkorn', label: 'Vollkorn', desc: 'Mit Vollkornmehl', icon: '🌾', hex: 0xc9a15e },
  { id: 'vegan', label: 'Vegan-Teig', desc: 'Pflanzlich, ohne Ei', icon: '🌿', hex: 0xf3e4c0 },
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
// Mesh-Namenskonvention in CLAUDE.md). Form, Füllung und Toppings haben noch
// keine Entsprechung im Modell. Die UI unten ist voll bedienbar und der State
// wird gepflegt, wirkt sich aber bewusst noch nicht auf die 3D-Szene aus -
// die Anwendung passiert hinter den Platzhalter-Funktionen in
// src/three/placeholders.ts, die befüllt werden, sobald die Meshes da sind.
export const shapeOptions: IconCardOption[] = [
  { id: 'classic', label: 'Klassisch rund', desc: 'Der Original-Ring', icon: '🍩' },
  { id: 'twist', label: 'Ring mit Twist', desc: 'Gedrehte Form', icon: '🥨' },
  { id: 'bar', label: 'Länglich / Bar', desc: 'Long John Style', icon: '🥖' },
  { id: 'mini', label: 'Mini-Donuts', desc: '3er-Set', icon: '🍩' },
];

export const fillingOptions: IconCardOption[] = [
  { id: 'ohne', label: 'Ohne', desc: 'Pur ohne Füllung', icon: '🚫' },
  { id: 'vanille', label: 'Vanillecreme', desc: 'Cremig & süß', icon: '🍦' },
  { id: 'erdbeer', label: 'Erdbeermarmelade', desc: 'Fruchtig-fein', icon: '🍓' },
  { id: 'schoko', label: 'Schokolade', desc: 'Zartschmelzend', icon: '🍫' },
  { id: 'karamell', label: 'Karamell', desc: 'Salzig-süß', icon: '🍯' },
];

export const toppingOptions: ToppingOption[] = [
  { id: 'streusel', label: 'Streusel', hex: 0xf47216 },
  { id: 'schoko', label: 'Schokostückchen', hex: 0x4b2e1a },
  { id: 'kokos', label: 'Kokosraspeln', hex: 0xf5f1e6 },
  { id: 'nuesse', label: 'Nüsse', hex: 0xb98650 },
  { id: 'puder', label: 'Puderzucker', hex: 0xffffff },
];

export const donutConfig = reactive({
  shapeId: shapeOptions[0].id,
  doughId: doughOptions[0].id,
  fillingId: fillingOptions[0].id,
  icingColorId: icingColors[1].id,
  glossValue: 60,
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

// Glanzgrad 0-100 -> Roughness 1-0.1 (0% = ganz matt, 100% = fast spiegelnd)
export function getIcingRoughness(): number {
  return 1 - (donutConfig.glossValue / 100) * 0.9;
}
