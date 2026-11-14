/** University Commons wayfinding prototype.
 * Venue and room-floor facts are grounded in public U of A sources.
 * All SVG geometry, room placement and inter-floor connector locations are ILLUSTRATIVE.
 * This does not encode a surveyed floor plan or certified accessible routes.
 */
export type UCommKind = 'service'|'study'|'classroom'|'facility';
export type UCommNode = {id:string;floor:string;x:number;y:number;label:string;kind:'path'|'entrance'|'core'|'destination'};
export type UCommEdge = {a:string;b:string;kind:'walk'|'level'};
export type UCommPlace = {id:string;label:string;floor:string;kind:UCommKind;room?:string;description:string;source:'ualberta-tour'|'mss-guide'|'ualberta-syllabus'|'uofa-event'|'ssc-official'|'infolink-official'|'cs-rooms';anchor:string;x:number;y:number;access?:string};
export type UCommGraph = {nodes:UCommNode[];edges:UCommEdge[]};
export type UCommRoute = {ids:string[];floors:string[];edges:UCommEdge[]}|null;
export const UCOMM_FLOORS=['1','2','3','4'] as const;
export const UCOMM_SOURCES={
 'ualberta-tour':'https://www.ualberta.ca/en/youalberta/2025/10/new-study-spots-and-student-services-your-guide-to-the-revitalized-university-commons.html',
 'mss-guide':'https://www.ualberta.ca/en/mathematical-and-statistical-sciences/intranet/mss-administration--operations-reference-guide_2021-september-22.pdf',
 'ualberta-syllabus':'https://sites.ualberta.ca/~amw8/Fall%202025%20INT-D%20161%20%28Section%20A1%29%20syllabus.pdf',
 'uofa-event':'https://www.ualberta.ca/en/sustainability/events/sdg-month.html',
 'ssc-official':'https://www.ualberta.ca/en/services/student-service-centre/index.html',
 'infolink-official':'https://webadmin.su.ualberta.ca/these-are-your-resources/these-are-your-learning-supports/infolink/',
 'cs-rooms':'https://cloudfront.ualberta.ca/en/computing-science/resources/labs-and-room-booking/index.html'
} as const;

