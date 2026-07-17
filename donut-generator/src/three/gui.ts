import GUI from 'lil-gui';
import * as THREE from 'three';

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