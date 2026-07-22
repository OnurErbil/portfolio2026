# Donut Configurator – Projekt-Guideline für Claude Code

## Projektüberblick

Portfolio-Projekt: ein interaktiver 3D-Donut-Konfigurator im Browser. Nutzer sollen einen Donut in Echtzeit anpassen können (Teig-/Icing-Farbe, perspektivisch weitere Optionen wie Toppings/Sprinkles). Ziel ist **nicht** ein möglichst realistischer Donut, sondern eine saubere, portfolio-taugliche Demonstration von: 3D-Rendering, Realtime-UI, Komponentenarchitektur, State-Management, Responsive Design.

Ursprünglich als Möbel-Konfigurator ("Forma Configurator") geplant, wurde auf ein Donut-Modell umgestellt. Das Konzept (State → 3D-Update, Material-Wechsel, Vue-Komponenten) bleibt identisch.

## Tech Stack

- **Vue 3** (Composition API, `<script setup>` bevorzugen)
- **Vite**
- **TypeScript**
- **Three.js** (r1xx, siehe `package.json` für exakte Version)
- **CSS** für Styling
- **lil-gui** — **nur Entwicklungs-Tool**, dient aktuell zum Debuggen von Licht/Material-Werten. Muss vor dem finalen Deployment entfernt oder hinter einen `import.meta.env.DEV`-Check gesetzt werden. Ist NICHT Teil der finalen Konfigurator-UI.

## Ordnerstruktur

```
donut-generator/
├─ public/
│  └─ models/
│     └─ donut.glb          # selbst erstelltes 3D-Modell
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  └─ HelloWorld.vue     # Vite-Boilerplate, wird noch entfernt/ersetzt
│  ├─ three/
│  │  ├─ main.ts            # initScene() – Szenen-Setup, Lifecycle
│  │  ├─ donut.ts           # loadDonut() – GLTF laden, Meshes identifizieren
│  │  └─ gui.ts             # lil-gui Debug-Panels (temporär)
│  ├─ App.vue
│  ├─ main.ts                # Vue-Einstiegspunkt
│  └─ style.css
├─ docs/
│  └─ design/                # TODO: Design-Screenshots/Exports hier ablegen
├─ index.html
├─ vite.config.ts
└─ tsconfig*.json
```

**Wichtig:** Es gibt zwei `main.ts`-Dateien (`src/main.ts` für Vue, `src/three/main.ts` für die Three.js-Szene). Bei Anweisungen an Claude Code immer den vollen Pfad angeben, um Verwechslungen zu vermeiden.

## Aktueller Stand (Stand: Projektstart-Phase abgeschlossen)

Bereits umgesetzt:
- Vite + Vue3 + TS Projekt aufgesetzt
- Three.js-Szene sauber in Vue-Komponente eingebunden (`App.vue`): Canvas-Ref, `initScene()` in `onMounted`, Cleanup-Funktion in `onUnmounted`
- Three.js-Szene mit PerspectiveCamera, WebGLRenderer, OrbitControls (Damping aktiviert, Zoom-Range 0.5–3)
- Environment Lighting via `PMREMGenerator` + `RoomEnvironment` für realistische Reflexionen
- Ambient + Directional Light, aktuell über lil-gui einstellbar
- Eigenes `donut.glb`-Modell wird per `GLTFLoader` geladen
- Meshes werden per Namenskonvention erkannt (siehe unten) und Material wird geklont, um Shared-Material-Bugs zu vermeiden
- Erste Farbwerte für Donut- und Icing-Material gesetzt (`metalness`/`roughness`/`color`)
- Cleanup-Pattern vorhanden: `initScene()` gibt eine Dispose-Funktion zurück (Animation-Frame canceln, Event-Listener entfernen, Controls/Renderer/GUI disposen)

**Noch offen / nächste Schritte:**
- `HelloWorld.vue` (Vite-Boilerplate) ist noch nicht entfernt
- Kein zentraler State/Store für Konfigurationsoptionen (Farben aktuell hart im Code gesetzt bzw. über lil-gui manipuliert)
- Keine echte Konfigurator-UI (ColorSelector, Material-Auswahl etc.) – bisher nur Debug-GUI
- Kein responsives Layout
- Deployment-Pipeline (Ziel: IONOS 1&1, manuelles FTP-Deployment, `base`-Pfad in `vite.config.ts` beachten)

## Wichtige Konventionen im Code

### Mesh-Namenskonvention (kritisch!)
In `donut.ts` werden Meshes per **Substring-Match auf den Mesh-Namen** (case-insensitive) identifiziert:
```ts
if (mesh.name.toLowerCase().includes('donut')) { donutMesh = mesh; }
if (mesh.name.toLowerCase().includes('icing')) { icingMesh = mesh; }
```
Wenn neue Teile ins `.glb`-Modell kommen (z. B. Sprinkles, Teller), **müssen** deren Mesh-Namen im Blender-Export entsprechende Substrings enthalten, oder die Erkennungslogik muss erweitert werden. Claude Code sollte bei neuen Konfigurationsoptionen immer zuerst prüfen, ob das Modell die nötigen benannten Meshes überhaupt enthält, bevor Material-Logik dafür gebaut wird.

### Material-Handling
Materialien werden beim Laden geklont (`mesh.material.clone()`), damit Farbänderungen nicht versehentlich andere Instanzen mit demselben Ausgangsmaterial beeinflussen. Diese Praxis bei neuen Materialien beibehalten.

### Lifecycle / Cleanup
`initScene()` folgt einem Dispose-Pattern (Rückgabe einer Cleanup-Funktion). Dieses Muster bei neuen Three.js-Ressourcen (Geometrien, Materialien, Event-Listener) konsequent fortführen, um Memory Leaks bei Hot-Reload/Component-Unmount zu vermeiden.

### GUI (lil-gui)
Ausschließlich Debug-Werkzeug. Neue Konfigurationsoptionen für Endnutzer gehören in echte Vue-Komponenten, nicht ins lil-gui-Panel. lil-gui-Code sollte nicht als Vorbild für die finale UI-Architektur dienen.

## Coding-Präferenzen

- TypeScript strikt nutzen, `any` vermeiden (siehe z. B. die expliziten Type-Casts in `donut.ts`/`main.ts` als Vorbild)
- Three.js-Logik bleibt modular in `src/three/`, getrennt von Vue-Komponenten in `src/components/`
- Composition API mit `<script setup>` für neue Vue-Komponenten
- Kommentare/Variablennamen im Projekt sind bisher gemischt Deutsch/Englisch (z. B. `Bounding Box berechnen`) – bei neuem Code beim bestehenden Stil bleiben, nicht künstlich vereinheitlichen, außer explizit gewünscht
- Keine neuen State-Management-Libraries (Pinia o. ä.) einführen, ohne kurz nachzufragen – aktuell ist noch offen, ob ein einfacher reactive Store reicht




