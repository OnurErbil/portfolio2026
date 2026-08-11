import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { donutScenes, type DonutScene, type SceneId } from './scenes';

// Bewusst ohne Tween-Library (GSAP o. ä.): das hier sind rund 60 Zeilen, und
// CLAUDE.md schreibt eine Rückfrage vor neuen Abhängigkeiten vor.
const DURATION_SECONDS = 0.9;
// Leerlauf-Drehung in der neutralen Szene: eine volle Umdrehung in ca. 42 s
const IDLE_SPEED = 0.15;
// Spherical.phi darf nicht exakt 0 oder PI werden, sonst kippt die Kamera um
const PHI_EPSILON = 0.001;

interface Tween {
  elapsed: number;
  fromSpherical: THREE.Spherical;
  toSpherical: THREE.Spherical;
  thetaDelta: number;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  fromRotationY: number;
  rotationDelta: number;
  scene: DonutScene;
}

export interface SceneAnimator {
  flyTo(sceneId: SceneId): void;
  update(delta: number): void;
  /** Nur fürs Debug-Panel: Leerlauf-Drehung anhalten, um eine Szene einzustellen */
  setIdleEnabled(enabled: boolean): void;
  dispose(): void;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Kürzester Weg zwischen zwei Winkeln, damit die Kamera nicht 350 Grad herum
// fährt, wo 10 Grad in die Gegenrichtung reichen.
function shortestAngle(from: number, to: number): number {
  const twoPi = Math.PI * 2;
  let delta = (to - from) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  if (delta < -Math.PI) delta += twoPi;
  return delta;
}

export function createSceneAnimator(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  donutRoot: THREE.Object3D,
  canvas: HTMLCanvasElement
): SceneAnimator {
  // Nicht gecacht, sondern bei jedem Zugriff gelesen - so wirkt ein Umschalten
  // der Systemeinstellung sofort, ohne Listener.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let tween: Tween | null = null;
  let currentSceneId: SceneId = 'neutral';
  let userInteracting = false;
  let idleEnabled = true;

  const offset = new THREE.Vector3();
  const spherical = new THREE.Spherical();

  // Zoom-Grenzen nie enger setzen als der aktuelle Abstand: sonst ruckt die
  // Kamera sichtbar, wenn der Nutzer einen laufenden Flug abbricht und dabei
  // gerade außerhalb der Zielgrenzen steht.
  function applyLimits(scene: DonutScene) {
    const distance = camera.position.distanceTo(controls.target);
    controls.minDistance = Math.min(scene.minDistance, distance);
    controls.maxDistance = Math.max(scene.maxDistance, distance);
  }

  function settle(scene: DonutScene) {
    tween = null;
    controls.enabled = true;
    applyLimits(scene);
    controls.update();
  }

  function jumpTo(scene: DonutScene) {
    controls.target.set(...scene.target);
    camera.position.set(...scene.camera);
    donutRoot.rotation.y = scene.donutRotationY;
    settle(scene);
  }

  function flyTo(sceneId: SceneId) {
    currentSceneId = sceneId;
    const scene = donutScenes[sceneId];

    if (reducedMotion.matches) {
      jumpTo(scene);
      return;
    }

    const fromSpherical = new THREE.Spherical().setFromVector3(
      offset.copy(camera.position).sub(controls.target)
    );
    const toSpherical = new THREE.Spherical().setFromVector3(
      new THREE.Vector3(...scene.camera).sub(new THREE.Vector3(...scene.target))
    );

    tween = {
      elapsed: 0,
      fromSpherical,
      toSpherical,
      thetaDelta: shortestAngle(fromSpherical.theta, toSpherical.theta),
      fromTarget: controls.target.clone(),
      toTarget: new THREE.Vector3(...scene.target),
      fromRotationY: donutRoot.rotation.y,
      rotationDelta: shortestAngle(donutRoot.rotation.y, scene.donutRotationY),
      scene,
    };

    // Während des Flugs steuert der Animator die Kamera. Die Zoom-Grenzen müssen
    // dabei offen sein: controls.update() klemmt den Abstand auch dann, wenn
    // enabled false ist - der Flug bliebe sonst unterwegs hängen.
    controls.enabled = false;
    controls.minDistance = 0;
    controls.maxDistance = Infinity;
  }

  function cancel() {
    if (!tween) return;
    settle(tween.scene);
  }

  function update(delta: number) {
    if (tween) {
      tween.elapsed += delta;
      const progress = Math.min(tween.elapsed / DURATION_SECONDS, 1);
      const eased = easeInOutCubic(progress);

      // In Kugelkoordinaten interpolieren, nicht linear zwischen zwei Punkten:
      // linear würde die Kamera durch den Donut ziehen und der Abstand sackte
      // auf halber Strecke ein.
      spherical.radius = THREE.MathUtils.lerp(
        tween.fromSpherical.radius,
        tween.toSpherical.radius,
        eased
      );
      spherical.phi = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(tween.fromSpherical.phi, tween.toSpherical.phi, eased),
        PHI_EPSILON,
        Math.PI - PHI_EPSILON
      );
      spherical.theta = tween.fromSpherical.theta + tween.thetaDelta * eased;

      controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased);
      camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
      donutRoot.rotation.y = tween.fromRotationY + tween.rotationDelta * eased;

      if (progress >= 1) settle(tween.scene);
      return;
    }

    // Leerlauf-Drehung nur in der neutralen Szene und nicht, während der Nutzer
    // selbst dreht - sonst wirkt es, als würde das Modell unter der Maus wegrutschen.
    if (idleEnabled && currentSceneId === 'neutral' && !userInteracting && !reducedMotion.matches) {
      // Modulo, damit der Winkel nicht unbegrenzt wächst - sonst verliert er
      // über die Zeit an Genauigkeit und der Regler im lil-gui läuft aus seiner Skala
      donutRoot.rotation.y = (donutRoot.rotation.y + IDLE_SPEED * delta) % (Math.PI * 2);
    }
  }

  // Sobald der Nutzer eingreift, gehört ihm die Kamera - ein laufender Flug bricht ab.
  // Capture-Phase ist wichtig: OrbitControls hängt seinen pointerdown-Handler
  // schon im Konstruktor an denselben Canvas. Ohne Capture liefe unserer erst
  // danach, OrbitControls hätte den Klick bei enabled === false bereits
  // verworfen und das Ziehen würde erst beim zweiten Ansetzen greifen.
  const handleUserTakeover = () => cancel();
  canvas.addEventListener('pointerdown', handleUserTakeover, { capture: true });
  canvas.addEventListener('wheel', handleUserTakeover, { capture: true, passive: true });

  const handleControlsStart = () => {
    userInteracting = true;
  };
  const handleControlsEnd = () => {
    userInteracting = false;
  };
  controls.addEventListener('start', handleControlsStart);
  controls.addEventListener('end', handleControlsEnd);

  function dispose() {
    canvas.removeEventListener('pointerdown', handleUserTakeover, { capture: true });
    canvas.removeEventListener('wheel', handleUserTakeover, { capture: true });
    controls.removeEventListener('start', handleControlsStart);
    controls.removeEventListener('end', handleControlsEnd);
  }

  function setIdleEnabled(enabled: boolean) {
    idleEnabled = enabled;
  }

  return { flyTo, update, setIdleEnabled, dispose };
}
