# ChatUAB Indoor Navigation Release

## Scope
The **Map** tab now opens an indoor-only interactive wayfinding preview rather than the former outdoor Leaflet map.

Supported schematic previews:
- **CCIS:** classroom IDs 1-140, 1-160, 1-430, 1-440, L1-140, L1-160, L2-190 and L2-200 from the project classroom dataset, as well as a general Level 2 corridor preview.
- **Cameron Library:** basement Knowledge Common, Study Hall and bookable rooms; first- and second-floor discussion/common areas; third-floor silent zone.
- **Rutherford North:** designated discussion/quiet/silent levels and silent room 3-112.
- **Sperber:** lower-level quiet/silent zones and Level 1 discussion zone.

### Interactive implementation
- Building selector, floor selector, room/zone search and destination selection
- Choose an origin (entrance, floor core or mapped destination)
- Connected shortest path routing on a per-floor graph, including floor transitions
- Route overlay follows drawn corridors and selected points, animated blue lines and chevrons
- Step-by-step guidance with Back / Next / Reset and highlighted current step
- Zoom in/out, drag to pan, recenter
- Links to original older University of Alberta Cameron floorplan PDFs for main floor and basement
- Home Map action and selected study-space directions now open the indoor guide; outdoor map no longer appears on Map tab
- Unknown buildings offer an explicit unsupported message instead of invented geometry

### Accuracy and safety
This release is a **functional map prototype using deliberately illustrated schematic geometry**, not a surveyed floorplan, live indoor location, accessible routing, or reliable walking distance/time. Classroom IDs and named noise zones are taken from project data and university public information; their positions inside the drawings are illustrative. Use posted campus signs and official building plans for actual physical navigation. No camera positioning or outdoor map is required to demonstrate the route engine.

### Testing
- 19/19 test cases passed in a dependency-free Node transpilation test runner (15 existing + 4 new indoor map tests).
- New graph: an additional 35 assertions of multi-floor connectivity, destination reachability and unsupported route handling passed.
- All 22 source TS/TSX files transpiled with zero syntax diagnostics.
- Full Vite production build and browser interaction/visual QA **not verified** in this environment due to missing installed React/Vite dependencies. Run `npm ci && npm run build` in a local project copy with network access and visually inspect before using it in a demonstration.

### Change list
- `src/IndoorNavModel.ts` — new routing graph, floor graph construction and instructions.
- `src/IndoorNavigator.tsx` — interactive indoor viewer and controls.
- `src/indoor-navigator.css` — mobile-first indoor navigation design.
- `src/main.tsx` — indoor-only map tab and navigation entry points.
- `src/DestinationFinder.tsx` — indoor route finder instead of outdoor/camera buttons.
- `tests/indoor-navigator.test.ts` — new route tests.

## Official source links
- U of A Library study area directory: https://www.ualberta.ca/en/library/services/study-area-directory.html
- Cameron first-floor plan (older published map): https://sites.library.ualberta.ca/wp-content/uploads/2021/01/27Jan2021_LibrarySpace_CameronFirstFloor.pdf
- Cameron basement plans (older published map): https://sites.library.ualberta.ca/wp-content/uploads/2020/08/seats-map-cameron.pdf
