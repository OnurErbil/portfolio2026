// Vorgefertigte End-Szenen für die Kamera-/Produkt-Animation.
//
// Bewusst reine Daten ohne Three.js-Abhängigkeit: der Animator
// (src/three/sceneAnimator.ts) macht daraus Vector3/Quaternion, und der
// Preset-Recorder im lil-gui (src/three/gui.ts) gibt genau dieses Format aus.
// Dadurch lässt sich eine im Browser eingestellte Ansicht direkt hier einfügen.

export type SceneId = 'neutral' | 'form' | 'teig' | 'glasur' | 'toppings';

export interface DonutScene {
  /** Weltposition der Kamera */
  camera: [number, number, number];
  /** Punkt, den die Kamera anschaut (= OrbitControls-Target) */
  target: [number, number, number];
  /** Y-Drehung des Donuts in Radiant */
  donutRotationY: number;
  // Zoom-Grenzen gehören zur Szene, nicht global: OrbitControls klemmt den
  // Abstand hart auf diese Werte. Eine Topping-Nahaufnahme näher als die
  // neutrale Untergrenze von 0.5 würde sonst stumm zurückspringen.
  minDistance: number;
  maxDistance: number;
}

// Accordion-Sektion -> Szene. Füllung und Ernährungsfilter haben bewusst keine
// eigene Szene und fallen damit auf die neutrale Ansicht zurück - genau wie ein
// zugeklapptes Accordion (leere sectionId).
const SECTION_SCENES: Record<string, SceneId> = {
  form: 'form',
  teig: 'teig',
  icing: 'glasur',
  toppings: 'toppings',
};

export function getSceneIdForSection(sectionId: string): SceneId {
  return SECTION_SCENES[sectionId] ?? 'neutral';
}

// Im Browser über den lil-gui-Ordner "Szenen (Debug)" eingestellt und von dort
// per "Alle Presets loggen" übernommen. Zum Nachjustieren denselben Weg gehen.
export const donutScenes: Record<SceneId, DonutScene> = {
  // Startansicht. donutRotationY ist hier nur der Anfangswinkel - ab dort dreht
  // die Leerlauf-Drehung weiter (siehe sceneAnimator.ts).
  // maxDistance minimal über den aufgezeichneten Abstand (1.0301) gesetzt: durch
  // das Runden auf drei Nachkommastellen lag er sonst 0.0001 über der Grenze und
  // OrbitControls hätte die Kamera beim Start klemmen müssen.
  neutral: {
    camera: [-0.653, 0.617, 0.504],
    target: [0, 0, 0],
    donutRotationY: 0.45,
    minDistance: 0.5,
    maxDistance: 1.031,
  },
  form: {
    camera: [-0.429, 0.476, 0.163],
    target: [0, 0, 0],
    donutRotationY: 2.151,
    minDistance: 0.5,
    maxDistance: 1.03,
  },
  // Blick von schräg unten (negative Kamera-Höhe) auf die Teigunterseite
  teig: {
    camera: [-0.404, -0.425, 0.304],
    target: [0, 0, 0],
    donutRotationY: 2.963,
    minDistance: 0.5,
    maxDistance: 1.03,
  },
  glasur: {
    camera: [-0.106, 0.311, -0.377],
    target: [0, 0, 0],
    donutRotationY: 3.68,
    minDistance: 0.5,
    maxDistance: 1.03,
  },
  toppings: {
    camera: [0.3, 0.321, -0.509],
    target: [0, 0, 0],
    donutRotationY: 4.554,
    minDistance: 0.5,
    maxDistance: 1.03,
  },
};
