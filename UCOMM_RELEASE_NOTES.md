# University Commons — four-level indoor navigation focus

## Source package
This version branches from `ChatUAB-Indoor-Navigation-Working-Preview.zip`. The **Map tab defaults to University Commons (UCOMM)** instead of outdoor navigation. Other screens and existing building demos are preserved.

## Done
- A separate `UniversityCommonsNavigator.tsx` and `UniversityCommonsModel.ts` with a dedicated interactive four-floor diagram.
- Both historic and new wings are represented as **illustrative zones**; transitions animate as floors change. The wing highlighting controls do not change verified geometry.
- Search and select source-supported rooms/spaces; POI selection changes floors; destination and source details display.
- A manually advanced route (start, next, back, reset) with a connected blue path for each floor and an illustrated vertical connection. Zoom, pan and recenter are functional. No GPS claims, fake metres, or automatic progress.
- The locations are supported by public U of A publications, including: quiet study room 1-090; tour room 1-330; student service centre floor 2; classroom 2-001; wellness room 2-300; multipurpose rooms 2-350 and 2-450; McCullough Reading Room on floor 3 (listed as 3-400 in departmental guide); multipurpose room 3-160; fourth-floor cupola corridor; meeting rooms 4-400, 4-440.
- Facilities: U of A confirms washrooms and elevators in University Commons. **Exact positions were not verified**, so this version uses a visible notice rather than fabricated facility pins.
- `UCOMM_QUICK_PREVIEW.html` can be opened directly in a browser and supports interaction without npm or server installation. The real app's React implementation is separate.

## Accuracy / limitations
**This is not a surveyed or certified floor plan.** Room and service names/floors have source references, but room pin coordinates and the path/network through the historic/new wings are illustrative. Do not follow it as real safety-critical physical navigation. Four up-to-date public architectural floor plans could not be obtained through the available sources. Do not claim live indoor positioning, guaranteed accessibility, verified doors, real walking distance, or accurate turn-by-turn guidance.

## Research sources
- https://www.ualberta.ca/en/youalberta/2025/10/new-study-spots-and-student-services-your-guide-to-the-revitalized-university-commons.html
- https://www.ualberta.ca/en/mathematical-and-statistical-sciences/intranet/mss-administration--operations-reference-guide_2021-september-22.pdf (March 2025 departmental guide, links to some UCOMM floor-plan files; direct drawings could not be recovered)
- https://sites.ualberta.ca/~amw8/Fall%202025%20INT-D%20161%20%28Section%20A1%29%20syllabus.pdf
- https://www.ualberta.ca/en/sustainability/events/sdg-month.html
- https://zeidler.com/projects/university-of-alberta-university-commons/

## Verification
- 4/4 newly added route tests pass, using the TypeScript transpiler offline.
- 15/15 sourced POIs connect through the illustrative graph; an example floor-1-to-floor-4 route contains 3 inter-floor transitions.
- TS / TSX source syntax checks passed for 24 files.
- The dependency-free HTML preview was opened in Chromium at 390px and exercised through floor switching, destination search, and route start; no horizontal overflow observed.
- **Full npm install / React production build not verified in this environment:** required package tarballs are missing from the local npm cache and registry network is blocked. Run `npm test && npm run build` on the Mac with installed dependencies.
