import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,ChevronDown,Compass,Expand,Layers3,MapPin,Minus,Navigation,Plus,RotateCcw,Search,X,ExternalLink} from 'lucide-react';
import {getIndoorBuilding,indoorBuildings,indoorInstruction,isIndoorBuilding,makeIndoorGraph,pointKey,routeOnFloor,solveIndoorRoute,type IndoorPoint} from './IndoorNavModel';
import {photo} from './data';
import './indoor-navigator.css';

type Props={buildingId:string;onBuildingChange:(id:string)=>void;initialQuery?:string};
const byKey=(points:IndoorPoint[],id:string)=>points.find(p=>p.id===id);
const short=(label:string)=>label.replace(/^CCIS /,'').replace(' · ','\n');
export function IndoorNavigator({buildingId,onBuildingChange,initialQuery=''}:Props){
  const supported=isIndoorBuilding(buildingId);
  const building=getIndoorBuilding(buildingId);
  const graph=useMemo(()=>makeIndoorGraph(building.id),[building.id]);
  const arrivalFloor=building.floors.includes('1')?'1':building.floors[0];
  const [floor,setFloor]=useState(arrivalFloor);
  const [start,setStart]=useState(pointKey(arrivalFloor,'entry'));
  const [destination,setDestination]=useState(graph.points.find(p=>p.kind==='destination'&&p.floor===arrivalFloor)?.id??graph.points.find(p=>p.kind==='destination')?.id??pointKey(arrivalFloor,'middle'));
  const [active,setActive]=useState(false),[step,setStep]=useState(0),[zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0});
  const [query,setQuery]=useState(initialQuery),[showSearch,setShowSearch]=useState(false);
  const pointer=useRef<{x:number;y:number;initialX:number;initialY:number;active:boolean}|null>(null);
  const route=useMemo(()=>active?solveIndoorRoute(graph,start,destination):null,[active,graph,start,destination]);
  const startOptions=graph.points.filter(p=>p.public&&(p.kind==='entrance'||p.kind==='core'||p.kind==='destination'));
  const destinations=graph.points.filter(p=>p.kind==='destination');
  const matches=destinations.filter(p=>p.label.toLowerCase().includes(query.trim().toLowerCase())||p.floor.toLowerCase().includes(query.trim().toLowerCase()));
  const destinationPoint=byKey(graph.points,destination)!;
  const currentFloorPoints=graph.points.filter(p=>p.floor===floor);
  const pathSegments=routeOnFloor(graph,route,floor).map(piece=>piece.map(id=>byKey(graph.points,id)!).filter(Boolean));
  const currentStep=route&&byKey(graph.points,route.ids[Math.min(step,route.ids.length-1)]);
  const selectedPath=route?route.ids.map(id=>byKey(graph.points,id)!).filter(Boolean):[];
  const resetRoute=()=>{setActive(false);setStep(0);};
  useEffect(()=>{
    const target=getIndoorBuilding(buildingId),main=target.floors.includes('1')?'1':target.floors[0];
    const next=makeIndoorGraph(target.id),first=next.points.find(p=>p.kind==='destination'&&p.floor===main)??next.points.find(p=>p.kind==='destination');
    const found=initialQuery?next.points.find(p=>p.kind==='destination'&&p.label.toLowerCase()===initialQuery.toLowerCase()):undefined;
    setFloor(found?.floor??main);setStart(pointKey(main,'entry'));setDestination(found?.id??first?.id??pointKey(main,'middle'));setActive(false);setStep(0);setZoom(1);setPan({x:0,y:0});setQuery('');setShowSearch(false);
  },[buildingId,initialQuery]);
  const moveDestination=(id:string)=>{const target=byKey(graph.points,id);if(!target)return;setDestination(id);setFloor(target.floor);resetRoute();setShowSearch(false);setQuery('');};
  const nextStep=()=>{if(!route)return;const next=Math.min(step+1,route.ids.length-1);setStep(next);const p=byKey(graph.points,route.ids[next]);if(p)setFloor(p.floor);};
  const prevStep=()=>{if(!route)return;const next=Math.max(0,step-1);setStep(next);const p=byKey(graph.points,route.ids[next]);if(p)setFloor(p.floor);};
  const zoomBy=(delta:number)=>setZoom(z=>Math.max(.8,Math.min(2.2,Math.round((z+delta)*100)/100)));
  return <div className="indoor-app">
    <header className="indoor-head">
      <div className="indoor-head-overline"><Layers3 size={15}/> INDOOR CAMPUS MAP <span className="indoor-beta">Schematic preview</span></div>
      <div className="indoor-head-row"><div><h1>Find your way <span>inside.</span></h1><p>Choose a building, floor and destination.</p></div><div className="indoor-head-compass"><Compass size={26}/></div></div>
      <label className="indoor-building-label">BUILDING
        <span className="indoor-building-select"><MapPin size={18}/><select aria-label="Indoor building" value={supported?building.id:''} onChange={e=>onBuildingChange(e.target.value)}>
          {!supported&&<option value="" disabled>Choose an indoor map</option>}
          {indoorBuildings.map(b=><option key={b.id} value={b.id}>{b.short}</option>)}
        </select><ChevronDown size={18}/></span>
      </label>
      {!supported&&<div className="indoor-not-supported" role="status">Indoor details for this building are being prepared.</div>}
      <div className="indoor-building-photo"><img src={photo(building.id==='ccis'?'campus':building.id==='cameron'?'cameron':building.id==='rutherford'?'rutherford':'sperber')} alt={`${building.short} building reference image`}/><span><strong>{building.short}</strong><small>Interactive floor guide</small></span><span className="indoor-building-caption">MAP PREVIEW</span></div>
    </header>
    <div className="indoor-card">
      <div className="indoor-card-heading"><div><small>EXPLORE FLOORS</small><strong>{building.levelName[floor]}</strong></div><span><MapPin size={14}/> {destinations.filter(p=>p.floor===floor).length} mapped destinations</span></div>
      <div className="indoor-floor-tabs" role="group" aria-label="Select indoor floor">{building.floors.map(f=><button key={f} type="button" aria-pressed={floor===f} onClick={()=>setFloor(f)}>{f}</button>)}</div>
      <div className="indoor-map-stage">
        <div className="indoor-map-watermark" aria-hidden="true">SCHEMATIC <span>·</span> NOT TO SCALE</div>
        <div className="indoor-map-tools"><button aria-label="Zoom in" disabled={zoom>=2.2} onClick={()=>zoomBy(.2)}><Plus size={18}/></button><button aria-label="Zoom out" disabled={zoom<=.8} onClick={()=>zoomBy(-.2)}><Minus size={18}/></button><button aria-label="Recenter indoor map" onClick={()=>{setZoom(1);setPan({x:0,y:0});}}><Expand size={17}/></button></div>
        <svg className="indoor-floor-svg" viewBox="0 0 700 720" role="img" aria-label={`Interactive illustrated schematic for ${building.short}, ${building.levelName[floor]}`}
          onPointerDown={e=>{if((e.target as Element).closest('[data-destination]'))return;pointer.current={x:e.clientX,y:e.clientY,initialX:pan.x,initialY:pan.y,active:true};e.currentTarget.setPointerCapture(e.pointerId);}}
          onPointerMove={e=>{const p=pointer.current;if(!p?.active)return;setPan({x:p.initialX+(e.clientX-p.x)*700/e.currentTarget.clientWidth,y:p.initialY+(e.clientY-p.y)*720/e.currentTarget.clientHeight});}}
          onPointerUp={e=>{pointer.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
          onPointerCancel={()=>{pointer.current=null;}}>
          <defs>
            <linearGradient id="indoor-map-surface" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffcf4"/><stop offset="1" stopColor="#e8e9de"/></linearGradient>
            <filter id="indoor-map-softshadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="13" floodColor="#1b4733" floodOpacity=".17"/></filter>
            <filter id="indoor-map-pinshadow"><feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#16432f" floodOpacity=".27"/></filter>
          </defs>
          <g transform={`translate(${350+pan.x} ${360+pan.y}) scale(${zoom}) translate(-350 -360)`}>
            <path d="M98 81 H580 L629 132 V617 H102 L69 581 V125 Z" transform="translate(0 12)" fill="#b7c4b4" filter="url(#indoor-map-softshadow)"/>
            <path d="M98 81 H580 L629 132 V617 H102 L69 581 V125 Z" fill="url(#indoor-map-surface)" stroke="#95a79b" strokeWidth="6" strokeLinejoin="round"/>
            <path d="M319 136 H385 V545 H319 Z" fill="#d6e7da" stroke="#b1c7b5" strokeWidth="2"/>
            <path d="M113 317 H586 V364 H113 Z" fill="#dce9de" opacity=".8"/>
            <path d="M113 448 H588 V497 H113 Z" fill="#e0e9dc" opacity=".7"/>
            {[
              {x:102,y:111,w:199,h:172},{x:401,y:111,w:194,h:172},{x:102,y:298,w:199,h:131},{x:401,y:298,w:194,h:131},{x:102,y:511,w:199,h:88},{x:401,y:511,w:194,h:88}
            ].map((r,i)=><g key={i}><rect x={r.x} y={r.y+8} width={r.w} height={r.h} rx="3" fill="#becbbd"/><rect x={r.x} y={r.y} width={r.w} height={r.h} rx="3" fill={i===0?'#eef2e9':i===1?'#f6efdf':i===2?'#e6eae5':i===3?'#e6eae7':i===4?'#f5eedf':'#eef1e9'} stroke="#a7b4a8" strokeWidth="3"/></g>)}
            <g className="indoor-room-furniture" fill="#b6c5b8" opacity=".88">
             {Array.from({length:4},(_,i)=><g key={i}><rect x={126+i*41} y="150" width="27" height="48" rx="4"/><rect x={421+i*39} y="153" width="24" height="42" rx="4"/></g>)}
             {Array.from({length:3},(_,i)=><g key={i}><rect x={131+i*58} y="332" width="38" height="30" rx="4"/><rect x={418+i*52} y="331" width="37" height="29" rx="4"/></g>)}
            </g>
            <g stroke="#ffffff" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M350 594 V154 M234 264 H470 M234 398 H470 M234 264 V398 M470 264 V398"/></g>
            <g stroke="#d6e6da" strokeWidth="4" strokeDasharray="4 12" strokeLinecap="round" fill="none"><path d="M350 594 V154 M234 264 H470 M234 398 H470 M234 264 V398 M470 264 V398"/></g>
            {pathSegments.map((points,i)=>points.length>1&&<g key={`${floor}-${i}`}>
              <polyline points={points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="white" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline className="indoor-route-draw" points={points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#2175D4" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength="100"/>
              <polyline className="indoor-route-pulse" points={points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#C9ECFF" strokeWidth="4" strokeDasharray="8 20" strokeLinecap="round" strokeLinejoin="round"/>
              {points.slice(1).map((p,j)=>{const previous=points[j];const angle=Math.atan2(p.y-previous.y,p.x-previous.x)*180/Math.PI;return <g key={j} transform={`translate(${(p.x+previous.x)/2} ${(p.y+previous.y)/2}) rotate(${angle})`}><path d="M-11 -7 L0 0 L-11 7" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></g>})}
            </g>)}
            <g>
              <rect x="295" y="371" width="110" height="53" rx="14" fill="#f9fff8" stroke="#b3cbb7" strokeWidth="3"/>
              <text x="350" y="390" textAnchor="middle" fontSize="12" fontWeight="700" fill="#246446">FLOOR CORE</text>
              <text x="350" y="408" textAnchor="middle" fontSize="12" fill="#4b7160">⇅ Levels</text>
            </g>
            {currentFloorPoints.filter(p=>p.kind==='destination').map(p=><g key={p.id} data-destination="true" className="indoor-target" role="button" tabIndex={0} aria-label={`Choose ${p.label} on ${building.levelName[p.floor]}`} onClick={()=>moveDestination(p.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();moveDestination(p.id);}}}>
              <circle cx={p.x} cy={p.y} r="22" fill={destination===p.id?'#e8bc59':'#125640'} stroke="white" strokeWidth="7" filter="url(#indoor-map-pinshadow)"/>
              <circle cx={p.x} cy={p.y} r="6" fill={destination===p.id?'#20482f':'white'}/>
              <rect x={p.x>350?p.x-144:p.x-12} y={p.y>380?p.y-65:p.y+27} width="154" height="36" rx="12" fill="white" fillOpacity=".95" stroke="#d4e2d6" strokeWidth="2"/>
              <text x={p.x>350?p.x-67:p.x+65} y={p.y>380?p.y-42:p.y+50} fontSize="13" fontWeight="760" fill="#183c2a" textAnchor="middle">{short(p.label).slice(0,21)}</text>
            </g>)}
            {currentFloorPoints.filter(p=>p.kind==='entrance').map(p=><g key={p.id}>
              <circle cx={p.x} cy={p.y} r="17" fill="#fff" stroke="#447b63" strokeWidth="5"/><path d={`M${p.x-5} ${p.y+4} L${p.x} ${p.y-5} L${p.x+5} ${p.y+4}`} stroke="#247b57" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <text x={p.x+26} y={p.y+4} fontSize="15" fill="#365744" fontWeight="700">Entry</text>
            </g>)}
            {currentStep&&currentStep.floor===floor&&<g><circle cx={currentStep.x} cy={currentStep.y} r="28" fill="#2678D2" opacity=".13"/><circle cx={currentStep.x} cy={currentStep.y} r="12" fill="#2477D1" stroke="white" strokeWidth="5"/></g>}
          </g>
        </svg>
        <div className="indoor-map-legend"><span><i className="indoor-legend-route"/> Path</span><span><i className="indoor-legend-point"/> Destination</span></div>
      </div>
    </div>
    <div className="indoor-route-card">
      <span className="indoor-card-grab" aria-hidden="true"/>
      <div className="indoor-route-title"><span className="indoor-route-symbol"><Navigation size={22}/></span><div><small>{building.short} · {building.levelName[destinationPoint.floor]}</small><h2>{destinationPoint.label}</h2></div></div>
      <div className="indoor-search-wrap"><label className="indoor-search"><Search size={18}/><input aria-label="Find an indoor destination" placeholder="Search classrooms or study zones" value={query} onFocus={()=>setShowSearch(true)} onChange={e=>{setQuery(e.target.value);setShowSearch(true);resetRoute();}}/><button onClick={()=>{setQuery('');setShowSearch(false);}} aria-label="Clear destination search"><X size={16}/></button></label>
        {showSearch&&<div className="indoor-search-results" role="listbox" aria-label="Indoor destinations"><div className="indoor-search-title">{matches.length} supported locations</div>{matches.length?matches.map(p=><button key={p.id} onClick={()=>moveDestination(p.id)}><MapPin size={15}/><span>{p.label}<small>{building.levelName[p.floor]}</small></span><ChevronDown size={15}/></button>):<p>No known room matches. Try another building or room code.</p>}</div>}
      </div>
      <div className="indoor-route-selectors"><label>FROM<select aria-label="Indoor route starting point" value={start} onChange={e=>{setStart(e.target.value);resetRoute();}}>{startOptions.map(p=><option key={p.id} value={p.id}>{p.label} · {building.levelName[p.floor]}</option>)}</select></label>
        <label>TO<select aria-label="Indoor route destination" value={destination} onChange={e=>moveDestination(e.target.value)}>{destinations.map(p=><option key={p.id} value={p.id}>{p.label} · {building.levelName[p.floor]}</option>)}</select></label></div>
      {active&&route?<div className="indoor-guidance" role="status" aria-live="polite">
        <div className="indoor-guidance-kicker"><span>STEP {step+1} / {route.ids.length}</span><span>{route.floors.length>1?`${route.floors.length} floors`:'Same-floor path'}</span></div>
        <div className="indoor-guidance-step"><span className="indoor-direction-icon"><Navigation size={23}/></span><strong>{indoorInstruction(graph,route,step)}</strong></div>
        <div className="indoor-progress"><span style={{width:`${route.ids.length<2?100:((step+1)/route.ids.length)*100}%`}}/></div>
        <div className="indoor-guide-buttons"><button onClick={prevStep} disabled={step===0}><ArrowLeft size={16}/> Back</button><button className="indoor-next" onClick={nextStep} disabled={step>=route.ids.length-1}>{step>=route.ids.length-1?<><Check size={17}/> Arrived</>:<>Next step <ArrowRight size={17}/></>}</button><button onClick={resetRoute}><RotateCcw size={16}/> Reset</button></div>
      </div>:<button className="indoor-start" onClick={()=>{setActive(true);setStep(0);const p=byKey(graph.points,start);if(p)setFloor(p.floor);}}><Navigation size={18}/> Show indoor route <ArrowRight size={18}/></button>}
      {building.id==='cameron'&&(['B','1'].includes(floor))&&<a className="indoor-official-plan" href={floor==='B'?'https://sites.library.ualberta.ca/wp-content/uploads/2020/08/seats-map-cameron.pdf':'https://sites.library.ualberta.ca/wp-content/uploads/2021/01/27Jan2021_LibrarySpace_CameronFirstFloor.pdf'} target="_blank" rel="noopener noreferrer"><BookOpen size={17}/> View original U of A floor plan (PDF) <ExternalLink size={15}/></a>}
      <div className="indoor-integrity"><BookOpen size={15}/><p><strong>Illustrated wayfinding preview.</strong> {building.note} Routes follow this interactive schematic, not surveyed hallways. No live positioning, verified entrances, or walking-time estimates. Check posted building signs.</p></div>
    </div>
  </div>;
}
