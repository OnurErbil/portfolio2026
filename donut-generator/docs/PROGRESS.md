# Progress Log

Diese Datei listet von Claude Code umgesetzte Arbeitspakete, die **noch nicht vom
Projektinhaber bestätigt** wurden. Workflow (siehe auch CLAUDE.md → „Tracking-Workflow"):

1. Ein Arbeitspaket wird fertiggestellt und hier mit Status `⏳ wartet auf Bestätigung` eingetragen.
2. Der Projektinhaber prüft/bestätigt.
3. Nach Bestätigung wird der Punkt in `CLAUDE.md` unter „Bereits umgesetzt" ergänzt, aus
   „Noch offen / nächste Schritte" entfernt und hier auf `✅ bestätigt` gesetzt.

So bleibt `CLAUDE.md` die alleinige Quelle für den bestätigten Ist-Stand, ohne dass Punkte doppelt geführt werden.

---

## 2026-07-23 – HelloWorld entfernen + erste Konfigurator-UI

Status: ✅ bestätigt (2026-07-24)

- `src/components/HelloWorld.vue` (Vite-Boilerplate) entfernt
- `src/state/donutConfig.ts` angelegt: einfacher `reactive()`-Store (bewusst keine neue Library wie Pinia)
- `src/three/main.ts`: Teig-/Icing-Farbe kommen aus dem Store statt hart codiert; `watch()` bindet Änderungen live an die Materialien; Watcher wird im bestehenden Dispose-Pattern sauber gestoppt
- `ConfiguratorPanel.vue` (erste Version): Farb-Swatches für Teig & Icing
- `App.vue`-Layout (Panel + Canvas) aufgebaut
- Bug gefunden & behoben: lil-gui-Debug-Panel (fix oben rechts) überlappte das neue Konfigurator-Panel → Reihenfolge getauscht (Panel links, lil-gui bleibt reines Debug-Overlay über dem Canvas)
- Google Fonts (Fredoka/Poppins) in `index.html` eingebunden
- Verifiziert: `vue-tsc -b` fehlerfrei; UI per Playwright/Chromium (temporär installiert, danach entfernt) im Browser getestet – Klick-Interaktion ändert Material-Farbe live, keine Konsolenfehler

## 2026-07-23 – ConfiguratorPanel (Accordion) nach Design-Prototyp + BFSG

Status: ✅ bestätigt (2026-07-24)

- Mesh-Check im `donut.glb` durchgeführt (Node-Skript, glTF-JSON-Chunk ausgelesen): nur die Meshes `donut` und `icing` vorhanden → Form, Füllung und Toppings bewusst als Platzhalter umgesetzt (siehe CLAUDE.md, Mesh-Namenskonvention)
- Store erweitert (`src/state/donutConfig.ts`): `shapeId`, `doughId`, `fillingId`, `icingColorId`, `glossValue`, `toppingIds[]`, `vegan`, `glutenfrei` + zugehörige Options-Listen
- `src/three/placeholders.ts` angelegt: `applyShape` / `applyFilling` / `applyToppings` als benannte No-op-Funktionen mit TODO-Kommentar, bereits per `watch()` an den Store gekoppelt – Material-/Geometrie-Logik muss nur noch ergänzt werden, sobald die Meshes im GLB existieren
- Neue Komponenten unter `src/components/configurator/`: `AccordionSection`, `OptionCardGroup`, `ColorSwatchGroup`, `ToppingChipGroup`, `SwitchToggle`
- `src/composables/useRadioGroupKeyboard.ts`: Roving-Tabindex + Pfeiltasten-Navigation für Radiogroups
- `src/utils/color.ts`: `hexToCss`-Helper
- `ConfiguratorPanel.vue` neu aufgebaut: 6 Accordion-Sektionen (Form, Teig, Füllung, Icing/Glasur inkl. neuem Glanzgrad-Slider, Toppings, Ernährungsfilter) mit Icon, Titel und Live-Zusammenfassung je Sektion
- Glanzgrad-Slider (Icing) neu verdrahtet: steuert `roughness` des Icing-Materials in Echtzeit (0–100 % → roughness 1–0.1)
- BFSG/Barrierefreiheit: WAI-ARIA Accordion-Pattern (`aria-expanded`/`aria-controls`), Radiogroup-Pattern mit Roving Tabindex (Form/Teig/Füllung/Icing-Farbe), Checkbox-Group (Toppings), Switch-Pattern (Ernährungsfilter), sichtbare `:focus-visible`-Ringe, dekorative Emoji-Icons per `aria-hidden`
- Kontrast-Bug gefunden & behoben: Swatch-/Radio-/Switch-Ränder von `#e4d9c1` (~1.4:1 Kontrast) auf `#8a7f74` (~3.9:1) gedunkelt – WCAG 1.4.11 „Non-Text Contrast" (min. 3:1), v. a. relevant beim weißen Icing-Swatch
- Layout-Bug gefunden & behoben: 2-Spalten-Grid bei den Auswahlkarten führte bei langen Begriffen („Schokoladenteig", „Erdbeermarmelade") zu Textüberlauf über den Panel-Rand → auf 1 Spalte umgestellt, zusätzlich `overflow-wrap: break-word`
- Bewusst **nicht** übernommen: die Preis-/„Zur Sammlung hinzufügen"-Leiste mit Konfetti/Toast aus dem Prototyp – kein Bezug zum `ConfiguratorPanel` (Sammlungs-/Warenkorb-Feature), zudem hatte der Original-Button (weiß auf Orange) unzureichenden Kontrast
- Verifiziert: `vue-tsc -b` fehlerfrei; UI per Playwright/Chromium getestet – Accordion-Verhalten (nur eine Sektion offen), Klick- und Tastatur-Interaktion (Pfeiltasten im Radiogroup), `aria-checked`-States, keine Konsolenfehler

## 2026-07-24 – CollectionBar: Auswahl-Zusammenfassung, Preis, „Zur Sammlung hinzufügen"

Status: ✅ bestätigt (2026-07-24)

- Neue Komponente `src/components/CollectionBar.vue` nach `context/Konfigurator Seite.dc.html`: fixe Leiste am unteren Rand mit Auswahl-Chips, Preis und CTA-Button, inkl. Konfetti- und Toast-Feedback beim Klick (wie im Prototyp, aber als eigene Vue-`ref`/`setTimeout`-Logik statt State-Machine-Nachbau)
- `getPrice()` in `src/state/donutConfig.ts` ergänzt: 3,20 € Basis + 0,30 €/Topping + 0,40 € bei Füllung ≠ „Ohne" + 0,50 € je aktivem Ernährungsfilter (Formel 1:1 aus dem Prototyp übernommen)
- `shapeOptions`/`fillingOptions` um `hex`-Werte erweitert (rein dekorativ für die Auswahl-Chips) – `IconCardOption.hex` dafür verpflichtend gemacht, `DoughOption`-Interface entfernt (jetzt strukturell identisch zu `IconCardOption`)
- Neuer Store `src/state/collection.ts`: „Zur Sammlung hinzufügen" legt einen echten Snapshot der aktuellen Auswahl an (nicht nur eine Animation) und persistiert ihn in `localStorage`. Eine Galerie-Seite dafür (`context/Meine Kreationen.dc.html`) existiert noch nicht – bewusst offen gelassen, siehe „Noch offen" in CLAUDE.md
- Layout: `--collection-bar-space` CSS-Variable in `style.css` eingeführt, von `App.vue` (Padding) und `ConfiguratorPanel.vue` (`max-height`) genutzt, damit die fixe Leiste weder Panel noch Canvas verdeckt
- Kontrast-Bug im Original-Prototyp gefunden & bewusst nicht übernommen: weißer Button-Text auf `#F47216` liegt bei ~2.9:1 (fehlschlägt WCAG 1.4.3, min. 4.5:1) – stattdessen dunkler Text `#2B2320` auf demselben Orange (~5.3:1). Beim ersten Entwurf des Hover-Zustands (`#E0660F`) lag der Kontrast mit ~4.45:1 hauchdünn unter dem Grenzwert – Hover-Effekt daher auf Lift/Schatten statt Farbänderung umgestellt
- Barrierefreiheit: Auswahl-Chips als `<ul>`/`<li>` mit `aria-label`, dekorative Farbpunkte per `aria-hidden`; Toast als dauerhaft vorhandene `role="status" aria-live="polite"`-Region (nicht conditional gerendert, damit Screenreader zuverlässig ankündigen); Konfetti-Animation über `prefers-reduced-motion: reduce` deaktiviert; Button per Tastatur fokussier- und auslösbar
- Verifiziert: `vue-tsc -b` fehlerfrei; UI per Playwright/Chromium getestet – Preisberechnung (Stichprobe 3,20 + 0,40 + 2×0,30 + 0,50 = 4,70 €), Chip-Anzahl, Toast-Timing, `localStorage`-Eintrag, kein Overlap zwischen Panel und Leiste, Tastatur-Auslösung, `prefers-reduced-motion`-Verhalten, keine Konsolenfehler

## 2026-07-24 – TopNavigation nach Design-Prototyp

Status: ✅ bestätigt (2026-07-24)

- Neue Komponente `src/components/TopNavigation.vue` nach `context/Top Navigation.dc.html`: Pill-Nav mit Logo/Wordmark „DonutLab", Nav-Links, CTA-Button „Donut erstellen", responsivem Hamburger-Menü (Umbruch bei 1024px) statt des JS-`resize`-Listeners aus dem Prototyp (hier über CSS-Media-Query gelöst, schlanker und ohne Layout-Thrashing)
- Design-Abweichung vom Prototyp bewusst gewählt: `Top Navigation.dc.html` nutzt „Baloo 2" als Headline-Font, das offizielle `Donut Design System.dc.html` legt aber „Fredoka" als Headline-Font fest (bereits im ganzen Rest der App verwendet) – Nav nutzt daher konsequent Fredoka statt eine dritte Font-Familie nachzuladen
- Placeholder-Hrefs für die drei künftigen Unterseiten: `#meine-kreationen`, `#inspiration`, `#ueber-uns` (Anker statt echter Pfade wie `/inspiration`, da kein Router existiert und ein echter Pfad auf dem statischen IONOS-FTP-Hosting zu einem 404 führen würde, bis Seiten + Router existieren). „Konfigurator" verlinkt auf `#konfigurator` (= `id` auf dem `<main>`-Element dieser Seite) und ist per `aria-current="page"` als aktive Seite markiert
- Layout-Integration: `#app` auf `display:flex; flex-direction:column` umgestellt, neue CSS-Variable `--nav-space` in `style.css`, von `ConfiguratorPanel.vue` (`max-height`) berücksichtigt, damit die (nicht fixierte) Nav weder Panel noch CollectionBar überlappt
- Barrierefreiheit: Skip-Link „Zum Hauptinhalt springen" (erster Tab-Stopp, per CSS erst bei Fokus sichtbar), `<nav aria-label="Hauptnavigation">`, Hamburger-Button mit `aria-label`/`aria-expanded`/`aria-controls`, Mobile-Menü schließt automatisch beim Wechsel auf Desktop-Breite (`matchMedia`-Listener), Fokus-Ringe auf allen Links/Buttons
- Kontrast-Bug gefunden & behoben: „Aktuelle Seite"-Kennzeichnung (Unterstrich bzw. Hintergrund) war ursprünglich in Orange (`#F47216`) geplant analog zum Prototyp – liegt bei ~2.9:1 auf Weiß und verfehlt sowohl WCAG 1.4.3 (Text, min. 4.5:1) als auch 1.4.11 (UI-Komponenten, min. 3:1). Auf das bereits geprüfte Pink (`#D0006F`, ~5.4:1) umgestellt. CTA-Button nutzt wie bei der CollectionBar dunklen Text auf Orange statt Weiß auf Orange
- Bekannte Einschränkung (kein neuer Bug, bestehendes Tech-Debt): lil-gui (Dev-only, siehe CLAUDE.md) überlappt bei schmaler Fensterbreite den Hamburger-Button und die Desktop-CTA, da es aktuell nicht hinter einen `import.meta.env.DEV`-Check gesetzt ist – betrifft nur die lokale Entwicklung, nicht den Produktivbau
- Verifiziert: `vue-tsc -b` fehlerfrei; UI per Playwright/Chromium getestet (Desktop 1400px & Mobile 600px) – Sichtbarkeits-Umschaltung Desktop-Links/Hamburger, `href`-Werte, `aria-current`, kein Overlap zwischen Nav/Panel/CollectionBar, Skip-Link als erster Tab-Stopp, Hamburger öffnet/schließt Mobile-Panel (`aria-expanded`), Klick auf Mobile-Link schließt das Menü, keine Konsolenfehler

## 2026-07-24 – Form-Auswahl vorerst auf „Klassisch rund" reduziert

Status: ✅ bestätigt (2026-07-24)

- `shapeOptions` in `src/state/donutConfig.ts` auf die eine Option „Klassisch rund" reduziert; die übrigen Formen aus dem Prototyp (Ring mit Twist, Länglich/Bar, Mini-Donuts) sind entfernt, nicht auskommentiert – die Definitionen stehen weiterhin in `context/Konfigurator Seite.dc.html`, ein Kommentar im Code verweist darauf
- Die Form-Sektion im Accordion bleibt bestehen (mit einer Option), damit die Struktur steht, sobald weitere Formen dazukommen
- Verifiziert: `vue-tsc -b` fehlerfrei; per Playwright/Chromium geprüft – genau eine Option wird gerendert, Zusammenfassung und Auswahl-Chip zeigen weiterhin „Klassisch rund", Pfeiltasten-Navigation in der jetzt einelementigen Radiogroup bleibt stabil (Fokus und `aria-checked` korrekt), keine Konsolenfehler

## 2026-07-24 – Toppings werden echt in 3D generiert

Status: ✅ bestätigt (2026-07-24)

- Neues Modul `src/three/toppings.ts`: erzeugt die Toppings zur Laufzeit als Geometrie auf der Glasur – Streusel als `CapsuleGeometry` (länglich mit abgerundeten Enden, liegen flach auf der Oberfläche), Schokostückchen als `SphereGeometry`. Beide als `InstancedMesh` (eine Draw-Call pro Sorte) und als Kinder des `icing`-Mesh, damit sie dessen Transform automatisch mitmachen
- Platzierung: `MeshSurfaceSampler` sampled Punkte auf der echten Glasur-Geometrie; nur nach oben zeigende Flächen (`normal.y >= 0.35`) bekommen Toppings, ein Mindestabstand (Rejection-Sampling) verhindert Verklumpen. Ausrichtung über Quaternion entlang der Flächennormale, Streusel zusätzlich flach gelegt und zufällig um die Normale gedreht
- Aufteilungslogik wie gefordert: Gesamtzahl ist fix (60). Ein Topping = 60 Objekte, beide Toppings = 30 + 30, also **keine Verdopplung**. Beide teilen sich denselben Punkte-Pool im Wechsel, dadurch streuen beide gleichmäßig über den Donut und die Positionen springen beim Umschalten nicht
- Fester Seed (mulberry32 statt `Math.random`) für die Verteilung: gleiche Optik bei jedem Laden, reproduzierbar für Tests/Screenshots
- Größen werden aus der Bounding-Box des Modells abgeleitet, nicht hart codiert – bleibt korrekt, falls `donut.glb` neu exportiert wird
- `toppingOptions` in `src/state/donutConfig.ts` auf Streusel + Schokostückchen reduziert (Kokosraspeln, Nüsse, Puderzucker entfernt); die Farbe im Store ist zugleich die Material-Farbe im 3D, UI-Chip und Objekt bleiben so synchron
- `applyToppings()` aus `src/three/placeholders.ts` entfernt – Toppings sind kein Platzhalter mehr; Form und Füllung bleiben dort. Watcher in `src/three/main.ts` entsprechend aufgeteilt, Dispose-Pattern um `toppings.dispose()` (Geometrien, Materialien, InstancedMeshes) erweitert
- `@types/three` kennt `MeshSurfaceSampler.setRandomGenerator()` nicht, obwohl die Methode im JS existiert – gelöst über ein schmales Interface + expliziten Cast statt `any` (siehe Coding-Präferenzen)
- Verifiziert: `vue-tsc -b` fehlerfrei. Zähl-Logik headless mit dem echten Modul getestet (Node + rolldown-Bundle, temporär): Geometrie-Typen (Capsule/Sphere), 0 bei keiner Auswahl, 60 bei einer Sorte, 30+30 bei beiden (Summe bleibt 60, nicht verdoppelt), `dispose()` entfernt alle Instanzen. Zusätzlich im Browser per Playwright/Chromium (SwiftShader) visuell geprüft – Streusel und Kugeln sitzen korrekt auf der Oberseite, keine Konsolenfehler

### Nachtrag (2026-07-24) – ✅ bestätigt (2026-07-24)

- Streusel werden jetzt bunt gemischt eingefärbt (Weiß, Blau, Rot, Gelb, Grün) statt einfarbig: Palette `STREUSEL_COLORS` in `src/three/toppings.ts`, Umsetzung über `InstancedMesh.setColorAt()` pro Instanz, Grundmaterial daher Weiß. Die Farbe hängt am Punkt im Pool, nicht am Instanz-Slot – ein Streusel behält seine Farbe also auch beim Umschalten der Toppings
- `instanceColor` wird direkt beim Erzeugen befüllt, damit der Shader nicht erst beim ersten Aktivieren neu kompiliert werden muss
- Schokostückchen tauchen tiefer in die Glasur ein (Versatz entlang der Normale von `0.75 × Radius` auf `0.25 × Radius` reduziert)
- Hinweis zur Konsistenz: der Hex-Wert für „Streusel" in `src/state/donutConfig.ts` ist jetzt nur noch die UI-Farbe des Chip-Punkts (Orange, aus dem Design-System) – im 3D gilt die bunte Palette. Kommentar im Store entsprechend angepasst
- Verifiziert: `vue-tsc -b` fehlerfrei; im Browser mit weißer Glasur geprüft – alle fünf Streusel-Farben sichtbar, Schokokugeln sitzen sichtbar tiefer, keine Konsolenfehler
