# University Commons navigation and destination discovery — UX update

This version is the full ChatUAB React/Vite project, not a standalone demonstration page.

- Replaced the plain `Discover Places` list with photo-led editorial introduction, illustrated destinations and functional category, floor and wing filters.
- Reduced automatic zoom peaks; set bounded map camera pan/zoom, shorter transitions and stable camera on manual floor changes; a user gesture cancels the ongoing cinematic flyover.
- Camera overlay is available from the indoor map and active route, with live camera permission request, correct camera cleanup, fallback states, step instruction overlay, close and next-turn buttons. It is explicitly a preview: no world-anchored indoor AR, camera-based localization or accurate physical turn positioning.
- Lightened illustrative architectural map materials and corrected route-path reveal on the active floor.
- The app preserves the existing University Commons destinations, floors and schematic routing, plus the rest of ChatUAB.

Verification: 31 logic/routing tests passed with temporary TypeScript-to-ESM transpilation. React/JSX syntax checked; a static 390px directory layout screenshot was rendered, with no horizontal overflow. Full Vite build and actual React interaction screenshot were NOT verified because npm dependencies are unavailable in this environment.

The University Commons geometry is illustrative, not a verified surveyed floor plan; indoor directions cannot be treated as physically accurate.
