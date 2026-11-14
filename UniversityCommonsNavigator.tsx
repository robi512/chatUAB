import {useEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {
 ArrowLeft,ArrowRight,Armchair,BookOpen,Building2,Camera,ChevronDown,ChevronRight,
 Compass,ExternalLink,GraduationCap,Info,Layers3,LocateFixed,MapPin,Minus,
 Navigation,Plus,RotateCcw,Search,Target,X
} from 'lucide-react';
import {
 buildUCommGraph,routeUComm,ucommKey,ucommSegments,UCOMM_FLOORS,UCOMM_PLACES,UCOMM_SOURCES,
 type UCommKind,type UCommNode
} from './UniversityCommonsModel';
import {cameraForNode,clampCamera,roundedRoute,routeMoments,type MapCamera} from './UCommMotion';
import {UCommCameraPreview} from './UCommCameraPreview';
import UniversityCommonsArchitecture from './UniversityCommonsArchitecture';
import {ServiceArt} from './ServiceArt';
import {photo} from './data';
import './university-commons.css';

type Props={onOtherBuildings?:()=>void;onExit?:()=>void;initialQuery?:string};
type Wing='both'|'heritage'|'modern';
type Phase='idle'|'destination'|'overview'|'trace'|'return'|'guiding';
type Filter='all'|'study'|'service'|'classroom';
const kindLabel:Record<UCommKind,string>={study:'Study space',service:'Student service',classroom:'Room / classroom',facility:'Campus facility'};
const routeFind=(graph:ReturnType<typeof buildUCommGraph>,id:string)=>graph.nodes.find(n=>n.id===id);
const pinColor=(kind:UCommKind)=>kind==='study'?'#175b42':kind==='service'?'#476b7b':'#597c74';
const choices:{value:Filter;name:string}[]=[{value:'all',name:'All'},{value:'study',name:'Study'},{value:'service',name:'Services'},{value:'classroom',name:'Rooms'}];

function markerText(node:UCommNode){
 const label=node.id.split(':')[1];
 if(label==='entry')return 'Main arrival';
 if(label==='atrMid')return 'Central atrium';
 if(label==='atrSouth')return 'Atrium south';
 if(label==='lift')return 'Level connection';
 if(label==='westNorth')return 'Historic · north';
 if(label==='westMid')return 'Historic · centre';
 if(label==='westSouth')return 'Historic · south';
 if(label==='eastNorth')return 'New wing · north';
 if(label==='eastMid')return 'New wing · centre';
 return 'New wing · south';
}
function instruction(graph:ReturnType<typeof buildUCommGraph>,ids:string[],index:number,destName:string){
 const here=routeFind(graph,ids[index]);if(!here)return 'Follow the highlighted route';
 if(index===ids.length-1)return `Arrive at ${destName}`;
 const next=routeFind(graph,ids[index+1]);if(!next)return 'Follow the highlighted route';
 if(next.floor!==here.floor)return `Continue to Floor ${next.floor}`;
 if(index===0)return 'Begin at your selected location';
 if(next.kind==='destination')return `Approach ${destName}`;
 const prev=routeFind(graph,ids[index-1]);
 if(prev?.floor===here.floor){
  const ax=here.x-prev.x,ay=here.y-prev.y,bx=next.x-here.x,by=next.y-here.y;
  const mag=Math.hypot(ax,ay)*Math.hypot(bx,by),cross=ax*by-ay*bx;
  if(mag>0&&Math.abs(cross/mag)>.28)return `Turn ${cross>0?'right':'left'} at this junction`;
 }
 return 'Continue along the highlighted path';
}
function directionIcon(text:string){
 if(text.includes('right'))return '↱';
 if(text.includes('left'))return '↰';
 if(text.includes('Floor'))return '↥';
 if(text.startsWith('Arrive'))return '●';
 return '↑';
}

export function UniversityCommonsNavigator({onOtherBuildings,onExit,initialQuery=''}:Props){
 const graph=useMemo(buildUCommGraph,[]);
 const [floor,setFloor]=useState('1');
 const floorCurrent=useRef('1');
 const [departingFloor,setDepartingFloor]=useState<string|null>(null);
 const floorTransitionTimer=useRef<number|null>(null);
 const [wing,setWing]=useState<Wing>('both');
 const [selected,setSelected]=useState('quiet-1090');
 const [origin,setOrigin]=useState(ucommKey('1','entry'));
 const [originChosen,setOriginChosen]=useState(false);
 const [chooseOrigin,setChooseOrigin]=useState(false);
 const [search,setSearch]=useState(initialQuery);
 const [showResults,setShowResults]=useState(false);
 const [filter,setFilter]=useState<Filter>('all');
 const [phase,setPhase]=useState<Phase>('idle');
 const [active,setActive]=useState(false);
 const [step,setStep]=useState(0);
 const [expanded,setExpanded]=useState(false);
 const [detailOpen,setDetailOpen]=useState(false);
 const [camera,setCamera]=useState<MapCamera>({zoom:1,panX:0,panY:0});
 const [dragging,setDragging]=useState(false);
 const [message,setMessage]=useState('');
 const [cameraPreviewOpen,setCameraPreviewOpen]=useState(false);
 const timers=useRef<number[]>([]);
 const pointers=useRef(new Map<number,{x:number;y:number}>());
 const gesture=useRef<{x:number;y:number;panX:number;panY:number;distance?:number;zoom:number}|null>(null);
 const destination=UCOMM_PLACES.find(p=>p.id===selected)??UCOMM_PLACES[0];
 const target=ucommKey(destination.floor,destination.id);
 const route=useMemo(()=>routeUComm(graph,origin,target),[graph,origin,target]);
 const routeVisible=active&&!!route;
 const currentStepNode=routeVisible&&route?routeFind(graph,route.ids[step]):undefined;
 const nextStepNode=routeVisible&&route?routeFind(graph,route.ids[Math.min(step+1,route.ids.length-1)]):undefined;
 const directionAngle=currentStepNode&&nextStepNode&&nextStepNode.floor===currentStepNode.floor
  ? Math.atan2(nextStepNode.y-currentStepNode.y,nextStepNode.x-currentStepNode.x)*180/Math.PI+90:0;
 const moments=useMemo(()=>route?routeMoments(graph,route):[],[graph,route]);
 const momentIndex=Math.max(0,moments.indexOf(step));
 const stageCount=route?Math.max(0,route.ids.length-1):0;
 const visibleSegments=routeVisible?ucommSegments(graph,route,floor):[];
 const source=UCOMM_SOURCES[destination.source];
 const floorPlaces=UCOMM_PLACES.filter(p=>p.floor===floor&&(filter==='all'||filter===p.kind));
 const matched=UCOMM_PLACES.filter(p=>!search||`${p.label} ${p.room??''} floor ${p.floor} ${p.description}`.toLowerCase().includes(search.toLowerCase())).slice(0,7);
 const originNode=routeFind(graph,origin);
 const startCandidates=graph.nodes.filter(n=>n.floor===floor&&(n.kind==='path'||n.kind==='entrance'||n.kind==='core'));

 const clearTimers=()=>{timers.current.forEach(t=>window.clearTimeout(t));timers.current=[];};
 const later=(ms:number,fn:()=>void)=>{timers.current.push(window.setTimeout(fn,ms));};
 useEffect(()=>()=>{timers.current.forEach(t=>window.clearTimeout(t));if(floorTransitionTimer.current!==null)window.clearTimeout(floorTransitionTimer.current);},[]);
 const endNavigation=()=>{clearTimers();setActive(false);setPhase('idle');setStep(0);setExpanded(false);setMessage('');};
 const recenter=()=>setCamera({zoom:1,panX:0,panY:0});
 const focusMap=(node:Pick<UCommNode,'x'|'y'>,zoom=1.08)=>setCamera(clampCamera(cameraForNode(node,zoom)));
 const showFloor=(f:string,focus?:UCommNode,scripted=false)=>{
  if(!scripted&&phase!=='idle'&&phase!=='guiding'){
   clearTimers();setPhase('guiding');
  }
  if(f!==floorCurrent.current){
   if(floorTransitionTimer.current!==null)window.clearTimeout(floorTransitionTimer.current);
   setDepartingFloor(floorCurrent.current);
   floorCurrent.current=f;
   setFloor(f);
   if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    floorTransitionTimer.current=window.setTimeout(()=>{setDepartingFloor(null);floorTransitionTimer.current=null;},440);
   }else setDepartingFloor(null);
  }
  // A floor switch alone must never teleport the map camera to another edge.
  if(focus)focusMap(focus,1.06);
 };
 const selectLocation=(id:string)=>{
  const p=UCOMM_PLACES.find(v=>v.id===id);if(!p)return;
  endNavigation();setSelected(id);setShowResults(false);setSearch('');showFloor(p.floor);
  focusMap({x:p.x,y:p.y},1.04);setMessage('');
 };
 const selectStartingPoint=(node:UCommNode)=>{
  clearTimers();setOrigin(node.id);setOriginChosen(true);setChooseOrigin(false);endNavigation();
  showFloor(node.floor);focusMap(node,1.05);setMessage('Starting point selected');
 };
 const begin=()=>{
  if(!originChosen){setChooseOrigin(true);setMessage('Choose a blue starting point on the map');showFloor('1');recenter();return;}
  if(!route){setMessage('No connected route found for those locations');return;}
  if(origin===target){setMessage('Choose a starting point away from your destination');return;}
  const start=routeFind(graph,origin),finish=routeFind(graph,target);
  if(!start||!finish)return;
  clearTimers();setMessage('');setChooseOrigin(false);setActive(true);setStep(0);setExpanded(false);
  // Reveal the destination first, show the route, then fly home to the chosen origin.
  showFloor(finish.floor,undefined,true);focusMap(finish,1.07);setPhase('destination');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){showFloor(start.floor,undefined,true);focusMap(start,1.05);setPhase('guiding');return;}
  later(820,()=>{setPhase('overview');setCamera(clampCamera({zoom:.96,panX:0,panY:0}));});
  later(1580,()=>{showFloor(start.floor,undefined,true);setCamera(clampCamera({zoom:.96,panX:0,panY:0}));setPhase('trace');});
  later(2780,()=>{setPhase('return');focusMap(start,1.06);});
  later(3600,()=>{setPhase('guiding');setExpanded(false);});
 };
 const openCameraPreview=()=>{
  // Keep the floor and route step stable while using the camera overlay.
  if(phase!=='idle'&&phase!=='guiding'){clearTimers();setPhase('guiding');}
  setCameraPreviewOpen(true);
 };
 const goToMoment=(index:number)=>{
  if(!route)return;
  clearTimers();setPhase('guiding');
  const chosen=Math.max(0,Math.min(moments.length-1,index));
  const nodeIndex=moments[chosen];setStep(nodeIndex);
  const p=routeFind(graph,route.ids[nodeIndex]);if(p){showFloor(p.floor,p,true);}
 };
 useEffect(()=>{
  if(!initialQuery)return;
  const p=UCOMM_PLACES.find(v=>`${v.label} ${v.room??''}`.toLowerCase().includes(initialQuery.toLowerCase()));
  if(p){setSelected(p.id);showFloor(p.floor,undefined,true);setSearch('');}
 },[initialQuery]);
 const pointerDown=(e:ReactPointerEvent<SVGSVGElement>)=>{
  if((e.target as Element).closest('[data-uc-pin],[data-uc-origin]'))return;
  // Direct user gestures always take control away from a scripted flyover.
  if(phase!=='idle'&&phase!=='guiding'){clearTimers();setPhase('guiding');}
  const points=pointers.current;points.set(e.pointerId,{x:e.clientX,y:e.clientY});setDragging(true);
  const vals=[...points.values()];
  if(vals.length===1)gesture.current={x:e.clientX,y:e.clientY,panX:camera.panX,panY:camera.panY,zoom:camera.zoom};
  if(vals.length===2)gesture.current={x:(vals[0].x+vals[1].x)/2,y:(vals[0].y+vals[1].y)/2,panX:camera.panX,panY:camera.panY,zoom:camera.zoom,distance:Math.hypot(vals[0].x-vals[1].x,vals[0].y-vals[1].y)};
  e.currentTarget.setPointerCapture(e.pointerId);
 };
 const pointerMove=(e:ReactPointerEvent<SVGSVGElement>)=>{
  if(!pointers.current.has(e.pointerId))return;
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const vals=[...pointers.current.values()],g=gesture.current;if(!g)return;
  const center=vals.length>1?{x:(vals[0].x+vals[1].x)/2,y:(vals[0].y+vals[1].y)/2}:vals[0];
  const rect=e.currentTarget.getBoundingClientRect();
  let nextZoom=g.zoom;
  if(vals.length>1&&g.distance)nextZoom=g.zoom*Math.hypot(vals[0].x-vals[1].x,vals[0].y-vals[1].y)/g.distance;
  if(rect.width<=0||rect.height<=0)return;
  setCamera(clampCamera({zoom:nextZoom,panX:g.panX+(center.x-g.x)*700/rect.width,panY:g.panY+(center.y-g.y)*720/rect.height}));
 };
 const pointerEnd=(e:ReactPointerEvent<SVGSVGElement>)=>{
  pointers.current.delete(e.pointerId);if(!pointers.current.size)setDragging(false);
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  // A pinch may end with one finger still on-screen. Rebase its drag origin
  // rather than snapping to the previous gesture's stale pointer centre.
  const remaining=[...pointers.current.values()];
  gesture.current=remaining.length===1?{
   x:remaining[0].x,y:remaining[0].y,panX:camera.panX,panY:camera.panY,zoom:camera.zoom,
  }:null;
 };
 return <div className="uc-app">
  <header className="uc-head">
   {onExit&&<button type="button" className="uc-exit" aria-label="Back to ChatUAB home" onClick={onExit}><ArrowLeft size={19}/></button>}
   <div className="uc-identity"><span className="uc-eyebrow">CHATUAB / INDOOR WAYFINDING</span><h1>University <em>Commons.</em></h1><p>Find your way, beautifully.</p></div>
   <span className="uc-photo"><img src={photo('commons')} alt="University Commons exterior"/></span>
  </header>

  <section className="uc-map-experience" aria-label="University Commons indoor navigation">
   <div className="uc-search-area">
    <div className="uc-search-box"><Search size={19}/><input aria-label="Search University Commons destinations" value={search} placeholder="Search rooms, quiet spaces..." onFocus={()=>setShowResults(true)} onChange={e=>{setSearch(e.target.value);setShowResults(true);}} onKeyDown={e=>{if(e.key==='Enter'&&matched[0])selectLocation(matched[0].id);if(e.key==='Escape')setShowResults(false);}}/><button type="button" aria-label={search?'Clear search':'Show destinations'} onClick={()=>{if(search){setSearch('');setShowResults(true);}else setShowResults(v=>!v);}}>{search?<X size={17}/>:<ChevronDown size={17}/>}</button></div>
    {showResults&&<div className="uc-results" role="listbox" aria-label="University Commons locations">
      {matched.length?matched.map(p=><button type="button" key={p.id} role="option" aria-selected={selected===p.id} onClick={()=>selectLocation(p.id)}><span className="uc-search-result-icon"><MapPin size={17}/></span><span><b>{p.label}</b><small>{p.room?`Room ${p.room}`:'University Commons'} · Floor {p.floor}</small></span><ChevronRight size={17}/></button>):<p>No matching destination in the current directory.</p>}
    </div>}
   </div>

   <div className={`uc-scene uc-phase-${phase}${chooseOrigin?' uc-choosing-start':''}${dragging?' uc-dragging':''}`}>
    <div className="uc-scene-lab"><span><i/> UNIVERSITY COMMONS</span><span>FLOOR {floor} · {wing==='both'?'ALL WINGS':wing==='heritage'?'HISTORIC':'NEW ADDITION'}</span></div>
    <div className={`uc-floor-transition-badge${departingFloor?' uc-floor-changing':''}`} aria-live="off" aria-hidden="true"><Layers3 size={13}/> F{floor}</div>
    <svg className="uc-plan" role="img" aria-label={`Interactive conceptual University Commons floor ${floor} plan, showing room selections and an illustrative route`} viewBox="0 0 700 720" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onWheel={e=>{e.preventDefault();setCamera(v=>clampCamera({...v,zoom:v.zoom+(e.deltaY<0?.06:-.06)}));}}>
     <g className="uc-camera" transform={`translate(${350+camera.panX} ${360+camera.panY}) scale(${camera.zoom}) translate(-350 -360)`}>
      {departingFloor&&<g className="uc-floor-outgoing" key={`outgoing-${departingFloor}`} aria-hidden="true"><UniversityCommonsArchitecture floor={departingFloor} wing={wing}/></g>}
      <g className={departingFloor?'uc-floor-incoming':'uc-floor-steady'} key={`incoming-${floor}`}><UniversityCommonsArchitecture floor={floor} wing={wing}/></g>
      {routeVisible&&visibleSegments.map((segment,i)=>segment.length>1&&<g key={`${origin}-${target}-${floor}-${i}`} className="uc-route-layer">
       <path d={roundedRoute(segment)} className="uc-route-casing"/>
       <path d={roundedRoute(segment)} className="uc-route-blue" pathLength="100"/>
       <path d={roundedRoute(segment)} className="uc-route-spark" pathLength="100"/>
       {segment.slice(1).map((n,k)=>{const before=segment[k],mid={x:(n.x+before.x)/2,y:(n.y+before.y)/2},angle=Math.atan2(n.y-before.y,n.x-before.x)*180/Math.PI;return <g key={k} transform={`translate(${mid.x} ${mid.y}) rotate(${angle})`} className="uc-route-chevron"><path d="M-8 -5L0 0 -8 5" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></g>;})}
      </g>)}
      {UCOMM_PLACES.filter(p=>p.floor===floor).map(p=>{
       const isSelected=selected===p.id,fade=wing!=='both'&&!(wing==='heritage'?p.x<350:p.x>=350);
       return <g key={p.id} tabIndex={0} role="button" aria-label={`Select ${p.label}, floor ${p.floor}`} data-uc-pin="true" onClick={()=>!chooseOrigin&&selectLocation(p.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!chooseOrigin)selectLocation(p.id);}}} opacity={fade?.25:1} className={`uc-pin ${isSelected?'uc-pin-selected':''}`}>
        {isSelected&&<circle cx={p.x} cy={p.y} r="38" fill="#e8ba4d" opacity=".22" className="uc-pin-halo"/>}
        <circle cx={p.x} cy={p.y} r={isSelected?21:15} fill={isSelected?'#b74444':pinColor(p.kind)} stroke="white" strokeWidth="5"/>
        {p.kind==='study'?<text x={p.x} y={p.y+5} fill="#fff" textAnchor="middle" fontSize="17" fontWeight="700">✦</text>:<text x={p.x} y={p.y+4} fill="#fff" textAnchor="middle" fontSize="12" fontWeight="780">{p.kind==='service'?'S':'R'}</text>}
        {isSelected&&<g><rect x={Math.max(14,Math.min(540,p.x-88))} y={p.y-72} width="176" height="33" rx="15" fill="#fff" stroke="#e0e4db" strokeWidth="1.2"/><text x={Math.max(14,Math.min(540,p.x-88))+88} y={p.y-51} fill="#252e28" textAnchor="middle" fontSize="12" fontWeight="720">{p.label.length>24?p.label.slice(0,22)+'…':p.label}</text></g>}
       </g>;
      })}
      {chooseOrigin&&startCandidates.map(n=><g key={n.id} data-uc-origin="true" role="button" tabIndex={0} aria-label={`Set starting point: ${markerText(n)} on Floor ${floor}`} onClick={()=>selectStartingPoint(n)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectStartingPoint(n);}}} className="uc-start-marker"><circle cx={n.x} cy={n.y} r="24" fill="#278ce4" fillOpacity=".20" stroke="#278ce4" strokeWidth="1.2" strokeDasharray="4 4"/><circle cx={n.x} cy={n.y} r="11" fill="#167cce" stroke="white" strokeWidth="4"/></g>)}
      {originChosen&&!chooseOrigin&&originNode?.floor===floor&&<g><circle cx={originNode.x} cy={originNode.y} r="22" fill="#2588e6" opacity=".18" className="uc-start-pulse"/><circle cx={originNode.x} cy={originNode.y} r="12" fill="#248ce3" stroke="white" strokeWidth="5"/></g>}
      {currentStepNode?.floor===floor&&phase==='guiding'&&<g className="uc-current-position" transform={`translate(${currentStepNode.x} ${currentStepNode.y})`}>
       <circle r="31" fill="#2687e3" opacity=".17" className="uc-live-halo"/>
       <circle r="19" fill="#fff" stroke="#d7e5eb" strokeWidth="2"/>
       <g transform={`rotate(${directionAngle})`} className="uc-compass-needle"><path d="M0 -15 L9 11 L0 6 L-9 11 Z" fill="#1785d9" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/><circle r="3" fill="#eefaff"/></g>
      </g>}
     </g>
    </svg>

    <div className="uc-floor-rail" role="group" aria-label="Choose a floor"><small>LEVEL</small>{[...UCOMM_FLOORS].reverse().map(f=><button key={f} type="button" aria-label={`Floor ${f}`} aria-pressed={floor===f} onClick={()=>showFloor(f)}>{f}</button>)}</div>
    <div className="uc-scene-tools"><button type="button" aria-label="Zoom in" onClick={()=>setCamera(v=>clampCamera({...v,zoom:v.zoom+.09}))}><Plus size={19}/></button><button type="button" aria-label="Zoom out" onClick={()=>setCamera(v=>clampCamera({...v,zoom:v.zoom-.09}))}><Minus size={19}/></button><button type="button" aria-label="Recenter map" onClick={recenter}><LocateFixed size={19}/></button></div>
    <button type="button" className="uc-camera-map-button" onClick={openCameraPreview} aria-label="Open indoor camera navigation preview"><Camera size={18}/><span>Camera</span></button>
    <div className="uc-bearing" aria-label="Map north indicator"><Compass size={16}/><span>N</span><i/></div>
    {routeVisible&&route!.floors.length>1&&<div className="uc-level-ribbon"><Layers3 size={15}/><span>{route!.floors.map(f=>`F${f}`).join(' → ')}</span></div>}
    {chooseOrigin&&<div className="uc-map-guide" role="status"><Target size={18}/><div><b>Choose where you are</b><small>Tap a blue point on Floor {floor}, or switch floors.</small></div><button type="button" aria-label="Cancel starting point selection" onClick={()=>setChooseOrigin(false)}><X size={17}/></button></div>}
    {message&&!chooseOrigin&&<div className="uc-map-flash" role="status">{message}</div>}
    {phase==='destination'||phase==='overview'||phase==='trace'||phase==='return'?<div className="uc-cinematic-label" aria-live="polite"><span className="uc-orbit-spinner"/>{phase==='destination'?`Destination · Floor ${destination.floor}`:phase==='overview'?'Zooming out to see the route':phase==='trace'?'Tracing the blue path':'Returning to your starting point'}</div>:null}

    <div className={`uc-sheet ${routeVisible&&expanded?'uc-sheet-expanded':''}`}>
     <span className="uc-sheet-grip" aria-hidden="true"/>
     <div className="uc-sheet-topline"><span>DESTINATION · UNIVERSITY COMMONS</span><span className="uc-floor-chip">FLOOR {destination.floor}</span></div>
     <div className="uc-sheet-heading"><span className="uc-destination-art"><ServiceArt name={destination.kind==='study'?'study':destination.kind==='classroom'?'classrooms':'map'} size={50}/></span><div><h2>{destination.label}</h2><p>{destination.room?`Room ${destination.room} · `:''}{kindLabel[destination.kind]}</p></div><button type="button" className="uc-sheet-details" aria-label="More details" aria-expanded={detailOpen} onClick={()=>setDetailOpen(v=>!v)}><Info size={19}/></button></div>
     {detailOpen&&<div className="uc-inline-details"><p>{destination.description}</p>{destination.access&&<p>{destination.access}</p>}<a href={source} target="_blank" rel="noopener noreferrer">University location source <ExternalLink size={12}/></a></div>}
     <div className="uc-sheet-metrics"><div><strong>{originChosen?`F${origin.split(':')[0]}`:'—'}</strong><small>Start floor</small></div><div><strong>{originChosen&&route?`${stageCount} segments`:'—'}</strong><small>Map path</small></div><div><strong>{originChosen&&route?`${route.floors.length} ${route.floors.length===1?'level':'levels'}`:'—'}</strong><small>Floor changes</small></div></div>
     {!routeVisible?<><div className="uc-start-select"><button type="button" onClick={()=>{setChooseOrigin(true);showFloor(originNode?.floor??'1');recenter();}}><MapPin size={16}/><span>{originChosen?`Starting at: ${originNode?markerText(originNode):'your point'} · F${originNode?.floor}`:'Choose your position on the map'}</span><ChevronRight size={15}/></button></div><button type="button" className="uc-primary" onClick={begin}><Navigation size={18}/> {originChosen?'Start navigation':'Choose starting point'} <ArrowRight size={18}/></button></>:
      <div className="uc-active-route">
       <div className="uc-route-heading"><span><Navigation size={16}/> {phase==='guiding'?'GUIDED ROUTE':'CINEMATIC ROUTE PREVIEW'}</span><span>STEP {momentIndex+1} / {moments.length}</span></div>
       <div className="uc-current-instruction"><span className="uc-turn-icon">{directionIcon(instruction(graph,route!.ids,step,destination.label))}</span><div><strong>{instruction(graph,route!.ids,step,destination.label)}</strong><small>{`Floor ${currentStepNode?.floor??floor} · diagram route`}</small></div></div>
       <div className="uc-progress-track"><i style={{width:`${100*(momentIndex+1)/Math.max(moments.length,1)}%`}}/></div>
       {phase==='guiding'&&<button type="button" className="uc-steps-toggle" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'Hide instructions':`View all ${moments.length} route steps`} <ChevronDown size={15}/></button>}
       {expanded&&phase==='guiding'&&<div className="uc-turn-list">{moments.map((index,i)=>{const node=routeFind(graph,route!.ids[index]);const text=instruction(graph,route!.ids,index,destination.label);return <button type="button" key={`${index}-${i}`} aria-current={step===index?'step':undefined} className={step===index?'uc-turn-active':''} onClick={()=>goToMoment(i)}><span className="uc-step-glyph">{directionIcon(text)}</span><span><b>{text}</b><small>Floor {node?.floor}</small></span></button>;})}</div>}
       <button type="button" className="uc-camera-cta" onClick={openCameraPreview}><Camera size={17}/> Open camera route preview <ArrowRight size={16}/></button>
       <div className="uc-nav-actions"><button type="button" disabled={momentIndex===0} onClick={()=>goToMoment(momentIndex-1)}><ArrowLeft size={17}/> Back</button><button type="button" className="uc-nav-next" disabled={momentIndex===moments.length-1} onClick={()=>goToMoment(momentIndex+1)}>{momentIndex===moments.length-1?'Arrived':'Next step'} <ArrowRight size={17}/></button><button type="button" aria-label="Reset route" onClick={endNavigation}><RotateCcw size={17}/></button></div>
      </div>}
     <div className="uc-sheet-footnote"><span className="uc-preview-pill">MAP PREVIEW</span><span>Indoor position is selected manually.</span></div>
    </div>
   </div>
  </section>
  <section className="uc-explore-panel" aria-label="Explore places in University Commons">
   <div className="uc-discover-header">
    <div className="uc-discover-copy"><span className="uc-eyebrow">YOUR CAMPUS, UNLOCKED</span><h3>Find your next<br/><em>place to be.</em></h3><p>From a quiet corner to student support — discover what's inside.</p></div>
    <div className="uc-discover-building"><img src={photo('commons')} alt="University Commons exterior" loading="lazy"/><span>UCOMM</span></div>
   </div>
   <div className="uc-directory-tools">
    <div className="uc-floor-heading"><span><Layers3 size={16}/> Choose a level</span><span>FLOOR {floor} / 4</span></div>
    <div className="uc-discover-floors" role="group" aria-label="Select floor in place directory">{UCOMM_FLOORS.map(f=><button type="button" key={f} aria-pressed={floor===f} onClick={()=>showFloor(f)}>0{f}</button>)}</div>
    <div className="uc-wing-pills" role="group" aria-label="Choose building wing">{([['both','All areas'],['heritage','Historic wing'],['modern','New addition']] as const).map(([id,label])=><button key={id} type="button" aria-pressed={wing===id} onClick={()=>setWing(id)}>{label}</button>)}</div>
    <div className="uc-place-filters" role="group" aria-label="Filter locations">{choices.map(c=><button key={c.value} type="button" aria-pressed={filter===c.value} onClick={()=>setFilter(c.value)}>{c.name==='Study'?<Armchair size={15}/>:c.name==='Services'?<Building2 size={15}/>:c.name==='Rooms'?<BookOpen size={15}/>:<Layers3 size={15}/>} {c.name}</button>)}</div>
   </div>
   <div className="uc-discover-sectionline"><h4>Places to explore</h4><span>{floorPlaces.filter(p=>wing==='both'||(wing==='heritage'?p.x<350:p.x>=350)).length} on this view</span></div>
   <div className="uc-places-grid">{floorPlaces.filter(p=>wing==='both'||(wing==='heritage'?p.x<350:p.x>=350)).map(p=><button type="button" key={p.id} className={`uc-destination-tile uc-tile-${p.kind}${selected===p.id?' uc-place-active':''}`} onClick={()=>selectLocation(p.id)} aria-pressed={selected===p.id}>
     <span className="uc-tile-top"><span className="uc-tile-art"><ServiceArt name={p.kind==='study'?(p.id==='atrium'?'group':'study'):p.kind==='classroom'?'classrooms':p.id==='infolink'?'group':p.id==='office-1180'?'outlets':'map'} size={78}/></span><span className="uc-tile-arrow"><ArrowRight size={16}/></span></span>
     <span className="uc-tile-content"><span className="uc-tile-category">{p.kind==='study'?'FOCUS & RECHARGE':p.kind==='service'?'HERE TO HELP':p.kind==='classroom'?'LEARN & CREATE':'EXPLORE'}</span><strong>{p.label}</strong><small>{p.room?`Room ${p.room}`:'University Commons'} <span>·</span> Floor {p.floor}</small></span>
    </button>)}</div>
   {!floorPlaces.filter(p=>wing==='both'||(wing==='heritage'?p.x<350:p.x>=350)).length&&<div className="uc-directory-empty"><Search size={24}/><strong>Nothing in this view yet</strong><p>Try another floor or show all categories.</p><button type="button" onClick={()=>{setWing('both');setFilter('all');}}>Show all places <ArrowRight size={15}/></button></div>}
   <div className="uc-explore-footer"><button type="button" className="uc-start-point-card" onClick={()=>{setChooseOrigin(true);recenter();}}><span className="uc-start-point-icon"><Navigation size={23}/></span><span><strong>Starting somewhere else?</strong><small>Choose your position on the map</small></span><ChevronRight size={19}/></button>
    {onOtherBuildings&&<button type="button" className="uc-other-buildings" onClick={onOtherBuildings}>Browse other indoor maps <ArrowRight size={15}/></button>}
   </div>
   <div className="uc-sab-teaser" aria-label="South Academic Building indoor map is planned but not yet available"><div className="uc-sab-graphic" aria-hidden="true"><Building2 size={23}/><span className="uc-sab-radar"/></div><div><strong>SAB <span>·</span> South Academic Building</strong><small>Next stop on our indoor map</small></div><span className="uc-sab-lock" aria-hidden="true"><Layers3 size={16}/></span></div>
  </section>
  {cameraPreviewOpen&&<UCommCameraPreview destination={destination.label} floor={floor} step={momentIndex+1} totalSteps={Math.max(1,moments.length)} instruction={routeVisible&&route?instruction(graph,route.ids,step,destination.label):'Select your starting point to begin'} hasRoute={routeVisible} onClose={()=>setCameraPreviewOpen(false)} onNext={()=>{if(phase==='guiding'&&momentIndex<moments.length-1)goToMoment(momentIndex+1);}}/>}
 </div>;
}
