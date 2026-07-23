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
│  │  ├─ ConfiguratorPanel.vue    # Accordion-Panel, komponiert die configurator/-Bausteine
│  │  └─ configurator/
│  │     ├─ AccordionSection.vue  # Ein-/Zuklapp-Sektion (WAI-ARIA Disclosure-Pattern)
│  │     ├─ OptionCardGroup.vue   # Icon-Card-Radiogroup (Form, Teig, Füllung)
│  │     ├─ ColorSwatchGroup.vue  # Farb-Swatch-Radiogroup (Icing)
│  │     ├─ ToppingChipGroup.vue  # Mehrfachauswahl-Chips (Toppings)
│  │     └─ SwitchToggle.vue      # An/Aus-Switch (Ernährungsfilter)
│  ├─ composables/
│  │  └─ useRadioGroupKeyboard.ts # Roving Tabindex + Pfeiltasten-Navigation
│  ├─ state/
│  │  └─ donutConfig.ts     # zentraler reactive Store für den Konfigurationsstate
│  ├─ three/
│  │  ├─ main.ts            # initScene() – Szenen-Setup, Lifecycle
│  │  ├─ donut.ts           # loadDonut() – GLTF laden, Meshes identifizieren
│  │  ├─ placeholders.ts    # No-op-Funktionen für Form/Füllung/Toppings (Meshes fehlen noch)
│  │  └─ gui.ts             # lil-gui Debug-Panels (temporär)
│  ├─ utils/
│  │  └─ color.ts           # hexToCss-Helper
│  ├─ App.vue
│  ├─ main.ts                # Vue-Einstiegspunkt
│  └─ style.css
├─ docs/
│  ├─ PROGRESS.md            # Tracking umgesetzter Arbeitspakete, siehe „Tracking-Workflow" unten
│  └─ design/                # TODO: Design-Screenshots/Exports hier ablegen
├─ index.html
├─ vite.config.ts
└─ tsconfig*.json
```

**Wichtig:** Es gibt zwei `main.ts`-Dateien (`src/main.ts` für Vue, `src/three/main.ts` für die Three.js-Szene). Bei Anweisungen an Claude Code immer den vollen Pfad angeben, um Verwechslungen zu vermeiden.

## Aktueller Stand (Stand: Projektstart-Phase abgeschlossen)

### Tracking-Workflow

Neue Arbeitspakete werden von Claude Code zunächst in [`docs/PROGRESS.md`](docs/PROGRESS.md)
dokumentiert (Status `⏳ wartet auf Bestätigung`). **Erst wenn der Projektinhaber die dort
gelisteten Punkte bestätigt**, werden sie hier unter „Bereits umgesetzt" ergänzt und aus
„Noch offen / nächste Schritte" gestrichen. So bleibt dieser Abschnitt die alleinige,
nicht-doppelte Quelle für den bestätigten Ist-Stand – Claude Code soll nichts eigenständig
von „Noch offen" nach „Bereits umgesetzt" verschieben, ohne dass diese Bestätigung erfolgt ist.

**Noch offen / nächste Schritte:**


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

Lese folgenden Prototypen um die generelle Struktur und Aufbau des Donut Generators zu verinnerlichen:

- @context




