import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { toppingOptions } from '../state/donutConfig';

// Gesamtzahl der Topping-Objekte auf dem Donut. Sind mehrere Toppings aktiv,
// teilen sie sich diese Zahl (2 Toppings = je die Hälfte), damit der Donut mit
// zwei Toppings nicht doppelt so voll wird wie mit einem.
const TOTAL_TOPPING_COUNT = 60;

// Nur nach oben zeigende Flächen der Glasur bekommen Toppings.
const MIN_NORMAL_Y = 0.35;

// Streusel werden zufällig aus dieser Palette eingefärbt (pro Instanz, über
// InstancedMesh.setColorAt) - deshalb ist ihr Material-Grundton Weiß.
const STREUSEL_COLORS = [0xffffff, 0x3f9be0, 0xe5392e, 0xf5d95e, 0x5fc27e];

const UP = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

interface SurfacePoint {
  position: THREE.Vector3;
  normal: THREE.Vector3;
}

// setRandomGenerator() existiert im JS von three/examples, fehlt aber (noch) in
// den @types/three-Typings - deshalb ein schmaler expliziter Cast statt `any`.
interface SamplerWithRandomGenerator {
  setRandomGenerator(randomFunction: () => number): MeshSurfaceSampler;
}

interface ToppingType {
  id: string;
  mesh: THREE.InstancedMesh;
  matrices: THREE.Matrix4[];
  // Pro Punkt im Pool eine feste Farbe (nur Streusel) - so behält ein Streusel
  // seine Farbe, auch wenn er beim Umschalten in einem anderen Instanz-Slot landet.
  colors?: THREE.Color[];
}

export interface ToppingsController {
  update(toppingIds: string[]): void;
  dispose(): void;
}

// Fester Seed statt Math.random: die Toppings liegen bei jedem Laden gleich,
// das hält Screenshots und Tests reproduzierbar (mulberry32).
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getToppingHex(id: string, fallback: number): number {
  return toppingOptions.find((o) => o.id === id)?.hex ?? fallback;
}

// Punkte auf der Oberseite der Glasur verteilen. Der Mindestabstand verhindert,
// dass die Toppings verklumpen (einfaches Rejection-Sampling).
function sampleTopSurface(
  sampler: MeshSurfaceSampler,
  minDistance: number
): SurfacePoint[] {
  const points: SurfacePoint[] = [];
  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const maxAttempts = TOTAL_TOPPING_COUNT * 200;

  for (let attempt = 0; attempt < maxAttempts && points.length < TOTAL_TOPPING_COUNT; attempt++) {
    sampler.sample(position, normal);
    if (normal.y < MIN_NORMAL_Y) continue;
    if (points.some((p) => p.position.distanceTo(position) < minDistance)) continue;
    points.push({ position: position.clone(), normal: normal.clone() });
  }

  return points;
}

