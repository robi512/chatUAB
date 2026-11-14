import classroomRows from './classrooms.json';
const university = 'https://www.ualberta.ca/en';
export const sources = {
  microwaves:'https://www.reddit.com/r/uAlberta/comments/1qrg3b0/new_microwaves_in_cab/',
  hacked: 'https://hacked.compeclub.com/',
  food: 'https://www.su.ualberta.ca/these-are-your-resources/this-is-your-wellness/food-options/',
  water: 'https://www2.su.ualberta.ca/about/sustainability/refillstations/',
  map: university + '/maps.html',
  study: university + '/library/services/study-area-directory.html',
  booking: university + '/library/services/book-study-space.html',
  hours: university + '/library/locations/index.html',
  services: university + '/services/student-services-directory/find-a-study-space-at-the-library.html',
  classrooms: university + '/registrar/examinations/classroom-bookings/centrally-scheduled-classrooms.html',
  office: university + '/science/about-us/facilities/ccis-bookings/contact.html',
  cameron: university + '/library/locations/cameron/index.html',
  rutherford: university + '/library/locations/rutherford/index.html',
  sperber: university + '/library/locations/sperber/index.html',
};
export const sourceDate = '2026-11-14';
export type Building = {id:string; name:string; short:string; point:[number,number]; description:string};
export const buildings:Building[] = [
  {id:'bus',name:'Alberta School of Business',short:'BUS',point:[53.527444,-113.521969],description:'Business classrooms and student services.'},
  {id:'csc',name:'Computing Science Centre',short:'CSC',point:[53.526823,-113.527056],description:'Computing Science Centre classrooms.'},
  {id:'ccis',name:'Centennial Centre for Interdisciplinary Science',short:'CCIS',point:[53.52812,-113.52673],description:'Science teaching, research and lecture theatres.'},
  {id:'cameron',name:'Cameron Library',short:'Cameron',point:[53.526783,-113.523708],description:'Science and Engineering Library.'},
  {id:'rutherford',name:'Rutherford Library',short:'Rutherford',point:[53.526133,-113.521653],description:'Humanities, Social Sciences and Education Library.'},
  {id:'sperber',name:'Geoffrey + Robyn Sperber Library',short:'Sperber',point:[53.521607,-113.526508],description:'Health Sciences Library in the Dianne and Irving Kipnes Health Research Academy.'},
  {id:'commons',name:'University Commons',short:'University Commons',point:[53.525530,-113.523471],description:'Academic and student gathering space.'},
  {id:'sub',name:'Students’ Union Building',short:'SUB',point:[53.52528,-113.52713],description:'Student services and campus amenities.'},
  {id:'tory',name:'Henry Marshall Tory Building',short:'Tory',point:[53.52796,-113.52207],description:'North Campus academic building.'},
  {id:'etlc',name:'Engineering Teaching and Learning Complex',short:'ETLC',point:[53.52738,-113.52912],description:'Engineering classrooms and labs.'},
  {"id": "a", "name": "Arts and Convocation Hall", "short": "A", "point": [53.526753, -113.522614], "description": "North Campus classroom building."},
  {"id": "af", "name": "Agriculture/Forestry", "short": "AF", "point": [53.526112, -113.5281], "description": "North Campus classroom building."},
  {"id": "bs", "name": "Biological Sciences Centre", "short": "BS", "point": [53.529174, -113.5262], "description": "North Campus classroom building."},
  {"id": "cab", "name": "Central Academic Building", "short": "CAB", "point": [53.526598, -113.524743], "description": "North Campus classroom building."},
  {"id": "c", "name": "Chemistry Centre", "short": "C", "point": [53.52741, -113.52464], "description": "North Campus classroom building."},
  {"id": "esb", "name": "Earth Sciences", "short": "ESB", "point": [53.528185, -113.523646], "description": "North Campus classroom building."},
  {"id": "fab", "name": "Fine Arts Building", "short": "FAB", "point": [53.524434, -113.519876], "description": "North Campus classroom building."},
  {"id": "gsb", "name": "General Services Building", "short": "GSB", "point": [53.525976, -113.529356], "description": "North Campus classroom building."},
  {"id": "hc", "name": "Humanities Centre", "short": "HC", "point": [53.526917, -113.519917], "description": "North Campus classroom building."},
  {"id": "lc", "name": "Law Centre", "short": "LC", "point": [53.524304, -113.518585], "description": "North Campus classroom building."},
  {"id": "mec", "name": "Mechanical Engineering", "short": "MEC", "point": [53.527756, -113.528041], "description": "North Campus classroom building."},
  {"id": "ms", "name": "Medical Sciences", "short": "MS", "point": [53.522011, -113.524308], "description": "North Campus classroom building."},
  {"id": "nre", "name": "Natural Resources Engineering Facility", "short": "NRE", "point": [53.526621, -113.529373], "description": "North Campus classroom building."},
  {"id": "sab", "name": "South Academic Building", "short": "SAB", "point": [53.525611, -113.524556], "description": "North Campus classroom building."},
  {"id": "tel", "name": "TELUS Centre", "short": "TEL", "point": [53.523403, -113.518621], "description": "North Campus classroom building."},
  {"id": "vvc", "name": "Van Vliet Complex", "short": "VVC", "point": [53.523468, -113.527668], "description": "North Campus classroom building."},
  {"id": "ed-n", "name": "Education Centre North", "short": "ED-N", "point": [53.523773, -113.523261], "description": "North Campus classroom building."},
  {"id": "ed-s", "name": "Education Centre South", "short": "ED-S", "point": [53.523245, -113.5235], "description": "North Campus classroom building."},
];
export const center:[number,number] = [53.52690,-113.52445];
export const building = (id:string) => buildings.find(item=>item.id===id) ?? buildings[0];
export const filters = ['All','Quiet','Group','24/7','Silent','Outlets','Wi-Fi','Open now','Bookable','Individual study','Accessibility'] as const;
export type Filter = typeof filters[number];
export type Space = {id:string; buildingId?:string; name:string; floor:string; zone:'Quiet'|'Silent'|'Discussion'; image:string; outlets:boolean; wifi:boolean; group:boolean; bookable:boolean; accessible:boolean; access:string; always?:boolean; description:string; zones:string[]; booking:string};
export const spaces:Space[] = [
  {id:'rutherford',name:'Rutherford Library',floor:'South · Floor 2',zone:'Quiet',image:'rutherford',outlets:false,wifi:false,group:true,bookable:true,accessible:false,access:'Check visitor hours and access before going.',description:'The Rutherford South second-floor reading room is a designated quiet zone. For group work, use the discussion zones or book a room in Rutherford North.',zones:['South 2 · Reading room: quiet; foyer: discussion','North 3 · Quiet; room 3-112 is silent','North 5 · Silent','North 1, 2 and 4 · Discussion'],booking:'7 bookable rooms'},
  {id:'cameron',name:'Cameron Library',floor:'Basement · Knowledge Common',zone:'Quiet',image:'cameron',outlets:true,wifi:true,group:true,bookable:true,accessible:true,access:'After-hours basement entry requires a student or staff ONEcard. See the official page for visitor hours.',always:true,description:'Quiet carrels, powered tables and individual and group workstations. The Knowledge Common and Study Hall are designated quiet zones.',zones:['Basement · Knowledge Common and Study Hall: quiet','Main and second-floor common area · Discussion','Floor 3 · Silent'],booking:'18 bookable rooms on the main floor and basement'},
  {id:'sperber',name:'Geoffrey + Robyn Sperber Library',floor:'Lower Level',zone:'Silent',image:'sperber',outlets:true,wifi:false,group:true,bookable:true,accessible:false,access:'Check visitor hours. Official room booking is for University of Alberta students and staff.',description:'Table seating with electrical outlets, individual rooms and group rooms. The lower level includes both quiet and silent sections.',zones:['Level 1 · Discussion','Lower level, around stairs · Quiet','Lower level, past the RC 424.7 stacks and L1-152A · Silent'],booking:'12 group rooms and 10 individual rooms'},
];
// University Commons locations are separately grounded in the university's building guide.
spaces.push(
  {id:'ucomm-quiet',buildingId:'commons',name:'University Commons · Quiet Study Room 1-090',floor:'Floor 1 · Room 1-090',zone:'Quiet',image:'commons',outlets:false,wifi:false,group:false,bookable:false,accessible:false,access:'Confirm current access on posted building signage.',description:'University Commons quiet-study room 1-090, listed in the university departmental directory. This listing does not indicate current capacity.',zones:['Floor 1 · Quiet Study Room 1-090'],booking:'No booking information confirmed'},
  {id:'ucomm-atrium',buildingId:'commons',name:'University Commons · Atrium Seating',floor:'Floor 1 · Atrium',zone:'Discussion',image:'commons',outlets:false,wifi:false,group:true,bookable:false,accessible:false,access:'Open seating and access may vary.',description:'Informal seating in the public University Commons atrium. This is not an officially designated silent zone.',zones:['Floor 1 · Informal shared space'],booking:'Open seating; availability unconfirmed'}
);
const studyZones=[
  ['cameron','main','Main floor discussion area','Floor 1','Discussion'],
  ['cameron','second','Second-floor common area','Floor 2','Discussion'],
  ['cameron','third','Third-floor silent study','Floor 3','Silent'],
  ['rutherford','north-main','North main-floor discussion','North · Floor 1','Discussion'],
  ['rutherford','north-two','North second-floor discussion','North · Floor 2','Discussion'],
  ['rutherford','north-three','North third-floor quiet study','North · Floor 3','Quiet'],
  ['rutherford','3112','Silent room 3-112','North · Floor 3','Silent'],
  ['rutherford','north-four','North fourth-floor discussion','North · Floor 4','Discussion'],
  ['rutherford','north-five','North fifth-floor silent study','North · Floor 5','Silent'],
  ['rutherford','south-foyer','South discussion foyer','South · Floor 2','Discussion'],
  ['sperber','main','Level 1 discussion zone','Level 1','Discussion'],
  ['sperber','stairs','Quiet study by the stairs','Lower Level','Quiet'],
] as const;
for(const [buildingId,key,label,floor,zone] of studyZones){
  const base=spaces.find(s=>s.id===buildingId)!;
  spaces.push({...base,id:buildingId+'-'+key,buildingId,name:base.name+' · '+label,floor,zone,
    description:label+' is listed in the university study-area directory. Amenities vary by seat.',
    zones:[floor+' · '+zone],always:false,outlets:false,group:zone==='Discussion',bookable:false,booking:'Open study area',accessible:false});
}
/** Exactly ten distinct, verified campus places for the curated study discovery surface. */
export const featuredStudyIds=[
  'ucomm-quiet','cameron','rutherford','cameron-third','rutherford-north-three',
  'sperber','cameron-main','rutherford-north-five','sperber-main','ucomm-atrium'
] as const;
export const featuredStudySpaces=featuredStudyIds.flatMap(id=>spaces.filter(space=>space.id===id));
/** Every feature photo is a unique, commissioned illustrative interior, not a location photograph. */
export const studyImage=(space:Space)=>{
  const index=(featuredStudyIds as readonly string[]).indexOf(space.id);
  if(index>=0)return `study-interior-${String(index+1).padStart(2,'0')}`;
  const unique:Record<string,string>={
    'rutherford-north-main':'rutherford-desk',
    'rutherford-north-three':'rutherford-galleria',
    'rutherford-south-foyer':'rutherford-galleria'
  };
  return unique[space.id]??space.image;
};
export const spaceBuilding=(id:string)=>spaces.find(s=>s.id===id)?.buildingId??id;
export type Facility = {id:string; name:string; building:string; floor:string; category:string; source?:string; detail:string; sample?:boolean};
export const categories=['All','Classrooms','Study spaces','Outlets','Water','Washrooms','Accessible washrooms','Elevators','Stairs','Printers','Computers','Microwaves','Food','Entrances','Indoor connections'];
export const facilities:Facility[] = [
  {id:'office150',name:'CCIS 1-150 · ISSS office',building:'ccis',floor:'Floor 1',category:'Office',source:sources.office,detail:'The Faculty of Science lists this as the Interdepartmental Science Students’ Society office.'},
  ...classroomRows.map(([name,room,seats])=>{
    const code=name.match(/\(([^)]+)\)$/)?.[1]?.toLowerCase()??'';
    const id=code==='ed'?(name.includes('North')?'ed-n':'ed-s'):code==='t'?'tory':code==='khra'?'sperber':code;
    const destination=buildings.some(b=>b.id===id)?id:'';
    const level=room.split(' ').at(-1)?.match(/^(L\d|\d|B|M)-/)?.[1];
    return {id:code==='ccis'?'ccis-'+room.slice(5):'room-'+room.toLowerCase().replace(/ /g,'-'),name:room,building:destination,floor:level==='B'?'Basement':level==='M'?'Main level':level?'Level '+level:'Check building signage',category:'Classrooms',source:sources.classrooms,detail:name+' · '+seats+' seats. Registrar’s centrally scheduled classroom directory.'};
  }),
  ...spaces.map(s=>({id:'study-'+s.id,name:s.name+' study space',building:spaceBuilding(s.id),floor:s.floor,category:'Study spaces',source:sources.study,detail:s.description})),
  ...spaces.filter(s=>s.outlets).map(s=>({id:'power-'+s.id,name:'Powered study tables',building:s.id,floor:'See library zone directory',category:'Outlets',source:sources.study,detail:'Electrical outlets documented at table seating. Exact seats and availability vary.'})),
  {id:'r-print',name:'ONEcard printers',building:'rutherford',floor:'Rutherford North · consult service desk',category:'Printers',source:sources.study,detail:'The directory lists four ONEcard printers in Rutherford North.'},
  {id:'c-pc',name:'Computer workstations',building:'cameron',floor:'Multiple floors',category:'Computers',source:sources.cameron,detail:'Available on a first-come, first-served basis.'},
  {id:'cab-heat',name:'CAB basement microwaves',building:'cab',floor:'Basement',category:'Microwaves',source:sources.microwaves,detail:'UASU announced four microwaves in the basement. Current availability may vary.'},
  {id:'infolink-heat',name:'InfoLink microwave',building:'cameron',floor:'CAB–Cameron connection',category:'Microwaves',source:sources.microwaves,detail:'UASU announced a microwave at the InfoLink desk between CAB and Cameron. Current availability may vary.'},
  {id:'sub-water',name:'SUB water bottle refill stations',building:'sub',floor:'Consult building signage',category:'Water',source:sources.water,detail:'The Students’ Union documented refill stations in SUB. Current floor and service status are unconfirmed.'},
  {id:'sub-food',name:'SUB dining and convenience store',building:'sub',floor:'Consult building directory',category:'Food',source:sources.food,detail:'The Students’ Union lists food vendors and convenience options in SUB. Use its directory for current vendors.'},
  ...['Water','Washrooms','Accessible washrooms','Elevators','Stairs','Microwaves','Food','Entrances','Indoor connections'].map((category,index)=>({id:'demo-'+index,name:({Water:'Refill station',Washrooms:'Washrooms','Accessible washrooms':'Accessible washroom',Elevators:'Elevator',Stairs:'Stairs',Microwaves:'Microwave',Food:'Food counter',Entrances:'Main entrance','Indoor connections':'Connecting corridor'} as Record<string,string>)[category],building:'ccis',floor:'Demo floor 1',category,detail:'Example facility in the indoor demonstration. Check the official campus map for actual locations.',sample:true})),
];
export type CampusEvent = {id:string;title:string;date:string;start:string;end:string;location:string;building:string;organizer:string;description:string;source?:string;timeTbd?:boolean};
export const events:CampusEvent[] = [
  {id:'wiser',title:'WiSER Annual Industry Mixer',date:'2026-11-14',start:'2026-11-14T17:30:00-07:00',end:'2026-11-14T20:00:00-07:00',location:'ECERF E2-100 Solarium',building:'etlc',organizer:'Women in Science, Engineering & Research',description:'Meet STEM professionals, get resume feedback, and network.',source:'https://www.eventbrite.ca/e/wiser-annual-industry-mixer-november-2026-attendee-registration-tickets-1999114265583',timeTbd:false},
  {id:'hacked',title:'HackED Beta',date:'2026-11-14',start:'2026-11-13T11:00:00-07:00',end:'2026-11-15T16:00:00-07:00',location:'University Commons',building:'commons',organizer:'University of Alberta Computer Engineering Club',description:'HackED Beta runs November 13–15, 2026. This date is within the event weekend. Check the official schedule for your session.',source:sources.hacked,timeTbd:true},
  {id:'psc-mason',title:'Decorate Mason Jars with the PSC',date:'2026-11-16',start:'2026-11-16T12:00:00-07:00',end:'2026-11-16T12:00:00-07:00',location:'See UASU listing',building:'sub',organizer:'UASU Peer Support Centre',description:'Community creative activity listed on the Students\' Union calendar.',source:'https://www.su.ualberta.ca/events/',timeTbd:true},
  {id:'music-voice',title:'Voice Masterclass — Judith Forst',date:'2026-11-18',start:'2026-11-18T16:00:00-07:00',end:'2026-11-18T16:00:00-07:00',location:'FAB 1-29',building:'fab',organizer:'University of Alberta Department of Music',description:'Masterclass with Judith Forst.',source:'https://www.ualberta.ca/en/music/concert-listings/index.html',timeTbd:true},
  {id:'uasu-movie',title:'UASU Movie Night',date:'2026-11-18',start:'2026-11-18T12:00:00-07:00',end:'2026-11-18T12:00:00-07:00',location:'See UASU listing',building:'sub',organizer:'UASU Events',description:'Movie night listed on the Students\' Union events calendar.',source:'https://www.su.ualberta.ca/events/',timeTbd:true},
  {id:'trivia-dating',title:'Trivia Night: Dating Shows',date:'2026-11-18',start:'2026-11-18T12:00:00-07:00',end:'2026-11-18T12:00:00-07:00',location:'See UASU listing',building:'sub',organizer:'UASU Events',description:'Campus trivia night; see organizer listing for venue and start time.',source:'https://www.su.ualberta.ca/events/',timeTbd:true},
  {id:'music-define',title:'Define: Technician',date:'2026-11-19',start:'2026-11-19T16:00:00-07:00',end:'2026-11-19T16:00:00-07:00',location:'FAB 2-7',building:'fab',organizer:'University of Alberta Department of Music',description:'QAM with Russell Baker and Patrick Strain.',source:'https://www.ualberta.ca/en/music/concert-listings/index.html',timeTbd:true},
  {id:'uasu-karaoke-19',title:'UASU Karaoke Night',date:'2026-11-19',start:'2026-11-19T12:00:00-07:00',end:'2026-11-19T12:00:00-07:00',location:'See UASU listing',building:'sub',organizer:'UASU Events',description:'Karaoke night listed on the Students\' Union calendar.',source:'https://www.su.ualberta.ca/events/',timeTbd:true},
  {id:'thrift-19',title:'SUBsprout Thrift Store',date:'2026-11-19',start:'2026-11-19T12:00:00-07:00',end:'2026-11-19T12:00:00-07:00',location:'Students’ Union Building',building:'sub',organizer:'Sustain SU',description:'SUBsprout thrift event; check the Students\' Union listing for details.',source:'https://www.su.ualberta.ca/events/',timeTbd:true},
  {id:'music-opera',title:'Money Makes the World Go Round',date:'2026-11-21',start:'2026-11-21T19:30:00-07:00',end:'2026-11-21T19:30:00-07:00',location:'Westbury Theatre',building:'fab',organizer:'University of Alberta Opera Theatre',description:'University of Alberta Opera Theatre performance.',source:'https://www.ualberta.ca/en/music/concert-listings/index.html',timeTbd:true},
  {id:'trumpet',title:'Trumpet Masterclass — Manon Lafrance',date:'2026-11-24',start:'2026-11-24T14:30:00-07:00',end:'2026-11-24T16:30:00-07:00',location:'Studio A, Winspear Centre',building:'fab',organizer:'University of Alberta Department of Music',description:'Trumpet masterclass with Manon Lafrance.',source:'https://www.ualberta.ca/en/music/concert-listings/index.html',timeTbd:false},
  {id:'trivia-hp',title:'Trivia Night: Harry Potter',date:'2026-11-25',start:'2026-11-25T12:00:00-07:00',end:'2026-11-25T12:00:00-07:00',location:'See UASU listing',building:'sub',organizer:'UASU Events',description:'Harry Potter trivia night listed on the Students\' Union calendar.',source:'https://www.su.ualberta.ca/events/',timeTbd:true},
  {id:'thrift-25',title:'SUBsprout Thrift Store',date:'2026-11-25',start:'2026-11-25T12:00:00-07:00',end:'2026-11-25T12:00:00-07:00',location:'Students’ Union Building',building:'sub',organizer:'Sustain SU',description:'SUBsprout thrift event; see the official calendar.',source:'https://www.su.ualberta.ca/events/',timeTbd:true},
  {id:'press-book',title:'Shifting Sands — Edmonton Book Launch',date:'2026-11-26',start:'2026-11-26T16:00:00-07:00',end:'2026-11-26T16:00:00-07:00',location:'Tory Building 12-15',building:'tory',organizer:'University of Alberta Press',description:'Book launch with Feo Snagovsky and Jared Wesley.',source:'https://ualbertapress.ca/events/',timeTbd:true},
  {id:'uasu-karaoke-26',title:'UASU Karaoke Night',date:'2026-11-26',start:'2026-11-26T12:00:00-07:00',end:'2026-11-26T12:00:00-07:00',location:'See UASU listing',building:'sub',organizer:'UASU Events',description:'Karaoke night listed on the Students\' Union calendar.',source:'https://www.su.ualberta.ca/events/',timeTbd:true},
  {id:'campuscup',title:'Campus Cup — Dodgeball Tournament',date:'2026-11-27',start:'2026-11-27T12:00:00-07:00',end:'2026-11-27T12:00:00-07:00',location:'See UASU listing',building:'vvc',organizer:'UASU Events',description:'Campus-wide dodgeball tournament, November 27–29.',source:'https://su.ualberta.ca/these-are-your-resources/this-is-your-time-off/uasuevents/campus-cup/',timeTbd:true},
  {id:'music-love',title:'The Love We Carry — Concert Choir',date:'2026-11-28',start:'2026-11-28T19:30:00-07:00',end:'2026-11-28T19:30:00-07:00',location:'All Saints’ Anglican Cathedral',building:'fab',organizer:'University of Alberta Department of Music',description:'Concert Choir and Madrigal Singers performance.',source:'https://www.ualberta.ca/en/music/concert-listings/index.html',timeTbd:true},
];
export const photo = (id:string) => import.meta.env.BASE_URL+'img/'+id+(id.startsWith('study-interior-')?'.webp':'.jpg');
