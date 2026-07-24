import { reactive } from 'vue';
import {
  donutConfig,
  shapeOptions,
  doughOptions,
  fillingOptions,
  icingColors,
  toppingOptions,
  getPrice,
} from './donutConfig';

// "Meine Kreationen" (siehe context/Meine Kreationen.dc.html) hat noch keine
// eigene Galerie-Seite - die Sammlung wird hier aber schon echt persistiert
// (localStorage), damit der "Zur Sammlung hinzufügen"-Button reale Daten
// anlegt statt nur eine Animation abzuspielen. Die Galerie-UI ist ein
// separates, noch offenes Arbeitspaket.
export interface CollectionItem {
  id: string;
  createdAt: number;
  shapeLabel: string;
  doughLabel: string;
  fillingLabel: string;
  icingLabel: string;
  toppingLabels: string[];
  vegan: boolean;
  glutenfrei: boolean;
  price: number;
}

const STORAGE_KEY = 'donut-collection';

function loadFromStorage(): CollectionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CollectionItem[]) : [];
  } catch {
    return [];
  }
}

export const collection = reactive<CollectionItem[]>(loadFromStorage());

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  } catch {
    // z. B. im privaten Browser-Modus nicht verfügbar - Sammlung bleibt dann nur für die Session erhalten.
  }
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addCurrentDonutToCollection(): void {
  collection.push({
    id: createId(),
    createdAt: Date.now(),
    shapeLabel: shapeOptions.find((o) => o.id === donutConfig.shapeId)?.label ?? '',
    doughLabel: doughOptions.find((o) => o.id === donutConfig.doughId)?.label ?? '',
    fillingLabel: fillingOptions.find((o) => o.id === donutConfig.fillingId)?.label ?? '',
    icingLabel: icingColors.find((c) => c.id === donutConfig.icingColorId)?.label ?? '',
    toppingLabels: donutConfig.toppingIds
      .map((id) => toppingOptions.find((t) => t.id === id)?.label)
      .filter((label): label is string => Boolean(label)),
    vegan: donutConfig.vegan,
    glutenfrei: donutConfig.glutenfrei,
    price: getPrice(),
  });
  persist();
}
