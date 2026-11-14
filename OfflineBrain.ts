/** No API or cloud dependency: answers grounded in the bundled campus catalogue. */
import {ask,findPlaces,rank,type Reading,type Preferences} from './logic';
import {building,buildings,events,facilities,spaces,sources} from './data';
export type CampusAnswer={text:string;ids:string[];hint?:string};
const qnorm=(q:string)=>q.toLowerCase().replace(/[’']/g, '').replace(/[^\w\s-]/g,' ').replace(/\s+/g,' ').trim();
export const starterQuestions=[
 'Where can I study quietly?', 'Find a water fountain', 'What events are coming up?',
 'How do I find my classroom?', 'Where can I print?', 'Where are the microwaves?',
 'Is there group study space?', 'How do I book a study room?',
 'Find outlets and charging', 'How do I navigate University Commons?',
 'Are there quiet floors at Cameron?', 'Can ChatUAB work offline?'
];
export function answerOffline(query:string, readings:Reading[], prefs:Preferences, position?:[number,number]):CampusAnswer{
 const q=qnorm(query);
 if(!q)return {text:'Choose a campus question below or enter a building, room code, or study amenity.',ids:[]};
 const eventMatch=events.find(e=>q.includes(qnorm(e.title)) || (q.length>8 && qnorm(e.title).includes(q)));
 if(eventMatch)return {text:`${eventMatch.title} is listed for ${eventMatch.date} by ${eventMatch.organizer}. This is an organizer listing saved November 14, 2026, not live confirmation. Open the event card for location and the original source.`,ids:[eventMatch.id]};
 if(/^(hi|hello|hey|good morning|good evening)\b/.test(q))return {text:'Hey! I can find known rooms, explain study zones, show upcoming organizer-listed events, and help with campus facilities — even without Wi-Fi.',ids:[]};
 if(/what can (you|chatuab) do|how (do i use|does this work)|help me|what should i ask|capabilit/.test(q))return {text:'I work with a saved campus catalogue — no paid AI API. Ask me about classrooms, building navigation, study zones, water, printing, microwaves, outlets, event dates, or booking links. Choose a suggestion below.',ids:[]};
 if(/offline|without wifi|without internet|no network|no wifi/.test(q))return {text:'ChatUAB can use downloaded campus records, event listings, and room data offline after you first open the installed web app online. Live event updates, external links, and unvisited map imagery still require internet.',ids:[]};
 if(/(eventbrite|instagram|is .*real|verify|scam|poster|legit|qr code)/.test(q))return {text:'Verify Beta compares a submitted event or link with our locally saved organizer records. A matching listing is useful evidence, not a guarantee that the event is safe or still scheduled. Eventbrite and Instagram searches open externally when online.',ids:events.slice(0,3).map(e=>e.id)};
 if(/(event|happening|this week|next week|weekend|calendar|activities|concert|karaoke|trivia|what.s on)/.test(q))return {text:`I have ${events.length} sourced campus and university-affiliated listings dated Nov 14–28, 2026. Browse the cards for dates, organizers, and original links. Times marked “check organizer” were not published in the sources available to me.`,ids:events.slice(0,5).map(e=>e.id)};
 if(/(water|refill|drinking fountain|bottle fill|hydrate)/.test(q))return {text:position?'SUB has a documented refill-station listing. Your selected position does not provide exact indoor distances; choose the SUB building for the listing.':'The Students’ Union lists water-refill stations in SUB. Exact indoor locations aren’t mapped here; choose where you are starting before calling anything the nearest.',ids:['sub-water']};
 if(/(microwave|heat.*food|warm.*food)/.test(q))return {text:'UASU announced microwaves in the CAB basement and at the InfoLink desk between CAB and Cameron. The exact equipment status is not live. Select a location card for the building signal.',ids:['cab-heat','infolink-heat']};
 if(/(print|printer|photocop|onecard printer|scan document)/.test(q))return {text:'The U of A library directory lists ONEcard printers in Rutherford North. Check access and availability at the desk; I can show the building on the map.',ids:['r-print']};
 if(/(outlet|plug|charg|power|socket)/.test(q))return {text:'These study locations document electrical outlets. Outlets are not live-tracked, so available seats and exact socket positions can vary.',ids:spaces.filter(s=>s.outlets).slice(0,5).map(s=>s.id)};
 if(/(book.*(room|space)|reserv|meeting room)/.test(q))return {text:'Room booking is handled through the official U of A library booking service. Cameron, Rutherford, and Sperber have bookable areas; ChatUAB cannot see real-time availability. Open the booking link when connected.',ids:spaces.filter(s=>s.bookable).slice(0,4).map(s=>s.id)};
 if(/(group work|group study|collaborat|team meeting|discussion zone)/.test(q))return {text:'For conversation and group work, look for officially designated discussion zones or bookable group rooms. Here are documented locations.',ids:spaces.filter(s=>s.zone==='Discussion'||s.group).slice(0,5).map(s=>s.id)};
 if(/(quiet|silent|study|library|focus|reading|less noise|not noisy)/.test(q)){
  const silent=/silent|absolute quiet|no talking/.test(q);
  const result=rank(readings,prefs,position).filter(r=>silent?r.space.zone==='Silent':r.space.zone!=='Discussion').slice(0,5);
  return {text:silent?'These are designated silent-study areas in the library directory. Their current occupancy is unknown.':'Here are documented quiet study zones. “Quiet” refers to the published zone rule — not a live noise measurement.',ids:result.map(r=>r.space.id)};
 }
 if(/(next class|my class|timetable|schedule)/.test(q))return {text:'I can help find the building and room, but I don’t have access to your Bear Tracks timetable. Tell me the classroom code (for example CCIS 1-150).',ids:[]};
 if(/(classroom|lecture hall|room number|where is room)/.test(q))return {text:'Search by building or classroom code. The university’s classroom directory is bundled locally; indoor corridor routes are schematic, not surveyed walking directions.',ids:facilities.filter(f=>f.category==='Classrooms').slice(0,5).map(f=>f.id)};
 if(/(how.*get|direction|navigate|indoor map|floor map|route|way to|find my way)/.test(q))return {text:'Choose a known building and then a starting point inside University Commons. The floor guide draws illustrative connected routes and has manual step navigation. It cannot track your position indoors.',ids:['commons']};
 if(/(hours|open now|when.*open|closing|24 7)/.test(q))return {text:'Campus building and library hours change by day and holidays. The offline catalogue does not prove a location is open right now; use the official library hours page when online.',ids:spaces.slice(0,4).map(s=>s.id)};
 if(/(wifi|eduroam|internet)/.test(q))return {text:'Eduroam is offered in library study areas, including Cameron. ChatUAB has no live Wi-Fi status monitor.',ids:spaces.filter(s=>s.wifi).slice(0,4).map(s=>s.id)};
 if(/(washroom|toilet|bathroom|accessible|wheelchair|elevator|stairs)/.test(q))return {text:'Accessible entrances, washrooms and lifts need verified building plans. The University Commons indoor guide has schematic floor transitions, not guaranteed accessible routes. Confirm signs or ask building staff.',ids:['commons']};
 if(/(food|eat|dining|lunch|coffee|snack)/.test(q))return {text:'The Students’ Union Building has food and convenience options. Vendor hours and menus aren’t cached in ChatUAB.',ids:['sub-food']};
 if(/(student service|student centre|university commons|ucomm)/.test(q))return {text:'University Commons contains student services and study areas. Our interactive floor guide shows sourced destinations on an illustrative plan; pick a starting point for a route preview.',ids:['commons','ucomm-quiet']};
 if(/(lost|safety|security|emergency|help line)/.test(q))return {text:'For immediate danger call 911. For campus safety, contact U of A protective services through the official university channels; ChatUAB is not an emergency dispatch service.',ids:[]};
 if(/(weather|temperature|rain|snow)/.test(q))return {text:'I don’t have a live weather feed in offline mode. Please check a weather service when online.',ids:[]};
 const matchingRooms=findPlaces(query).filter(f=>!f.sample);
 if(matchingRooms.length)return {text:'These matches are from the bundled campus directory. Check signs before relying on an indoor room location.',ids:matchingRooms.slice(0,6).map(f=>f.id)};
 const matches=buildings.filter(b=>q.includes(qnorm(b.short))||q.includes(qnorm(b.name))).slice(0,4);
 if(matches.length)return {text:'I found these campus buildings in the offline catalogue. Select a card to see the building and supported indoor map.',ids:matches.map(b=>b.id)};
 const fallback=ask(query,readings,prefs,position);
 if(fallback.ids.length)return fallback;
 return {text:'I’m an offline campus guide, not a general chatbot. Try asking about quiet libraries, a classroom code, campus events, water, microwaves, food, printing, or University Commons.',ids:[]};
}
