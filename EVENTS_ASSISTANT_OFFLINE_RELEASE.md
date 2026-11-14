# ChatUAB — Events + Offline Assistant Update (November 14, 2026)

This update builds on the existing ChatUAB React/Vite project and retains University Commons navigation and the other screens.

## Changes

- University of Alberta wordmark on home hero is static: no CSS animation, transform, transition, or drift.
- Event list replaced with 17 actual organizer-sourced listings dated between November 14 and 28, 2026, including UASU, U of A Music, U of A Press, WiSER, and HackED Beta. Listed dates are a snapshot collected November 14, 2026; listings can change. Unknown times are not invented.
- Campus Updates shows organizer-listed events. Events browser now has searchable, photo-free premium date cards, organizer names, and source labels and direct source links.
- Verify BETA offers sample checks against the bundled organizer records and keeps Eventbrite/Instagram searches explicitly manual. A local listing match is not an official endorsement or safety certificate.
- Rule-based offline ChatUAB Bear answers many common room, study, amenities, map, and campus-event questions without any external AI API. It shows suggested questions, an approximately 600 ms local thinking animation, and actionable cards grounded in the bundled catalogue. It does not pretend to be a general-purpose LLM.
- Added service worker for same-origin runtime caching and precaching campus photos and 3D icon artwork, plus the app shell after successful online load. No weather/real-time event updates or external maps are available offline. Service workers require a secure context (localhost/HTTPS) and an initial successful network load.

## Event source links

- UASU Events Calendar: https://www.su.ualberta.ca/events/
- University of Alberta Department of Music: https://www.ualberta.ca/en/music/concert-listings/index.html
- U of A Press Events: https://ualbertapress.ca/events/
- WiSER Annual Industry Mixer 2026: https://www.eventbrite.ca/e/wiser-annual-industry-mixer-november-2026-attendee-registration-tickets-1999114265583
- Campus Cup: https://su.ualberta.ca/these-are-your-resources/this-is-your-time-off/uasuevents/campus-cup/
- HackED organizer schedule: https://hacked.compeclub.com/

## Test status

- 33 / 33 routed/logic/source tests passed using an independent TypeScript-to-CommonJS test compilation.
- Source files pass TypeScript syntax/transpilation checks and `public/sw.js` passes Node syntax check.
- Complete Vite production compilation and actual running browser/mobile QA are **not verified**; npm could not install required packages in this environment (ENOTCACHED). Please run `npm ci`, `npm test`, and `npm run build` on a working Mac/npm environment before presenting or deploying.

## Important limitations

- 'Organizer listing found' means an official or organizer-controlled source page was located and included in the saved snapshot. It does not certify the event or show real-time availability.
- Studio interiors, outdoor maps and some schematic indoor navigation are not physically verified. Do not use them as live/accessible wayfinding guarantees.
- The AI assistant uses rules and catalog entries rather than an API-backed generative model.
