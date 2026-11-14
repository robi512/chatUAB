# ChatUAB Delight Edition — implementation notes

**Built into the existing React/Vite application**, starting from `ChatUAB-Navify-UCOMM-Integrated.zip`, without replacing University Commons indoor navigation.

- Home: two-stage chat-first flow with animated uploaded bear mascot, working assistant entry, six looping typing questions, eight custom miniature 3D artwork cards, and eight photo-led library zones.
- Icons: 12 original WebP miniature illustrations included locally in `public/art` (study, classroom, water, food, events, map, printing, transit, microwave, outlets, verify, group). Not emoji, not font icons.
- Mascot/brand: the user-supplied university bear mark is animated with gentle floating and emphasis; the user-supplied University of Alberta wordmark is included in the home intro. The app remains explicitly an independent student project.
- Font: Nunito, a rounded open-source typeface for a playful learning-app style (not Duolingo's proprietary font), with native-system fallbacks. Warm ivory, green and gold visual system, plus dark appearance corrections.
- Spaces: eight curated entries have eight distinct photo paths. Existing licensed local photos plus linked public University of Alberta and Wikimedia Commons images; if an online image fails, the app falls back to its existing building photo. Study-zone assignments are from the U of A's published directory, not fabricated live occupancy. Photos may be building-level, not the precise desk or floor. No live occupancy API is claimed.
- Facility signals: tapping **Water** or **Microwaves** on Home opens the building-level locator. The chosen station receives pulsing marker/rings and a location sheet. Marker positions are derived from known building coordinates, **not** precise equipment coordinates. The app does not invent indoor routes for SUB/CAB and provides location details where detailed floor maps are unsupported.
- Verify BETA: redesigned intro, continuous scan animation, supported local QR decoding and input checks, two real **public web search actions** for Eventbrite and Instagram evidence, and transparent local-match results. It does **not** secretly contact those services or fabricate third-party verification. External lookups open public results for manual inspection.
- Onboarding: existing two steps retained, visually transformed with the responsive mascot, friendlier large headings, animated accents, and tactile button states; skip/replay/preferences remain intact.
- Existing University Commons navigation and all other app features were retained.

## Verification
- 27/27 existing logic and routing tests pass using locally transpiled `.ts` modules.
- React `.tsx` source files passed the TypeScript syntax parser.
- 12 icon WebP assets exist with nonzero file sizes and the eight home study cards have eight unique configured image paths.
- Full Vite/React production build **not verified** because required npm dependencies and type definition files are missing in this execution environment. A headless browser attempt did not render a usable live React screenshot. Final visual and interaction checks must be done using `npm install`, `npm run build`, and `npm run dev` on the user's machine.

## Run
Unzip this ZIP into a **new folder** (do not overwrite any other ChatUAB copy). Inside `ChatUAB`, run `npm install` if node_modules are missing, then `npm run dev -- --port 5180`. Open `http://localhost:5180`.
