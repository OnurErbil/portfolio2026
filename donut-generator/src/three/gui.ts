import GUI from 'lil-gui';
import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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