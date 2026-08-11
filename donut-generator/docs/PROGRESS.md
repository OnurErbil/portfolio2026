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

## 2026-08-10 – Eigene Icons im Konfigurator + Orientierungs-Punkte statt Sub-Icons

Status: ✅ bestätigt (2026-08-10)

- Die sechs Emoji-Icons in den Accordion-Kopfzeilen durch die eigenen SVGs aus `src/assets/icons/` ersetzt: `form_icon.svg`, `teig_icon.svg`, `fuellung_icon.svg`, `glasur_icon.svg`, `topping_icon.svg`, `ernaehrungsfilter_icon.svg`. Import in `ConfiguratorPanel.vue` als Asset-URL (Vite hasht/inlined das selbst), Bindung über die bestehende `icon`-Prop von `AccordionSection`
- `AccordionSection.vue`: rendert statt des Emoji-Textknotens ein `<img alt="">` in der farbigen Kachel. Die Hintergrundfarben der Kacheln sind unverändert geblieben (wie gefordert)
- Zentrierung: die Icons haben unterschiedliche Seitenverhältnisse (104×62 bis 61×76), deshalb `max-width`/`max-height: 28px` + `object-fit: contain` statt fester Größe – so bleiben sie unverzerrt und optisch gleich groß. Die Kachel zentriert per Flexbox
- Sub-Icons in den geöffneten Sektionen (Form/Teig/Füllung) durch einen einfachen farbigen Kreis ersetzt (`option-card-dot` in `OptionCardGroup.vue`), Farbe kommt aus dem bereits vorhandenen `hex` der Option – analog zu den Chips in `ToppingChipGroup`/`CollectionBar`. Rand `#8a7f74` (~3.9:1), damit auch helle/weiße Optionsfarben wie Füllung „Ohne" sichtbar bleiben (WCAG 1.4.11)
- Aufräumen: das `icon`-Feld (Emoji) in `IconCardOption` und allen Options-Listen in `src/state/donutConfig.ts` entfernt – nach dem Umstieg auf Farbpunkte toter Code; der Kommentar zu `hex` beschreibt jetzt beide Verwendungen (Punkt + Chip)
- Alle Icons bleiben dekorativ: Kachel weiterhin `aria-hidden`, das `<img>` zusätzlich mit leerem `alt` – die Sektion wird über ihren Titeltext benannt
- Verifiziert: `vue-tsc -b` fehlerfrei; `npm run build` erfolgreich (alle sechs SVGs werden aufgelöst – fünf inlined als Data-URI, `glasur_icon.svg` als eigenes Asset). Im Browser per Playwright/Chromium geprüft: alle sechs Icons laden (`naturalWidth > 0`), sind in ihrer Kachel exakt zentriert (Abweichung Mittelpunkt ≤ 0,01 px in beiden Achsen), Hintergrundfarben unverändert, Farbpunkte in Form/Teig/Füllung korrekt, keine Konsolenfehler

## 2026-08-10 – Glanzgrad-Regler auf 10–50 % begrenzt

Status: ✅ bestätigt (2026-08-10)

- `GLOSS_MIN = 10` / `GLOSS_MAX = 50` in `src/state/donutConfig.ts` ergänzt und im Slider (`ConfiguratorPanel.vue`) gebunden statt fester `min`/`max`-Attribute – so kann UI und Store nicht auseinanderlaufen
- Startwert `glossValue` von 60 auf 30 gesetzt: 60 lag außerhalb des neuen Bereichs, der Regler hätte beim ersten Rendern einen Wert angezeigt, den er nicht mehr erreichen kann. 30 ist die Mitte des neuen Bereichs – falls die Glasur weiterhin so glänzend starten soll wie bisher, wäre 50 der nächstgelegene Wert
- Die Umrechnung `getIcingRoughness()` bleibt unverändert (0–100 → Roughness 1–0.1); genutzt wird davon jetzt nur noch Roughness ~0.91 (matt) bis ~0.55 (seidig). Kommentar entsprechend präzisiert
- Verifiziert: `vue-tsc -b` fehlerfrei

### Nachtrag (2026-08-10) – ✅ bestätigt (2026-08-10) – Regler zählt wieder 0–100 %

