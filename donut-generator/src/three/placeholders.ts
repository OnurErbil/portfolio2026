// Platzhalter-Funktionen für Konfigurationsoptionen, deren Meshes im aktuellen
// donut.glb noch nicht existieren (nur 'donut' & 'icing' sind vorhanden, siehe
// Mesh-Namenskonvention in CLAUDE.md). Der Vue-Store (src/state/donutConfig.ts)
// und die UI sind bereits voll verdrahtet - sobald die entsprechenden Meshes im
// Blender-Export ergänzt werden, hier die Material-/Geometrie-Logik einbauen,
// analog zu applyMaterialsFromConfig() in src/three/main.ts.

export function applyShape(_shapeId: string): void {
  // TODO: Form-Mesh im GLB noch nicht vorhanden.
}

export function applyFilling(_fillingId: string): void {
  // TODO: Füllungs-Mesh im GLB noch nicht vorhanden.
}

export function applyToppings(_toppingIds: string[]): void {
  // TODO: Topping-Meshes im GLB noch nicht vorhanden.
}
