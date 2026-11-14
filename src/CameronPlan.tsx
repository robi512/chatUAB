import {useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,Compass,MapPin,Minus,Navigation,Plus,RotateCcw} from 'lucide-react';
import {instructions,routeCoordinates,svgRoute,type XY} from './IndoorRoute';

type Floor='1'|'B';
type Stop={name:string;x:number;y:number};
type FloorPlan={footprint:string;rooms:string[];corridor:readonly XY[];anchors:Stop[];stop:readonly number[]};
const plans:Record<Floor,FloorPlan>={
  '1':{
    footprint:'M350 350H401V302H456V245H515V91H613V62H670V91H893V263H951V315H984V420H950V632H629V663H574V632H484V601H399V461H351Z',
    rooms:['M515 91H893V263H815V417H674V298H515Z','M515 312H675V369H593V420H515Z','M668 525H950V632H668Z','M815 263H950V355H815Z','M815 355H950V420H815Z','M593 577H668V632H593Z','M401 302H456V405H401Z'],
    corridor:[[379,426],[475,426],[600,446],[640,443],[630,394],[681,393],[700,377],[702,244]],
    anchors:[{name:'CAB connection',x:379,y:426},{name:'Service desk',x:640,y:443},{name:'Study area 1–20',x:702,y:244}],
    stop:[0,3,7]
  },
  B:{
    footprint:'M470 300H521V257H575V95H662V67H713V95H918V257H973V360H1000V448H973V615H681V643H628V615H471Z',
    rooms:['M575 95H918V257H875V305H637V265H575Z','M576 309H726V449H649V484H576Z','M733 308H810V432H733Z','M858 348H916V481H858Z','M633 508H882V615H633Z','M882 548H969V615H882Z','M917 258H969V349H917Z'],
    corridor:[[555,527],[555,484],[557,353],[554,316],[582,305],[613,296],[624,273],[646,278],[672,255]],
    anchors:[{name:'Southwest stairs',x:555,y:527},{name:'Lower-level west corridor',x:557,y:353},{name:'Knowledge Common',x:672,y:255}],
    stop:[0,2,8]
  }
};
export function CameronPlan(){
  const [floor,setFloor]=useState<Floor>('1'),[from,setFrom]=useState(0),[to,setTo]=useState(2),[routing,setRouting]=useState(false),[step,setStep]=useState(0),[zoom,setZoom]=useState(1);
  const plan=plans[floor];
  const path=useMemo(()=>routeCoordinates(plan.corridor,plan.stop[from],plan.stop[to]),[plan,from,to]);
  const directions=useMemo(()=>instructions(path),[path]);
  const change=(next:Floor)=>{setFloor(next);setFrom(0);setTo(2);setStep(0);setRouting(false);setZoom(1);};
  const chooseStart=(next:number)=>{setFrom(next);setStep(0);setRouting(false);};
  const chooseEnd=(next:number)=>{setTo(next);setStep(0);setRouting(false);};
  const start=plan.anchors[from],end=plan.anchors[to];
  const routeShape=svgRoute(path);
  return <section className="nav3d" aria-label="Cameron indoor navigation">
    <div className="nav3d-heading"><div><span className="nav3d-eyebrow">Indoor navigator <span>•</span> schematic</span><h2>Cameron Library</h2><p>Explore a floor. Choose where you're going.</p></div><span className="nav3d-index">3D<span> / </span>MAP</span></div>
    <div className="nav3d-scene">
      <div className="nav3d-scene-head"><span><Compass size={15}/> CAMPUS WAYFINDING</span><span>ILLUSTRATED FLOOR MODEL</span></div>
      <div className="nav3d-floors" aria-label="Choose floor">{(['1','B'] as const).map(value=><button key={value} aria-pressed={floor===value} onClick={()=>change(value)} title={value==='B'?'Basement':'First floor'}>{value}</button>)}</div>
      <div className="nav3d-zoom"><button aria-label="Zoom in" disabled={zoom>=1.4} onClick={()=>setZoom(v=>Math.min(1.4,+(v+.2).toFixed(1)))}><Plus size={18}/></button><button aria-label="Zoom out" disabled={zoom<=.8} onClick={()=>setZoom(v=>Math.max(.8,+(v-.2).toFixed(1)))}><Minus size={18}/></button><button aria-label="Reset zoom" onClick={()=>setZoom(1)}><RotateCcw size={17}/></button></div>
      <svg className="nav3d-map" viewBox="240 -90 880 940" role="img" aria-label={`Illustrative isometric schematic of Cameron Library ${floor==='1'?'first floor':'basement'}${routing?' with connected route':''}`}>
        <defs>
          <linearGradient id="nav-floor-top" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffef9"/><stop offset="1" stopColor="#E4E8DF"/></linearGradient>
          <linearGradient id="nav-wall" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#A4B4A8"/><stop offset="1" stopColor="#738A7D"/></linearGradient>
          <filter id="nav3d-shadow" x="-30%" y="-30%" width="180%" height="180%"><feGaussianBlur stdDeviation="15"/></filter>
        </defs>
        <g transform={`translate(680 370) scale(${zoom}) translate(-680 -370)`}>
          <g className="nav3d-model" transform="rotate(-15 680 365) skewY(12) scale(1 .82)">
            <path d={plan.footprint} transform="translate(0 49)" fill="#1D4031" opacity=".16" filter="url(#nav3d-shadow)"/>
            <path d={plan.footprint} transform="translate(0 30)" fill="#7D9688" stroke="#6C8676" strokeWidth="3"/>
            <path d={plan.footprint} transform="translate(0 17)" fill="url(#nav-wall)" stroke="#6C8676" strokeWidth="2"/>
            <path d={plan.footprint} fill="url(#nav-floor-top)" stroke="#AAB7AC" strokeWidth="3"/>
            {plan.rooms.map((room,i)=><g key={room}><path d={room} transform="translate(0 13)" fill="#A4B3A7" stroke="#9AAB9F" strokeWidth="3"/><path d={room} fill={i%3===0?'#E8EEE6':i%3===1?'#FAF6EB':'#E4E9E7'} stroke="#AFBBB1" strokeWidth="3"/></g>)}
            <path d={svgRoute(plan.corridor)} stroke="#D0DBD1" strokeWidth="31" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".65"/>
            {routing&&path.length>1&&<g key={`${floor}-${from}-${to}`}>
              <path d={routeShape} stroke="#FFFFFF" strokeWidth="23" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path className="nav3d-route-line" d={routeShape} stroke="#1478D4" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength="1"/>
              <path className="nav3d-route-flow" d={routeShape} stroke="#C9ECFF" strokeWidth="3.7" strokeDasharray="5 17" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </g>}
            {plan.anchors.map((a,i)=><g key={a.name} className="nav3d-pin" role="button" tabIndex={0} aria-label={`Set destination to ${a.name}`} onClick={()=>chooseEnd(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseEnd(i);}}}>
              <circle cx={a.x} cy={a.y} r="21" fill={to===i?'#F1C661':'#0D503C'} stroke="white" strokeWidth="6"/>
              <circle cx={a.x} cy={a.y} r="6" fill={to===i?'#1F392E':'white'}/>
              <text x={a.x+24} y={a.y-24} paintOrder="stroke" stroke="#FDFEFA" strokeWidth="7" fill="#153A2D" fontSize="20" fontWeight="700">{a.name}</text>
            </g>)}
            {routing&&path.length>1&&<><circle cx={start.x} cy={start.y} r="12" fill="#FFFFFF" stroke="#1478D4" strokeWidth="7"/><circle cx={end.x} cy={end.y} r="12" fill="#F8D874" stroke="#174C38" strokeWidth="7"/></>}
          </g>
        </g>
      </svg>
      <div className="nav3d-scene-caption"><span className="nav3d-dot"/> {routing?'Mapped schematic route':'Choose start and destination'}</div>
    </div>
    <div className="nav3d-sheet">
      <div className="nav3d-handle"/><div className="nav3d-sheet-title"><div><small>CAMERON LIBRARY · {floor==='B'?'BASEMENT':'FIRST FLOOR'}</small><h3>{end.name}</h3></div><div className="nav3d-floor-badge">F{floor}</div></div>
      <div className="nav3d-fields"><label>Starting point<select aria-label="Starting point" value={from} onChange={e=>chooseStart(Number(e.target.value))}>{plan.anchors.map((a,i)=><option key={a.name} value={i}>{a.name}</option>)}</select></label><label>Destination<select aria-label="Destination" value={to} onChange={e=>chooseEnd(Number(e.target.value))}>{plan.anchors.map((a,i)=><option key={a.name} value={i}>{a.name}</option>)}</select></label></div>
      {!routing?<button className="nav3d-primary" onClick={()=>{setRouting(true);setStep(0);}}><Navigation size={19}/> Show connected route <ArrowRight size={19}/></button>:<div className="nav3d-steps" role="status">
        <div className="nav3d-step-main"><span className="nav3d-step-count">{Math.min(step+1,directions.length)}<small>/{directions.length}</small></span><div><small>SCHEMATIC GUIDANCE</small><strong>{directions[step]}</strong></div></div>
        <div className="nav3d-step-actions"><button onClick={()=>setStep(i=>Math.max(0,i-1))} disabled={step===0}><ArrowLeft size={17}/> Back</button><button onClick={()=>setStep(i=>Math.min(directions.length-1,i+1))} disabled={step===directions.length-1}>{step===directions.length-1?<><Check size={17}/> Arrived</>:<>Next step <ArrowRight size={17}/></>}</button><button onClick={()=>{setRouting(false);setStep(0);}}>Reset</button></div>
      </div>}
      <p className="nav3d-caveat"><MapPin size={14}/> Schematic based on older published Cameron floor plans. Not live indoor positioning; verify doors, turns and accessibility on site.</p>
    </div>
  </section>;
}
