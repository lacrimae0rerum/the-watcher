# Edition summary reader

Objective: the web reader opens each edition on a model-written summary of all sources and drills into one item's detail card on selection.
Branch: `feat/edition-summary-reader` from `main` (`1d5b27d`). Delivery: `ask-on-risk`; forecast ~250 authored lines. Test runner: `node --test packages/*/index.test.mjs scripts/*.test.mjs`; web checked in headless Chrome.

## Specs
- **S1 — Summary first, details on selection.** User request (verbatim): "Quiero cambiar la visualizacion de los digests. Lo primero que deberia verse es el texto completo resumido de todas las fuentes, luego si selecciono una en concreto si entrariamos a estos detalles:" followed by the detail card `FUENTE / FECHA / HECHOS / SIN CONFIRMAR / QUIÉN DEBE COMPROBAR / SIGUIENTE PASO` for `incibe_cert — https://x.com/incibe_cert/status/2109947340752568736`.
- **S2 — The model writes the summary.** User choice (verbatim): "Lo escribe el modelo (Recomendado)" — "Añado al prompt una sección de resumen en prosa con referencias a cada ficha. La web la muestra primero y, al pulsar una referencia, abre la ficha. Hace falta una generación nueva con NaN y que apruebes la edición; mientras tanto, la edición actual se ve como lista."
  - Prompt contract (Cybersecurity `digest-intro.md`): a `Resumen` section of short Spanish prose comes first; every item heading is numbered consecutively across sections as `**[n] Heading**`; the summary cites each item at least once as `[n]` and adds no facts beyond the items.
- **S3 — Exporter.** `parseEdition` returns the `Resumen` prose as `summary` (paragraphs of inline segments, with `[n]` as reference segments only when item `n` exists) and gives numbered items a `ref`. Editions without a summary or numbering parse exactly as before.
- **S4 — Web reader.** With a summary: show the summary first, then an index of items by section; selecting a reference or index entry shows that item's detail card with a way back to the summary. Without a summary: keep the current full-list rendering (assumption: fallback for the saved edition until it is regenerated).
- **S5 — Regenerated edition.** Human gate: one Cybersecurity collection plus one NaN generation under the new prompt, user approval, explicit save, and web export.

## Tasks
| ID | Specs | Route | Status | Evidence |
|----|-------|-------|--------|----------|
| ESR-1 | S2, S3 | inline (no Writer trigger) | done | `3baf854`; RED 2 tests, GREEN; full suite 115/116 (known preview-digest saved-edition failure) |
| ESR-2 | S1, S4 | inline (depends on ESR-1 data shape) | done | commit in Log L5; headless Chrome scenarios, 0 JS errors |
| ESR-3 | S5 | human gate | pending | |

## Log
- L1 (2026-10-13): "Quiero cambiar la visualizacion de los digests. Lo primero que deberia verse es el texto completo resumido de todas las fuentes, luego si selecciono una en concreto si entrariamos a estos detalles:" + pasted `incibe_cert` detail card.
- L2 (2026-10-13): The saved Cybersecurity edition and its prompt contain no overall summary: only item cards under `Acciones prioritarias`, `En seguimiento`, and `Contexto y aprendizaje`. The user chose a model-written summary over a web-assembled one.
- L3 (2026-10-13): Scope is the Cybersecurity prompt (the only watcher with a saved edition); the reader and exporter changes are watcher-agnostic. The package asset count test (13 files) means the sample digest is updated in place, not duplicated.
- L4 (2026-10-13): ESR-1 closed in `3baf854`. The prompt now asks for a `Resumen` with `[n]` citations and numbered item headings; the fictional sample follows it. `parseEdition` returns `summary` and item `ref`; the live saved edition still parses to 16 items with an empty summary. Focused 25/25, full suite 115/116 with the known `preview-digest` saved-edition failure.
- L5 (2026-10-13): ESR-2 implemented in `web/app.js` and `web/styles.css`; README documents the reader. Headless Chrome (CDP) over a scratch copy built from the fictional sample: summary first with 3 citations and a 3-entry index by section; citation [2] opens card [2] under `En seguimiento` with focus on the back button; Esc returns to the summary with focus on that item's entry; an index entry opens card [3] and the back button returns; Esc on the summary closes the reader; switching watcher resets the open card; 390×844 mobile has no horizontal overflow; a copy with the live edition (no summary) renders the previous 16-card list. No JavaScript errors. Web has no unit test runner, so no RED test applies.