/** Place coordinates are deliberately PROTOTYPE positions—not claimed real door locations. */
export const UCOMM_PLACES:UCommPlace[]=[
 {id:'quiet-1090',label:'Quiet Study Space',floor:'1',kind:'study',room:'1-090',description:'A designated quiet-study space listed in the departmental University Commons guide. A U of A planning brief describes the quiet-study area on the northeast edge of the main floor.',source:'mss-guide',anchor:'eastNorth',x:582,y:207},
 {id:'tour-1330',label:'Tour / teaching room',floor:'1',kind:'classroom',room:'1-330',description:'U of A event listings identify 1-330 as a tour room used for lectures.',source:'uofa-event',anchor:'westNorth',x:120,y:208},
 {id:'office-1180',label:'Academic support office',floor:'1',kind:'service',room:'1-180',description:'Departmental guide lists the ATS/GTA-PI office here; not a general classroom.',source:'mss-guide',anchor:'eastSouth',x:583,y:488,access:'Office; confirm opening hours'},
 {id:'atrium',label:'Atrium gathering area',floor:'1',kind:'study',description:'Public atrium with seating and informal study spots; no occupancy data.',source:'ualberta-tour',anchor:'atrSouth',x:350,y:496},
 {id:'infolink',label:'UASU InfoLink',floor:'1',kind:'service',description:'Student information and peer advising service, listed in University Commons by UASU.',source:'infolink-official',anchor:'eastMid',x:581,y:358},
 {id:'ssc',label:'Student Service Centre',floor:'2',kind:'service',room:'2-180',description:'Official U of A student advising and service centre. Room 2-180 on Level 2.',source:'ssc-official',anchor:'eastMid',x:578,y:358},
 {id:'class-2001',label:'Teaching room',floor:'2',kind:'classroom',room:'2-001',description:'A U of A 2025 course syllabus identifies 2-001 as a lecture room.',source:'ualberta-syllabus',anchor:'westNorth',x:120,y:208},
 {id:'breakout-2040',label:'Computing Science breakout',floor:'2',kind:'classroom',room:'2-040',description:'Computing Science lists a two-person UCOMM breakout room; check booking and access.',source:'cs-rooms',anchor:'westMid',x:119,y:359,access:'May require a booking or departmental access'},
 {id:'wellness-2300',label:'Wellness Room',floor:'2',kind:'service',room:'2-300',description:'Listed as a wellness room managed by the Dean of Students.',source:'mss-guide',anchor:'eastSouth',x:583,y:488,access:'Access subject to local rules'},
 {id:'multi-2350',label:'Multipurpose room',floor:'2',kind:'classroom',room:'2-350',description:'Public U of A departmental guide lists a multipurpose room.',source:'mss-guide',anchor:'westSouth',x:120,y:492},
 {id:'multi-2450',label:'Multipurpose room',floor:'2',kind:'classroom',room:'2-450',description:'Public U of A departmental guide lists a multipurpose room.',source:'mss-guide',anchor:'eastNorth',x:583,y:208},
 {id:'reading-3400',label:'McCullough Reading Room',floor:'3',kind:'study',room:'3-400',description:'Historic restored reading room on the third floor.',source:'ualberta-tour',anchor:'westNorth',x:120,y:208},
 {id:'breakout-3002',label:'Computing Science breakout',floor:'3',kind:'classroom',room:'3-002',description:'Computing Science lists a one-person UCOMM breakout room; check booking and access.',source:'cs-rooms',anchor:'westSouth',x:119,y:495,access:'May require a booking or departmental access'},
 {id:'multi-3160',label:'Round multipurpose room',floor:'3',kind:'classroom',room:'3-160',description:'Round multipurpose room listed in the departmental guide.',source:'mss-guide',anchor:'eastMid',x:583,y:358},
 {id:'meeting-3161',label:'Meeting room',floor:'3',kind:'classroom',room:'3-161',description:'Meeting room associated with the round multipurpose room.',source:'mss-guide',anchor:'eastSouth',x:583,y:488,access:'May require booking'},
 {id:'cupola',label:'Historic Cupola View',floor:'4',kind:'study',description:'The inside of the original building’s cupola can be seen from the fourth-floor corridor.',source:'ualberta-tour',anchor:'westNorth',x:120,y:208},
 {id:'meeting-4400',label:'Meeting room',floor:'4',kind:'classroom',room:'4-400',description:'Departmental shared-space listing; access/booking must be checked.',source:'mss-guide',anchor:'westSouth',x:120,y:492,access:'Booking/access not confirmed'},
 {id:'meeting-4440',label:'Meeting room',floor:'4',kind:'classroom',room:'4-440',description:'Departmental shared-space listing; access/booking must be checked.',source:'mss-guide',anchor:'eastNorth',x:583,y:208,access:'Booking/access not confirmed'}
];
export const UCOMM_WAYPOINTS={
 entry:{x:350,y:630,label:'Illustrated main arrival'},
 atrSouth:{x:350,y:496,label:'Atrium circulation'},
 atrMid:{x:350,y:358,label:'Central atrium'},
 lift:{x:350,y:292,label:'Illustrated level connection'},
 westMid:{x:177,y:358,label:'Historic wing corridor'},
 westNorth:{x:177,y:208,label:'Historic wing corridor'},
 westSouth:{x:177,y:492,label:'Historic wing corridor'},
 eastMid:{x:529,y:358,label:'New wing corridor'},
 eastNorth:{x:529,y:208,label:'New wing corridor'},
 eastSouth:{x:529,y:488,label:'New wing corridor'}
} as const;
const W=UCOMM_WAYPOINTS;
const walkwayPairs:[keyof typeof W,keyof typeof W][]=[['entry','atrSouth'],['atrSouth','atrMid'],['atrMid','lift'],['atrMid','westMid'],['westMid','westNorth'],['westMid','westSouth'],['atrMid','eastMid'],['eastMid','eastNorth'],['eastMid','eastSouth']];
export const ucommKey=(floor:string,part:string)=>`${floor}:${part}`;
export function buildUCommGraph():UCommGraph{
 const nodes:UCommNode[]=[],edges:UCommEdge[]=[];
 for(const floor of UCOMM_FLOORS){
  for(const [key,p] of Object.entries(W))nodes.push({id:ucommKey(floor,key),floor,x:p.x,y:p.y,label:p.label,kind:key==='entry'?'entrance':key==='lift'?'core':'path'});
  for(const [a,b] of walkwayPairs)edges.push({a:ucommKey(floor,a),b:ucommKey(floor,b),kind:'walk'});
  for(const poi of UCOMM_PLACES.filter(p=>p.floor===floor)){
   nodes.push({id:ucommKey(floor,poi.id),floor,x:poi.x,y:poi.y,label:`${poi.label}${poi.room?` · ${poi.room}`:''}`,kind:'destination'});
   edges.push({a:ucommKey(floor,poi.anchor),b:ucommKey(floor,poi.id),kind:'walk'});
  }
 }
 for(let i=0;i<UCOMM_FLOORS.length-1;i++)edges.push({a:ucommKey(UCOMM_FLOORS[i],'lift'),b:ucommKey(UCOMM_FLOORS[i+1],'lift'),kind:'level'});
 return {nodes,edges};
}
/** Dijkstra for an explicitly connected conceptual graph; route lengths are not metres. */
export function routeUComm(graph:UCommGraph,origin:string,target:string):UCommRoute{
 const points=new Map(graph.nodes.map(n=>[n.id,n]));if(!points.has(origin)||!points.has(target))return null;
 if(origin===target)return {ids:[origin],floors:[points.get(origin)!.floor],edges:[]};
 const distances=new Map<string,number>([[origin,0]]),previous=new Map<string,{id:string;edge:UCommEdge}>(),pending=new Set(points.keys());
 const adjacency=new Map<string,UCommEdge[]>();
 for(const edge of graph.edges){adjacency.set(edge.a,[...(adjacency.get(edge.a)??[]),edge]);adjacency.set(edge.b,[...(adjacency.get(edge.b)??[]),edge]);}
 while(pending.size){let current:string|undefined,score=Infinity;
  for(const id of pending){const d=distances.get(id)??Infinity;if(d<score){score=d;current=id;}}
  if(!current||!Number.isFinite(score))break;if(current===target)break;pending.delete(current);
  for(const edge of adjacency.get(current)??[]){const next=edge.a===current?edge.b:edge.a;if(!pending.has(next))continue;
   const p=points.get(current)!,q=points.get(next)!;
   const weight=edge.kind==='level'?240:Math.hypot(p.x-q.x,p.y-q.y);
   if(score+weight<(distances.get(next)??Infinity)){distances.set(next,score+weight);previous.set(next,{id:current,edge});}
  }
 }
 if(!previous.has(target))return null;
 const ids=[target],edges:UCommEdge[]=[];let cursor=target;
 while(cursor!==origin){const prev=previous.get(cursor);if(!prev)return null;ids.unshift(prev.id);edges.unshift(prev.edge);cursor=prev.id;}
 return {ids,edges,floors:[...new Set(ids.map(id=>points.get(id)!.floor))]};
}
export function ucommSegments(graph:UCommGraph,route:UCommRoute,floor:string):UCommNode[][]{
 if(!route)return [];const nodes=new Map(graph.nodes.map(n=>[n.id,n]));const parts:UCommNode[][]=[];let working:UCommNode[]=[];
 for(const id of route.ids){const n=nodes.get(id);if(n?.floor===floor)working.push(n);else if(working.length){parts.push(working);working=[];}}
 if(working.length)parts.push(working);return parts;
}
export function ucommStepText(graph:UCommGraph,route:NonNullable<UCommRoute>,step:number):string{
 const points=new Map(graph.nodes.map(n=>[n.id,n]));const current=points.get(route.ids[step])!;
 if(step===route.ids.length-1)return `Arrive at ${current.label}`;
 const next=points.get(route.ids[step+1])!;
 if(current.floor!==next.floor)return `Switch to Floor ${next.floor} at the illustrated level connection`;
 if(next.kind==='destination')return `Approach ${next.label} (pin placement illustrative)`;
 if(current.kind==='entrance')return 'Begin at the illustrated building arrival point';
 const previous=points.get(route.ids[Math.max(0,step-1)])!;
 if(previous.floor===current.floor){const a={x:current.x-previous.x,y:current.y-previous.y},b={x:next.x-current.x,y:next.y-current.y};const cross=a.x*b.y-a.y*b.x,mag=Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y);
  if(mag>0&&Math.abs(cross/mag)>.3)return `Follow diagram, then turn ${cross>0?'right':'left'} at the next illustrated junction`;
 }
 return `Follow the illustrated Floor ${current.floor} corridor`;
}