export function createToppings(icingMesh: THREE.Mesh): ToppingsController {
  const geometry = icingMesh.geometry;
  if (!geometry.getAttribute('normal')) {
    geometry.computeVertexNormals();
  }
  geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  geometry.boundingBox?.getSize(size);
  // Größen relativ zum Modell, damit sie stimmen, falls das GLB neu exportiert wird
  const donutRadius = Math.max(size.x, size.z) / 2;

  const random = createSeededRandom(20260724);
  const sampler = new MeshSurfaceSampler(icingMesh);
  (sampler as unknown as SamplerWithRandomGenerator).setRandomGenerator(random);
  sampler.build();
  const points = sampleTopSurface(sampler, donutRadius * 0.07);

  const streuselRadius = donutRadius * 0.022;
  const streuselLength = donutRadius * 0.085;
  const schokoRadius = donutRadius * 0.045;

  // Streusel: Kapsel (Zylinder mit abgerundeten Enden), liegt flach auf der Glasur
  const streuselMatrices = points.map((point) => {
    const alignToNormal = new THREE.Quaternion().setFromUnitVectors(UP, point.normal);
    const layFlat = new THREE.Quaternion().setFromAxisAngle(X_AXIS, Math.PI / 2);
    const spin = new THREE.Quaternion().setFromAxisAngle(UP, random() * Math.PI * 2);
    const quaternion = alignToNormal.multiply(spin).multiply(layFlat);

    const offset = point.normal.clone().multiplyScalar(streuselRadius);
    const scale = 0.85 + random() * 0.3;

    return new THREE.Matrix4().compose(
      point.position.clone().add(offset),
      quaternion,
      new THREE.Vector3(scale, scale, scale)
    );
  });

  // Zufällige Farbe je Streusel, einmalig festgelegt (siehe ToppingType.colors)
  const streuselColors = points.map(
    () => new THREE.Color(STREUSEL_COLORS[Math.floor(random() * STREUSEL_COLORS.length)])
  );

  // Schokostückchen: einfache Kugeln. Der Mittelpunkt liegt bewusst nur knapp
  // über der Oberfläche, damit die Kugeln spürbar in die Glasur eintauchen.
  const schokoMatrices = points.map((point) => {
    const offset = point.normal.clone().multiplyScalar(schokoRadius * 0.25);
    const scale = 0.85 + random() * 0.3;

    return new THREE.Matrix4().compose(
      point.position.clone().add(offset),
      new THREE.Quaternion(),
      new THREE.Vector3(scale, scale, scale)
    );
  });

  function createInstancedMesh(geometry: THREE.BufferGeometry, hex: number): THREE.InstancedMesh {
    const material = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.45, metalness: 0.1 });
    const mesh = new THREE.InstancedMesh(geometry, material, Math.max(points.length, 1));
    mesh.count = 0;
    // Die Instanzen sitzen alle am Donut; die Bounding-Sphere wird beim Ändern
    // von count nicht neu berechnet, deshalb kein Frustum-Culling.
    mesh.frustumCulled = false;
    icingMesh.add(mesh);
    return mesh;
  }

  // Weißes Grundmaterial: die eigentliche Farbe kommt pro Instanz aus streuselColors
  const streuselMesh = createInstancedMesh(
    new THREE.CapsuleGeometry(streuselRadius, streuselLength, 3, 8),
    0xffffff
  );
  // Farben schon hier setzen, damit instanceColor von Anfang an existiert und der
  // Shader nicht erst beim ersten Einschalten neu kompiliert werden muss.
  streuselColors.forEach((color, i) => streuselMesh.setColorAt(i, color));

  const toppingTypes: ToppingType[] = [
    {
      id: 'streusel',
      mesh: streuselMesh,
      matrices: streuselMatrices,
      colors: streuselColors,
    },
    {
      id: 'schoko',
      mesh: createInstancedMesh(
        new THREE.SphereGeometry(schokoRadius, 12, 8),
        getToppingHex('schoko', 0x4b2e1a)
      ),
      matrices: schokoMatrices,
    },
  ];

  function update(toppingIds: string[]): void {
    const activeTypes = toppingTypes.filter((type) => toppingIds.includes(type.id));
    const countPerType = activeTypes.length > 0 ? Math.floor(points.length / activeTypes.length) : 0;

    for (const type of toppingTypes) {
      const activeIndex = activeTypes.indexOf(type);

      if (activeIndex === -1) {
        type.mesh.count = 0;
        continue;
      }

      // Die aktiven Toppings teilen sich denselben Punkte-Pool im Wechsel:
      // beide streuen gleichmäßig über den Donut und die Gesamtzahl bleibt gleich.
      let slot = 0;
      for (let i = activeIndex; i < points.length && slot < countPerType; i += activeTypes.length) {
        type.mesh.setMatrixAt(slot, type.matrices[i]);
        // Farbe wandert mit dem Punkt mit, nicht mit dem Slot
        if (type.colors) type.mesh.setColorAt(slot, type.colors[i]);
        slot++;
      }

      type.mesh.count = slot;
      type.mesh.instanceMatrix.needsUpdate = true;
      if (type.mesh.instanceColor) type.mesh.instanceColor.needsUpdate = true;
    }
  }

  function dispose(): void {
    for (const type of toppingTypes) {
      type.mesh.removeFromParent();
      type.mesh.geometry.dispose();
      (type.mesh.material as THREE.Material).dispose();
      type.mesh.dispose();
    }
  }

  return { update, dispose };
}
