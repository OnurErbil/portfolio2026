import GUI from 'lil-gui';
import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { donutScenes, type DonutScene, type SceneId } from './scenes';
import type { SceneAnimator } from './sceneAnimator';

const SCENE_IDS: SceneId[] = ['neutral', 'form', 'teig', 'glasur', 'toppings'];

function round(value: number): string {
  return value.toFixed(3);
}

function formatScene(id: SceneId, scene: DonutScene): string {
  return (
    `  ${id}: {\n` +
    `    camera: [${scene.camera.map(round).join(', ')}],\n` +
    `    target: [${scene.target.map(round).join(', ')}],\n` +
    `    donutRotationY: ${round(scene.donutRotationY)},\n` +
    `    minDistance: ${round(scene.minDistance)},\n` +
    `    maxDistance: ${round(scene.maxDistance)},\n` +
    `  },`
  );
}

// Preset-Recorder für die Kamera-/Produkt-Szenen (src/three/scenes.ts).
//
// Ablauf: Szene im Dropdown wählen, Ansicht per Maus und über den Ordner
// "Kamera" einstellen, Donut-Drehung am Regler setzen - dann "Szene speichern".
// Das schreibt die Werte sofort in die laufende Szene (man kann sie also direkt
// über das Accordion gegenprüfen) und loggt den fertigen Block für scenes.ts.
//
// Teil des lil-gui-Debug-Panels und fällt mit diesem beim Deployment weg.
export function setupSceneGUI(
  gui: GUI,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  donutPivot: THREE.Object3D,
  animator: SceneAnimator
) {
  const sceneFolder = gui.addFolder('Szenen (Debug)');
  const state = { szene: 'neutral' as SceneId, leerlauf: true };

  sceneFolder.add(state, 'szene', SCENE_IDS).name('Szene');

  // Ohne diesen Schalter lässt sich die neutrale Szene nicht einstellen: dort
  // dreht sich der Donut dauerhaft weiter und überschreibt den Regler sofort.
  sceneFolder
    .add(state, 'leerlauf')
    .name('Leerlauf-Drehung')
    .onChange((enabled: boolean) => animator.setIdleEnabled(enabled));

  // Direkt an die Pivot-Gruppe gebunden, damit der Regler auch die
  // Leerlauf-Drehung mitläuft und nicht veraltete Werte anzeigt
  sceneFolder
    .add(donutPivot.rotation, 'y', 0, Math.PI * 2, 0.01)
    .name('Donut-Drehung Y')
    .listen();

  function captureScene(): DonutScene {
    const twoPi = Math.PI * 2;
    return {
      camera: [camera.position.x, camera.position.y, camera.position.z],
      target: [controls.target.x, controls.target.y, controls.target.z],
      donutRotationY: ((donutPivot.rotation.y % twoPi) + twoPi) % twoPi,
      minDistance: controls.minDistance,
      maxDistance: controls.maxDistance,
    };
  }

  sceneFolder
    .add({ anfahren: () => animator.flyTo(state.szene) }, 'anfahren')
    .name('Szene anfahren');

  sceneFolder
    .add(
      {
        speichern: () => {
          const scene = captureScene();
          // Bewusst in das importierte Objekt geschrieben: so wirkt die neue
          // Einstellung sofort auch über das Accordion, ohne Reload.
          donutScenes[state.szene] = scene;
          console.log(formatScene(state.szene, scene));
        },
      },
      'speichern'
    )
    .name('Szene speichern + loggen');

  sceneFolder
    .add(
      {
        alle: () => {
          const body = SCENE_IDS.map((id) => formatScene(id, donutScenes[id])).join('\n');
          console.log(
            `export const donutScenes: Record<SceneId, DonutScene> = {\n${body}\n};`
          );
        },
      },
      'alle'
    )
    .name('Alle Presets loggen');
}

