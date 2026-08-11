import * as THREE from 'three';
import { watch } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadDonut } from './donut';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PMREMGenerator } from 'three';
import GUI from 'lil-gui';
import { setupCameraGUI, setupLightGUI, setupMaterialGUI, setupSceneGUI } from './gui';
import { donutConfig, getDoughHex, getIcingHex, getIcingRoughness } from '../state/donutConfig';
import { sceneFocus } from '../state/sceneFocus';
import { applyShape, applyFilling } from './placeholders';
import { createToppings, type ToppingsController } from './toppings';
import { donutScenes, getSceneIdForSection } from './scenes';
import { createSceneAnimator, type SceneAnimator } from './sceneAnimator';

export function initScene(canvas: HTMLCanvasElement) {
  // Kein scene.background: der Hintergrund kommt als CSS-Ebene hinter dem Canvas
  // (src/components/StudioBackground.vue). scene.environment bleibt davon
  // unberührt - das ist Beleuchtung, kein sichtbarer Hintergrund.
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  // Startzustand kommt aus der neutralen Szene, damit die Werte nur an einer
  // Stelle stehen (src/three/scenes.ts) und nicht hier zusätzlich hart codiert.
  const neutralScene = donutScenes.neutral;
  camera.position.set(...neutralScene.camera);
  camera.lookAt(...neutralScene.target);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
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
  controls.minDistance = neutralScene.minDistance;
  controls.maxDistance = neutralScene.maxDistance;
  controls.target.set(...neutralScene.target);
  controls.update();

  const ambient = new THREE.AmbientLight(0xffffff, 0);
  const directional = new THREE.DirectionalLight(0xffffff, 3);
  directional.position.set(0.4, -3.5, 10);
  scene.add(ambient, directional);

  // --- GUI Setup ---
  const gui = new GUI();
  setupLightGUI(gui, ambient, directional);
  const syncCameraGUI = setupCameraGUI(gui, camera, controls);

  let disposed = false;
  let animationId: number;
  let stopMaterialWatch: (() => void) | null = null;
  let stopPlaceholderWatch: (() => void) | null = null;
  let stopToppingWatch: (() => void) | null = null;
  let stopSceneWatch: (() => void) | null = null;
  let toppings: ToppingsController | null = null;
  let animator: SceneAnimator | null = null;

  loadDonut().then(({ root, donutMesh, icingMesh }) => {
    if (disposed) return;

    // Der Donut sitzt im GLB nicht im Ursprung. root wird deshalb um seinen
    // Mittelpunkt zurückversetzt und zusätzlich in eine Pivot-Gruppe gehängt:
    // gedreht wird die Gruppe, sodass sich der Donut sauber um seine sichtbare
    // Mitte dreht statt um den versetzten Modell-Ursprung zu schwenken.
    const donutPivot = new THREE.Group();
    // Startwinkel aus der neutralen Szene, sonst stünde der Donut beim Laden auf
    // 0 und würde erst beim ersten Zuklappen einer Sektion richtig ausgerichtet
    donutPivot.rotation.y = neutralScene.donutRotationY;
    scene.add(donutPivot);
    donutPivot.add(root);

    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);

    if (donutMesh) {
      const donutMat = donutMesh.material as THREE.MeshStandardMaterial;
      donutMat.metalness = 1;
      donutMat.roughness = 1;
    }
    if (icingMesh) {
      const icingMat = icingMesh.material as THREE.MeshStandardMaterial;
      icingMat.metalness = 1;
    }

    // Farbe & Glanzgrad kommen aus dem Konfigurator-Store, nicht mehr hart codiert
    function applyMaterialsFromConfig() {
      if (donutMesh) {
        (donutMesh.material as THREE.MeshStandardMaterial).color.set(getDoughHex());
      }
      if (icingMesh) {
        const icingMat = icingMesh.material as THREE.MeshStandardMaterial;
        icingMat.color.set(getIcingHex());
        icingMat.roughness = getIcingRoughness();
      }
    }
    applyMaterialsFromConfig();
    stopMaterialWatch = watch(
      () => [donutConfig.doughId, donutConfig.icingColorId, donutConfig.glossValue] as const,
      applyMaterialsFromConfig
    );

    // Toppings werden zur Laufzeit als Geometrie auf die Glasur gestreut
    // (siehe three/toppings.ts) - dafür braucht es kein Mesh im GLB.
    if (icingMesh) {
      toppings = createToppings(icingMesh);
      toppings.update(donutConfig.toppingIds);
      stopToppingWatch = watch(
        () => [...donutConfig.toppingIds],
        (toppingIds) => toppings?.update(toppingIds)
      );
    }

    // Form & Füllung haben im aktuellen Modell noch keine Meshes - Anwendung
    // läuft bewusst über Platzhalter-Funktionen (siehe three/placeholders.ts),
    // damit die State -> 3D-Update-Pipeline schon steht, sobald die Meshes ergänzt werden.
    stopPlaceholderWatch = watch(
      () => ({
        shapeId: donutConfig.shapeId,
        fillingId: donutConfig.fillingId,
      }),
      (cfg) => {
        applyShape(cfg.shapeId);
        applyFilling(cfg.fillingId);
      }
    );

    // Kamera-/Produkt-Animation: das Öffnen einer Accordion-Sektion fährt die
    // passende Szene an, Zuklappen (leere sectionId) führt zurück auf neutral.
    // Kein initialer flyTo(): die Kamera steht bereits auf der neutralen Szene.
    const sceneAnimator = createSceneAnimator(camera, controls, donutPivot, canvas);
    animator = sceneAnimator;
    stopSceneWatch = watch(
      () => sceneFocus.openSectionId,
      (sectionId) => animator?.flyTo(getSceneIdForSection(sectionId))
    );

    // GUI für Materialien und Szenen erst HIER: Meshes und Pivot existieren
    // jetzt garantiert
    setupMaterialGUI(gui, donutMesh, icingMesh);
    setupSceneGUI(gui, camera, controls, donutPivot, sceneAnimator);
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

  // THREE.Clock ist ab r185 deprecated, deshalb die Zeit direkt messen.
  // Deckelung: war der Tab im Hintergrund, pausiert requestAnimationFrame und
  // der erste Frame danach hätte sonst einen Delta von mehreren Sekunden - die
  // Leerlauf-Drehung würde springen und ein laufender Flug wäre sofort zu Ende.
  const MAX_DELTA = 0.1;
  let lastFrameTime = performance.now();

  function animate() {
    animationId = requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min((now - lastFrameTime) / 1000, MAX_DELTA);
    lastFrameTime = now;

    // Animator vor den Controls: er setzt Position/Target, controls.update()
    // übernimmt sie anschließend.
    animator?.update(delta);
    controls.update();
    syncCameraGUI();
    renderer.render(scene, camera);
  }
  animate();

  return () => {
    disposed = true;
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);
    stopMaterialWatch?.();
    stopPlaceholderWatch?.();
    stopToppingWatch?.();
    stopSceneWatch?.();
    animator?.dispose();
    toppings?.dispose();
    controls.dispose();
    renderer.dispose();
    gui.destroy();   // wichtig: GUI-DOM-Element und Listener sauber entfernen
  };
}