- Umgebaut: Der Regler zeigt wieder die volle Skala 0–100 %, die Einschränkung wirkt jetzt in der Umrechnung statt an den Regler-Grenzen. `GLOSS_MIN`/`GLOSS_MAX` sind dafür entfallen und durch die modul-internen `EFFECTIVE_GLOSS_MIN`/`EFFECTIVE_GLOSS_MAX` (10/50) in `getIcingRoughness()` ersetzt – die Konstanten müssen dadurch nicht mehr exportiert werden
- `getIcingRoughness()` mappt den Reglerwert linear in dieses Band: 0 % → Roughness 0.91 (matt), 50 % → 0.73, 100 % → 0.55 (seidig). Der Nutzer bekommt also den vollen Regelweg, die Glasur wird aber nie zu spiegelnd
- Startwert `glossValue` auf 50 gesetzt (Mitte der sichtbaren Skala); entspricht genau dem Glanz, den vorher der Wert 30 im eingeschränkten Regler erzeugt hätte
- Verifiziert: `vue-tsc -b` fehlerfrei; Mapping mit Stützstellen 0/25/50/75/100 % nachgerechnet (0.910 / 0.820 / 0.730 / 0.640 / 0.550)

## 2026-08-10 – Kamera-Distanz im lil-gui einstellbar (Debug-Tool)

Status: ✅ bestätigt (2026-08-10)

- Neuer Ordner „Kamera" im lil-gui (`setupCameraGUI()` in `src/three/gui.ts`, eingehängt in `src/three/main.ts`): Regler für `Distanz`, `Min-Distanz`, `Max-Distanz` plus Button „Position in Konsole loggen"
- Der Distanz-Regler verschiebt die Kamera entlang ihrer aktuellen Blickrichtung zum Target, ändert also nur den Abstand und lässt den Blickwinkel unangetastet
- `OrbitControls` begrenzt den Abstand selbst auf `minDistance`/`maxDistance`. Damit der Distanz-Regler nicht stumm zurückspringt, wandert seine Range beim Ändern der beiden Grenzwerte mit (`controller.min()`/`.max()`)
- Der Regler ist per `.listen()` an den echten Kamerawert gekoppelt; `setupCameraGUI()` gibt dafür eine Sync-Funktion zurück, die in der Animations-Schleife den tatsächlichen Abstand zurückschreibt – so stimmt die Anzeige auch nach Zoomen/Orbiten per Maus
- Der Log-Button gibt die fertige `camera.position.set(...)`-Zeile inkl. Distanz aus, damit der gefundene Wert direkt nach `src/three/main.ts` übernommen werden kann
- Bewusst **nicht** geändert: die Start-Kameraposition `camera.position.set(0, 1, 1.5)` (Distanz ~1.803) – der Zielwert wird erst nach dem Ausprobieren gesetzt
- Hinweis für später: Das gehört zum lil-gui-Debug-Panel und fällt mit diesem beim Deployment weg bzw. hinter `import.meta.env.DEV` (siehe CLAUDE.md)
- Verifiziert: `vue-tsc -b` fehlerfrei (Browser-Prüfung diesmal bewusst ausgelassen, um den laufenden Dev-Server nicht wieder zu stören)

### Nachtrag (2026-08-10) – ✅ bestätigt (2026-08-10) – Zoom-Bereich festgelegt

- `controls.maxDistance` von 3 auf **1.03** gesetzt (weitester erlaubter Blick), `controls.minDistance` bleibt bei **0.5**
- Start-Kameraposition mitgezogen: `camera.position.set(0, 0.571, 0.857)` statt `(0, 1, 1.5)`. Der Blickwinkel ist identisch (dieselbe Richtung 0/1/1.5, nur auf Länge 1.03 skaliert), nur der Abstand ist kleiner. Nötig, weil die alte Position mit Distanz ~1.803 über dem neuen `maxDistance` lag – OrbitControls hätte sie beim ersten `update()` sichtbar zurückgeschnappt
- Der Distanz-Regler im lil-gui deckt damit jetzt genau den erlaubten Bereich 0.5–1.03 ab
- Verifiziert: `vue-tsc -b` fehlerfrei; Startdistanz nachgerechnet = 1.0298

## 2026-08-10 – Transparenter Canvas + CSS-Studio-Hintergrund („3D Grid Studio")

Status: ✅ bestätigt (2026-08-10)

