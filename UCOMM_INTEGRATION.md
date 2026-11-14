# University Commons — integrated ChatUAB Map tab

This version changes **the main React/Vite application**, not a standalone HTML demo. The main Map tab already imports and displays `UniversityCommonsNavigator` when the selected building is `ucomm`, which is the default.

## What changed
- Rebuilt the University Commons indoor-map UI as a single responsive, photo-led map experience.
- Four animated floor states, historic/new-wing emphasis, selectable room markers, real search results, zoom, drag and pinch-to-zoom.
- Connected graph-based illustrative routes across floors 1–4, selected route markers, route-step controls and progress.
- Corrected Student Service Centre to UCOMM **2-180** from the official U of A service page. Added UASU InfoLink and Computing Science breakout rooms 2-040 and 3-002 from university-affiliated directories.
- Source links and uncertainty notes are shown alongside the route, not disguised as real indoor positioning.
- Uses `photo('commons')` to keep the building photo working on hosted base paths.

## Known limitations
Official full architectural floor drawings for floors 1–4 were not obtained. The floor geometry and room marker positions are an original schematic, NOT surveyed maps, physical turn-by-turn directions, or accessible-route instructions. Room references from older departmental documents may be outdated and require onsite confirmation.

## Testing
23/23 existing tests passed using an offline TypeScript-to-CommonJS test harness (the usual `npm test` runner requires packages unavailable in the creation environment). TypeScript/TSX source syntax parsed. A static first-state rendering was inspected at 375, 390 and 768px; no horizontal overflow. **Full React production build and interactive browser end-to-end tests remain unverified.**

## Run the main app on your Mac
In the extracted ChatUAB directory, run `npm ci` if dependencies are missing, then `npm run dev`. Navigate to Map.
