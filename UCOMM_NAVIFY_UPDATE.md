# University Commons indoor navigation — main React app

This version integrates an original Navify-inspired 2.5D floor illustration in the existing **Map** tab. It is not a separate HTML demo.

**User flow:** open Map → University Commons → default Quiet Study Space (Room 1-090) → choose your starting point (blue markers) → Start navigation → zoom-out route reveal, animated blue trace, return to origin → Next/Back step controls. Explore floors 1–4 with floor selector, zoom, drag, destination search and detail/source actions.

## Fidelity and safety

Room 1-090 is sourced from publicly available university reference material. Individual room records may change. Architecture, furniture, stairs/vertical connections, route distances and the navigation path are **conceptual**, not surveyed or safety-certified, and must not be represented as guaranteed real-world directions. The interface carries a compact Concept Map indicator rather than the earlier long disclaimer. No live indoor localization is claimed.

## Verification

- TypeScript/TSX parsed with TypeScript's transpiler (no syntax diagnostics).
- 27/27 pure routing and logic tests passed in a separate offline transpilation run.
- Static browser snapshot of actual React component markup and CSS at mobile width was examined; browser tool lacked the installed React/Vite dependencies for a complete app mount.
- **Full `npm run build`, native React runtime and on-device navigation remain unverified.** Run them before using as a live wayfinding product.

No paid API or external design assets were added. Your original project is not altered until you deliberately replace/copy files.
