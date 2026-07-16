import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface DonutMeshes {
  root: THREE.Group;
  donutMesh: THREE.Mesh | null;
  icingMesh: THREE.Mesh | null;
}

export function loadDonut(): Promise<DonutMeshes> {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      '/models/donut.glb',
      (gltf) => {
        const root = gltf.scene;

        let donutMesh: THREE.Mesh | null = null;
        let icingMesh: THREE.Mesh | null = null;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = (mesh.material as THREE.Material).clone();

            if (mesh.name.toLowerCase().includes('donut')) {
              donutMesh = mesh;
            }
            if (mesh.name.toLowerCase().includes('icing')) {
              icingMesh = mesh;
            }
          }
        });

        resolve({ root, donutMesh, icingMesh });
      },
      undefined,
      (error) => reject(error)
    );
  });
}