import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadDonut } from './donut';

export function initScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  const camera = new THREE.PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 2, 4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // --- OrbitControls ---
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;      // sanftes "Nachschwingen" bei Bewegung
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.5;         // wie nah man reinzoomen kann
  controls.maxDistance = 10;          // wie weit man rauszoomen kann
  controls.target.set(0, 0, 0);       // Punkt, um den rotiert wird
  controls.update();

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(3, 5, 2);
  scene.add(ambient, directional);

  let disposed = false;

  loadDonut().then(({ root, donutMesh, icingMesh }) => {
    if (disposed) return;
    scene.add(root);

    if (donutMesh) {
      (donutMesh.material as THREE.MeshStandardMaterial).color.set(0xd9a066);
    }
    if (icingMesh) {
      (icingMesh.material as THREE.MeshStandardMaterial).color.set(0xffffff);
    }
  }).catch((err) => {
    console.error('Fehler beim Laden des Donuts:', err);
  });

  function handleResize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  window.addEventListener('resize', handleResize);

  function animate() {
    requestAnimationFrame(animate);
    controls.update(); // wichtig: nötig wegen enableDamping
    renderer.render(scene, camera);
  }
  animate();

  return () => {
    disposed = true;
    window.removeEventListener('resize', handleResize);
    controls.dispose();
    renderer.dispose();
  };
}