- Neue Komponente `src/components/StudioBackground.vue`: heller Studio-Hintergrund komplett in CSS, ohne Bilddatei. Drei Ebenen – Lichtstimmung (`__glow`), perspektivisches Bodenraster (`__floor`), weicher Bodenschatten (`__shadow`) – auf Grundfarbe `#fcf8ef`
- Raster ist **echte** Perspektive statt gezeichneter: eine gleichmäßig gerasterte Ebene (zwei `repeating-linear-gradient`) wird per `perspective(190px) rotateX(64deg)` weggekippt, `transform-origin: 50% 0`. Dadurch laufen die Längslinien von selbst auf einen Fluchtpunkt in der horizontalen Mitte zu und die Querlinien werden nach hinten enger – ohne manuell berechnete Koordinaten, und beim Skalieren bleibt die Perspektive korrekt
- Horizont bei 38 % der Höhe (`--horizon`), Rasterfarbe `#d8bfa8`, Ebenen-`opacity: 0.28`
- Direkt am Horizont stehen die Querlinien rechnerisch unendlich dicht – das flimmert und ergäbe eine harte Kante. Deshalb blendet eine `mask-image`-Rampe das Raster oben und unten aus
- Farbstopps enden bewusst auf `rgba(…, 0)` statt `transparent`: `transparent` interpoliert in manchen Engines über transparentes Schwarz, was graue Ränder und damit sichtbare harte Verläufe erzeugt
- Magenta- (`#d0006f`, 5 %) und Orange-Glow (`#f47216`, 6 %) im vorgegebenen Rahmen von 4–7 %; warmer Glow hinter dem Donut bewusst nur bei 0.7 Alpha, sonst wäscht er die warme Grundfarbe zu Weiß aus
- Three.js: Renderer auf `alpha: true` + `setClearColor(0x000000, 0)`, `scene.background` entfernt. `scene.environment` (PMREM/RoomEnvironment) bleibt – das ist Beleuchtung, kein Hintergrund. Licht, Kamera, Controls und Materialien unverändert
- Trennung der Ebenen: `.canvas-wrap` in `App.vue` ist der Bühnen-Container, `StudioBackground` liegt darin auf `z-index: 0`, der Canvas transparent auf `z-index: 1`. Die UI (Panel, CollectionBar, Navigation) liegt komplett außerhalb dieses Wrappers
- Alle Hintergrund-Elemente sind `aria-hidden` und `pointer-events: none`, damit OrbitControls nicht beeinträchtigt wird
- Verifiziert (gegen `vite preview` auf Port 4173, damit der laufende Dev-Server nicht gestört wird; Playwright diesmal isoliert außerhalb des Projekts installiert, `package.json`/`package-lock.json` unberührt): `vue-tsc -b` und `npm run build` fehlerfrei, keine Konsolenfehler. `elementFromPoint()` in der Mitte des Bühnen-Bereichs liefert `CANVAS` (Hintergrund fängt keine Klicks ab), und ein Drag über den Canvas verändert das Bild – OrbitControls funktioniert also weiterhin
- Bekannte, **nicht** von dieser Änderung verursachte Einschränkung: bei ~420 px Breite ist der Bühnen-Bereich durch das noch fehlende responsive Layout des App-Bodys stark zusammengedrückt (siehe „Noch offen" in CLAUDE.md). Der Hintergrund selbst ist responsiv (nur relative Einheiten, plus feineres/flacheres Raster unter 720 px)

## 2026-08-11 – Kamera-/Produkt-Animation pro Konfigurator-Sektion

Status: ✅ bestätigt (2026-08-11)

Umfasst die Schritte 1–4 des abgestimmten Plans; die endgültigen Szenen-Werte werden
noch im Browser aufgezeichnet (Schritt 5).

- Neuer Store `src/state/sceneFocus.ts`: hält die offene Accordion-Sektion. Vorher lag das als lokales `ref` in `ConfiguratorPanel.vue` – die Three.js-Schicht hängt sich jetzt per `watch()` dran, statt in eine Vue-Komponente hineinzugreifen (gleiches Muster wie Material- und Topping-Watcher)
- `ConfiguratorPanel.vue` startet dadurch **zugeklappt** statt mit offener „Form"-Sektion, sonst wäre die neutrale Anfangsszene nie zu sehen
- Neue Datei `src/three/scenes.ts`: Typ `DonutScene` + fünf Presets (`neutral`, `form`, `teig`, `glasur`, `toppings`) als reine Daten, dazu die Zuordnung Sektion → Szene. Füllung und Ernährungsfilter haben bewusst keine Szene und fallen über `?? 'neutral'` zurück – „Füllung vorerst nicht einschließen" ohne Sonderfall im Code
- Startwerte für Kamera und Zoom-Grenzen in `src/three/main.ts` kommen jetzt aus `donutScenes.neutral` statt hart codiert – die Zahlen stehen nur noch an einer Stelle
- Neuer Animator `src/three/sceneAnimator.ts` (bewusst ohne Tween-Library, ~60 Zeilen): 0.9 s, `easeInOutCubic`, Kamerapfad in **Kugelkoordinaten** statt linear – linear würde die Kamera durch den Donut ziehen und der Abstand sackte auf halber Strecke ein. Winkel jeweils über den kürzeren Weg
- Der Donut hängt neu in einer Pivot-Gruppe (`donutPivot` in `main.ts`). `root` sitzt im GLB nicht im Ursprung und wird per `position.sub(center)` verschoben; eine Drehung von `root` hätte den Donut um den versetzten Modell-Ursprung geschwenkt statt ihn an Ort und Stelle zu drehen
- Zoom-Grenzen gehören zur Szene, nicht global: `controls.update()` klemmt den Abstand **auch bei `enabled === false`**, ein Flug wäre sonst unterwegs hängengeblieben. Während des Flugs sind die Grenzen offen, beim Ankommen werden die der Szene gesetzt – nie enger als der aktuelle Abstand, damit es beim Abbrechen nicht ruckt
- Nutzer hat Vorrang: `pointerdown`/`wheel` auf dem Canvas brechen einen laufenden Flug ab. Die Listener hängen in der **Capture-Phase** – OrbitControls registriert seinen `pointerdown`-Handler schon im Konstruktor am selben Canvas und hätte den Klick bei `enabled === false` sonst verworfen, das Ziehen hätte erst beim zweiten Ansetzen gegriffen
- Leerlauf-Drehung (0.15 rad/s) nur in der neutralen Szene, pausiert während der Nutzer selbst dreht (OrbitControls-Events `start`/`end`), Winkel per Modulo begrenzt
- `prefers-reduced-motion: reduce`: kein Flug (Sprung ans Ziel) und keine Leerlauf-Drehung. Wird bei jedem Zugriff frisch gelesen, wirkt also ohne Reload
- `THREE.Clock` ist ab r185 deprecated – Zeitmessung direkt über `performance.now()`, Delta auf 0.1 s gedeckelt, sonst springt die Drehung nach einem Tab-Wechsel und ein laufender Flug wäre sofort beendet
- Preset-Recorder im lil-gui (`setupSceneGUI()` in `src/three/gui.ts`): Szenen-Dropdown, Regler „Donut-Drehung Y", Schalter „Leerlauf-Drehung" (ohne ihn lässt sich die neutrale Szene nicht einstellen, weil der Donut den Regler sofort überschreibt), Buttons „Szene anfahren", „Szene speichern + loggen" und „Alle Presets loggen". Gespeicherte Werte gehen direkt in die laufende Szene, sind also sofort über das Accordion prüfbar
- Verifiziert (gegen `vite preview` auf Port 4173, Playwright isoliert außerhalb des Projekts): `vue-tsc -b` und `npm run build` fehlerfrei, keine Konsolenfehler. Kameraposition über den lil-gui-Log-Button ausgelesen – Start auf `neutral`, „Glasur" öffnen landet exakt auf dem Ziel (unterwegs nachweislich Zwischenposition), Zuklappen exakt zurück auf `neutral`, Toppings-Szene erreicht Distanz 0.601 innerhalb ihrer eigenen Grenzen, Leerlauf-Drehung sichtbar und per Schalter abstellbar, Drag bricht den Flug ab, `prefers-reduced-motion` springt ohne Animation und ohne Drehung

### Nachtrag (2026-08-11) – ✅ bestätigt (2026-08-11) – Aufgezeichnete Szenen eingetragen

- Die im lil-gui aufgezeichneten Presets ersetzen die Platzhalter in `src/three/scenes.ts` (Schritt 5/6 des Plans)
- Zwei Anpassungen an den Rohwerten, jeweils im Code kommentiert:
  - `neutral.maxDistance` von 1.03 auf 1.031: der aufgezeichnete Abstand liegt bei 1.0301 und lag durch das Runden auf drei Nachkommastellen 0.0001 **über** der Grenze – OrbitControls hätte die Kamera beim Start klemmen müssen
  - `donutPivot.rotation.y` wird in `main.ts` mit `neutral.donutRotationY` (0.45) initialisiert. Vorher startete der Donut auf 0 und wäre erst beim ersten Zuklappen einer Sektion richtig ausgerichtet gewesen
- Hinweis ohne Änderung: `glasur` liegt mit Abstand 0.5001 exakt auf seiner `minDistance` – in dieser Szene lässt sich also nicht mehr hineinzoomen, nur heraus. Falls gewünscht, `minDistance` dort auf z. B. 0.45 senken
- Verifiziert: `vue-tsc -b` und `npm run build` fehlerfrei. Alle vier Sektionen im Browser durchgeklickt, jede erreicht ihre aufgezeichnete Position exakt (Abweichung < 0.01), Rückkehr auf neutral funktioniert, keine Konsolenfehler. Screenshots geprüft: Teig-Szene zeigt bewusst die Unterseite (negative Kamera-Höhe), Toppings-Szene die Glasuroberfläche