// Kamera-Abstand zum Donut zum Ausprobieren. Der gefundene Wert wird danach in
// src/three/main.ts als Startposition hart gesetzt - das Panel ist nur Debug-Tool.
// Rückgabewert: Sync-Funktion, die pro Frame den echten Abstand zurückschreibt,
// damit der Regler auch nach dem Zoomen per Maus/Touch den korrekten Wert zeigt.
export function setupCameraGUI(
  gui: GUI,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
): () => void {
  const cameraFolder = gui.addFolder('Kamera');

  const state = {
    distanz: camera.position.distanceTo(controls.target),
    minDistanz: controls.minDistance,
    maxDistanz: controls.maxDistance,
  };

  // Kamera entlang ihrer aktuellen Blickrichtung verschieben, damit nur der
  // Abstand geändert wird und der Blickwinkel erhalten bleibt
  function applyDistance(value: number) {
    const direction = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).addScaledVector(direction, value);
    controls.update();
  }

  const distanceController = cameraFolder
    .add(state, 'distanz', controls.minDistance, controls.maxDistance, 0.01)
    .name('Distanz')
    .listen()
    .onChange(applyDistance);

  // OrbitControls begrenzt den Abstand selbst auf min/max - deshalb wandert die
  // Range des Distanz-Reglers mit, sonst würde er stumm zurückspringen
  cameraFolder
    .add(state, 'minDistanz', 0.1, 3, 0.01)
    .name('Min-Distanz')
    .onChange((value: number) => {
      controls.minDistance = value;
      distanceController.min(value);
      controls.update();
    });

  cameraFolder
    .add(state, 'maxDistanz', 0.5, 10, 0.01)
    .name('Max-Distanz')
    .onChange((value: number) => {
      controls.maxDistance = value;
      distanceController.max(value);
      controls.update();
    });

  // Gibt die fertige Zeile für main.ts aus, damit der gefundene Wert nicht per
  // Hand aus dem Regler abgetippt werden muss
  cameraFolder
    .add(
      {
        loggen: () => {
          const { x, y, z } = camera.position;
          console.log(
            `camera.position.set(${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)});` +
              `  // Distanz ${camera.position.distanceTo(controls.target).toFixed(3)}`
          );
        },
      },
      'loggen'
    )
    .name('Position in Konsole loggen');

  return () => {
    state.distanz = camera.position.distanceTo(controls.target);
  };
}

export function setupLightGUI(
  gui: GUI,
  ambient: THREE.AmbientLight,
  directional: THREE.DirectionalLight
) {
  const lightFolder = gui.addFolder('Licht');

  lightFolder.add(ambient, 'intensity', 0, 3, 0.01).name('Ambient Intensität');
  lightFolder.add(directional, 'intensity', 0, 3, 0.01).name('Directional Intensität');

  // Position ist ein Vector3 (x, y, z einzeln), deshalb drei separate Regler
  lightFolder.add(directional.position, 'x', -10, 10, 0.1).name('Licht X');
  lightFolder.add(directional.position, 'y', -10, 10, 0.1).name('Licht Y');
  lightFolder.add(directional.position, 'z', -10, 10, 0.1).name('Licht Z');
}

export function setupMaterialGUI(
  gui: GUI,
  donutMesh: THREE.Mesh | null,
  icingMesh: THREE.Mesh | null
) {
  if (donutMesh) {
    const donutMat = donutMesh.material as THREE.MeshStandardMaterial;
    const donutFolder = gui.addFolder('Donut Material');
    donutFolder.add(donutMat, 'metalness', 0, 1, 0.01);
    donutFolder.add(donutMat, 'roughness', 0, 1, 0.01);
    donutFolder.addColor({ color: donutMat.color.getHex() }, 'color').onChange((value: number) => {
      donutMat.color.set(value);
    });
  }

  if (icingMesh) {
    const icingMat = icingMesh.material as THREE.MeshStandardMaterial;
    const icingFolder = gui.addFolder('Icing Material');
    icingFolder.add(icingMat, 'metalness', 0, 1, 0.01);
    icingFolder.add(icingMat, 'roughness', 0, 1, 0.01);
    icingFolder.addColor({ color: icingMat.color.getHex() }, 'color').onChange((value: number) => {
      icingMat.color.set(value);
    });
  }
}