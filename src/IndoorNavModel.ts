/** ChatUAB indoor WAYFINDING PREVIEW.
 * Room names and designated study zones come from the app's campus records.
 * Graph geometry is an illustrative schematic, NOT a surveyed floor plan.
 * Distances here are pixels and must never be reported as physical metres.
 */
export type BuildingId = 'ccis'|'cameron'|'rutherford'|'sperber';
export type IndoorPoint = {id:string; floor:string; x:number; y:number; label:string; kind:'junction'|'entrance'|'destination'|'core'; public:boolean};
export type IndoorLink = {from:string;to:string;kind:'corridor'|'floor'};
export type IndoorPlace = {name:string;floor:string;zone:'classroom'|'study'|'library'|'service'|'entrance';attach:'westTop'|'westMid'|'eastTop'|'eastMid'|'north'|'south';description?:string};
export type IndoorBuilding = {id:BuildingId;name:string;short:string;floors:string[];levelName:Record<string,string>;places:IndoorPlace[];note:string};
export type IndoorGraph = {building:IndoorBuilding;points:IndoorPoint[];links:IndoorLink[]};
export type RouteResult = {ids:string[];links:IndoorLink[];floors:string[]}|null;

export const indoorBuildings:IndoorBuilding[]=[
 {id:'ccis',name:'Centennial Centre for Interdisciplinary Science',short:'CCIS',floors:['L2','L1','1','2'],levelName:{L2:'Lower Level 2',L1:'Lower Level 1','1':'Level 1','2':'Level 2'},note:'CCIS room codes come from the campus classroom list. Room positions and corridors are illustrative, not verified.' ,places:[
 {name:'CCIS 1-140',floor:'1',zone:'classroom',attach:'westTop'},
 {name:'CCIS 1-160',floor:'1',zone:'classroom',attach:'eastTop'},
 {name:'CCIS 1-430',floor:'1',zone:'classroom',attach:'westMid'},
 {name:'CCIS 1-440',floor:'1',zone:'classroom',attach:'eastMid'},
 {name:'CCIS L1-140',floor:'L1',zone:'classroom',attach:'westTop'},
 {name:'CCIS L1-160',floor:'L1',zone:'classroom',attach:'eastMid'},
 {name:'CCIS L2-190',floor:'L2',zone:'classroom',attach:'westMid'},
 {name:'CCIS L2-200',floor:'L2',zone:'classroom',attach:'eastTop'},
 {name:'Level 2 corridor',floor:'2',zone:'service',attach:'eastTop'}
 ]},
 {id:'cameron',name:'Cameron Library',short:'Cameron',floors:['B','1','2','3'],levelName:{B:'Basement','1':'Main Floor','2':'Second Floor','3':'Third Floor'},note:'Noise-zone floors are taken from the U of A study-area directory. Route geometry is a schematic preview, not an official floor plan.',places:[
 {name:'Knowledge Common · Quiet',floor:'B',zone:'study',attach:'westTop'},
 {name:'Study Hall · Quiet',floor:'B',zone:'study',attach:'eastMid'},
 {name:'Bookable study rooms',floor:'B',zone:'study',attach:'eastTop'},
 {name:'Main floor · Discussion',floor:'1',zone:'study',attach:'westTop'},
 {name:'Main floor group area',floor:'1',zone:'study',attach:'eastMid'},
 {name:'Second-floor common area',floor:'2',zone:'study',attach:'westTop'},
 {name:'Third-floor silent zone',floor:'3',zone:'study',attach:'eastTop'}
 ]},
 {id:'rutherford',name:'Rutherford North Library',short:'Rutherford North',floors:['1','2','3','4','5'],levelName:{'1':'Main Floor','2':'Second Floor','3':'Third Floor','4':'Fourth Floor','5':'Fifth Floor'},note:'Floor noise-zone categories are published by U of A Library. These drawn room locations are schematic only.',places:[
 {name:'Main floor · Discussion',floor:'1',zone:'study',attach:'westTop'},
 {name:'Second floor · Discussion',floor:'2',zone:'study',attach:'eastTop'},
 {name:'Third floor · Quiet',floor:'3',zone:'study',attach:'westTop'},
 {name:'Silent Room 3-112',floor:'3',zone:'study',attach:'eastMid'},
 {name:'Fourth floor · Discussion',floor:'4',zone:'study',attach:'westTop'},
 {name:'Fifth floor · Silent',floor:'5',zone:'study',attach:'eastTop'}
 ]},
 {id:'sperber',name:'Geoffrey + Robyn Sperber Library',short:'Sperber',floors:['L','1'],levelName:{L:'Lower Level','1':'Level 1'},note:'U of A publishes these floor noise zones. Schematic route geometry does not indicate surveyed door or stair positions.',places:[
 {name:'Lower level · Quiet near stairs',floor:'L',zone:'study',attach:'westTop'},
 {name:'Lower level · Silent study',floor:'L',zone:'study',attach:'eastMid'},
 {name:'Level 1 · Discussion',floor:'1',zone:'study',attach:'westTop'}
 ]}
];
export const isIndoorBuilding=(id:string):id is BuildingId=>indoorBuildings.some(b=>b.id===id);
export const getIndoorBuilding=(id:string)=>indoorBuildings.find(b=>b.id===id)??indoorBuildings[0];
const junctions={entry:[350,610],south:[350,530],middle:[350,398],north:[350,264],top:[350,154],westTop:[234,264],eastTop:[470,264],westMid:[234,398],eastMid:[470,398]} as const;
const localLinks:[keyof typeof junctions,keyof typeof junctions][]=[['entry','south'],['south','middle'],['middle','north'],['north','top'],['north','westTop'],['north','eastTop'],['middle','westMid'],['middle','eastMid'],['westTop','westMid'],['eastTop','eastMid']];
const positionOf={westTop:[151,243],westMid:[150,418],eastTop:[556,244],eastMid:[552,418],north:[350,102],south:[350,565]} as const;
export const pointKey=(floor:string,key:string)=>`${floor}:${key}`;
export function makeIndoorGraph(id:string):IndoorGraph{
 const building=getIndoorBuilding(id);
 const points:IndoorPoint[]=[],links:IndoorLink[]=[];
 for(const floor of building.floors){
  for(const [name,coord] of Object.entries(junctions))points.push({id:pointKey(floor,name),floor,x:coord[0],y:coord[1],label:name==='entry'?'Entry / floor arrival':name==='middle'?'Floor circulation core':name,kind:name==='entry'?'entrance':name==='middle'?'core':'junction',public:name==='entry'||name==='middle'});
  for(const [a,b] of localLinks)links.push({from:pointKey(floor,a),to:pointKey(floor,b),kind:'corridor'});
  for(const [index,place] of building.places.entries())if(place.floor===floor){
   const xy=positionOf[place.attach],placeId=pointKey(floor,`place${index}`);
   points.push({id:placeId,floor,x:xy[0],y:xy[1],label:place.name,kind:'destination',public:true});
   links.push({from:placeId,to:pointKey(floor,place.attach),kind:'corridor'});
  }
 }
 for(let i=0;i<building.floors.length-1;i++)links.push({from:pointKey(building.floors[i],'middle'),to:pointKey(building.floors[i+1],'middle'),kind:'floor'});
 return {building,points,links};
}
export function solveIndoorRoute(graph:IndoorGraph,fromId:string,toId:string):RouteResult{
 const nodes=new Map(graph.points.map(p=>[p.id,p]));if(!nodes.has(fromId)||!nodes.has(toId))return null;
 if(fromId===toId)return {ids:[fromId],links:[],floors:[nodes.get(fromId)!.floor]};
 const dist=new Map<string,number>([[fromId,0]]),prev=new Map<string,{id:string,edge:IndoorLink}>(),unvisited=new Set(nodes.keys());
 const adj=new Map<string,IndoorLink[]>();for(const link of graph.links){adj.set(link.from,[...(adj.get(link.from)??[]),link]);adj.set(link.to,[...(adj.get(link.to)??[]),link]);}
 while(unvisited.size){
  let current:string|undefined,score=Infinity;
  for(const id of unvisited){const d=dist.get(id)??Infinity;if(d<score){score=d;current=id;}}
  if(!current||!isFinite(score))break;if(current===toId)break;unvisited.delete(current);
  const p=nodes.get(current)!;
  for(const link of adj.get(current)??[]){const next=link.from===current?link.to:link.from;if(!unvisited.has(next))continue;const q=nodes.get(next)!;
   const weight=link.kind==='floor'?190:Math.hypot(p.x-q.x,p.y-q.y);const total=score+weight;
   if(total<(dist.get(next)??Infinity)){dist.set(next,total);prev.set(next,{id:current,edge:link});}
  }
 }
 if(!prev.has(toId))return null;
 const ids=[toId],routeLinks:IndoorLink[]=[];let cursor=toId;
 while(cursor!==fromId){const step=prev.get(cursor);if(!step)return null;routeLinks.unshift(step.edge);ids.unshift(step.id);cursor=step.id;}
 return {ids,links:routeLinks,floors:[...new Set(ids.map(nodeId=>nodes.get(nodeId)!.floor))]};
}
export const routeOnFloor=(graph:IndoorGraph,route:RouteResult,floor:string)=>{
 if(!route)return [] as string[][];
 const pieces:string[][]=[];let current:string[]=[];
 for(const id of route.ids){if(graph.points.find(p=>p.id===id)?.floor===floor)current.push(id);else{if(current.length)pieces.push(current);current=[];}}
 if(current.length)pieces.push(current);
 return pieces;
};
export function indoorInstruction(graph:IndoorGraph,route:NonNullable<RouteResult>,step:number):string{
 const points=new Map(graph.points.map(p=>[p.id,p]));const here=points.get(route.ids[step])!;
 if(step>=route.ids.length-1)return `Arrive at ${points.get(route.ids[route.ids.length-1])!.label}`;
 const next=points.get(route.ids[step+1])!;
 if(here.floor!==next.floor)return `Switch to ${graph.building.levelName[next.floor]??next.floor} at the schematic circulation core`;
 if(step===0)return `Start at ${here.label}`;
 if(step+2<route.ids.length){const future=points.get(route.ids[step+2])!;
  if(future.floor===next.floor){const ax=next.x-here.x,ay=next.y-here.y,bx=future.x-next.x,by=future.y-next.y;
   const cross=ax*by-ay*bx,denom=Math.hypot(ax,ay)*Math.hypot(bx,by);
   if(denom>0&&Math.abs(cross/denom)>.28)return `Follow the illustrated corridor, then turn ${cross>0?'right':'left'}`;
  }
 }
 return `Continue through the illustrated ${graph.building.levelName[here.floor]??here.floor} corridor`;
}
