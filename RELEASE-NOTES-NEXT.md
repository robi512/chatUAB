# ChatUAB — integrated navigation and study discovery update

This is a complete React/Vite project based on the most recent ChatUAB Delight Edition ZIP available in this conversation, not a live copy of the Mac's Downloads/ChatUAB folder.

## Implemented
- University Commons destination-first cinematic route: focus the chosen destination, zoom out to route overview, trace the path, fly back to the manually chosen start, then enter step-by-step guidance.
- Animated compass-style current-position marker, compass badge, larger rectangular map canvas, and retained floor-stack transitions.
- South Academic Building (SAB) preview teaser; no unsupported indoor floor plan is shown as real.
- Ten curated named study locations across University Commons, Cameron, Rutherford, and Sperber; no duplicate names and ten distinct local illustrative interior assets.
- Study filters distinguish actual quiet, silent, and discussion designations; original search, saving, and destination flows remain available.
- The outdated unsupported-building wording replaced with a short non-misleading state.
- New 3D category icon appears on the selected indoor-map destination sheet.

## Accuracy and verification
- University Commons corridor geometry and route lines remain **illustrative** and not suitable as reliable physical directions or accessibility routing.
- Newly generated study interiors are **illustrations, not photos of actual listed rooms**. The UI labels this clearly. No invented live occupancy.
- Test suite: 30/30 logic, routing, study-curation, and image-existence tests passed in a transpiled local test run.
- All edited TS/TSX source parsed successfully.
- Full Vite production build and rendered browser QA were not completed because dependencies could not be installed in this container.

## Opening on a Mac
Extract ZIP in a new folder and start the Vite development server there; do not open index.html directly, and don't overwrite older working folders without a backup.
