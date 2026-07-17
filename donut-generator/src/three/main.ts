import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadDonut } from './donut';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PMREMGenerator } from 'three';
import GUI from 'lil-gui';
import { setupLightGUI, setupMaterialGUI } from './gui';

export function initScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  const camera = new THREE.PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1, 1.5);  
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const pmremGenerator = new PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;
  scene.environmentIntensity = 1;

  // const axesHelper = new THREE.AxesHelper(2);  // 2 = Länge der Achsen-Linien
  // scene.add(axesHelper);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.5;
  controls.maxDistance = 3;
  controls.target.set(0, 0, 0);
  controls.update();

  const ambient = new THREE.AmbientLight(0xffffff, 0);
  const directional = new THREE.DirectionalLight(0xffffff, 3);
  directional.position.set(0.4, -3.5, 10);
  scene.add(ambient, directional);

  // --- GUI Setup ---
  const gui = new GUI();
  setupLightGUI(gui, ambient, directional);

  let disposed = false;
  let animationId: number;

  loadDonut().then(({ root, donutMesh, icingMesh }) => {
    if (disposed) return;

    scene.add(root);
    // root.position.set(0, 0, 0);
    // --- Bounding Box berechnen, um den Offset zu sehen ---
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);


    if (donutMesh) {
      const donutMat = donutMesh.material as THREE.MeshStandardMaterial;
      donutMat.color.set(0xd79a5e);
      donutMat.metalness = 1;
      donutMat.roughness = 1;
    }
    if (icingMesh) {
      const icingMat = icingMesh.material as THREE.MeshStandardMaterial;
      icingMat.color.set(0xff8499);
      icingMat.metalness = 1;
      icingMat.roughness = .7;
    }

    // GUI für Materialien erst HIER, weil Meshes jetzt garantiert existieren
    setupMaterialGUI(gui, donutMesh, icingMesh);
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
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  return () => {
    disposed = true;
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);
    controls.dispose();
    renderer.dispose();
    gui.destroy();   // wichtig: GUI-DOM-Element und Listener sauber entfernen
  };
}