# MB-002 — Korea Door-to-Door Trip Cost Comparator

A static Korean-language calculator comparing household door-to-door costs for driving, rail, and intercity bus travel. It keeps the bounded Seoul–Busan, Seoul–Gangneung, and Seoul–Jeonju route set.

## Local verification

The same portable commands work in Windows PowerShell/cmd and POSIX shells; the test command does not depend on wildcard expansion.

```sh
npm ci
npm test
python3 -m http.server 8000
```

Check the root and all three route pages. At 320, 390, and 430 CSS px, verify no page-level horizontal overflow, a collapsed nine-assumption disclosure, stacked result cards, visible keyboard focus, 200% text zoom, and 44px-or-larger controls.

## Presets and maintenance

Each route has nine preset records with a source or transparent method, checked date, review-by date, direction scope, evidence kind, and caveat. The UI marks stale presets and user edits independently. Review fuel and public-transport fares on their shorter cadence before describing presets as current; route, toll, parking, and transparent access estimates follow their documented dates.

## Measurement

The page defines allowlisted `acquisition_view`, `comparison_start`, `comparison_complete`, and `result_action` events. There is no external analytics transport. Tests inject an in-memory adapter; without one, the page only emits a development-friendly local `CustomEvent` and creates no identifier or network request.

## Deployment

Production uses free GitHub Pages at <https://leejx12.github.io/mb-002-korea-door-to-door-trip-cost/>. After pushing `main`, verify HTTP 200 and canonical/H1 content at the root and all three route URLs, then run one comparison per route and repeat responsive, keyboard, invalid-input, source-state, checklist, console, and network checks against the deployed commit.
