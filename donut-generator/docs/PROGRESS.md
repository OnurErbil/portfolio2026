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
