
type Wing='both'|'heritage'|'modern';
type Room={x:number;y:number;w:number;h:number;type:'seminar'|'study'|'office'|'lounge'|'stairs'|'reading'|'quiet';name?:string};

const heritage:Room[]=[
 {x:75,y:115,w:78,h:106,type:'seminar'},
 {x:196,y:115,w:76,h:106,type:'reading'},
 {x:75,y:250,w:78,h:112,type:'office'},
 {x:196,y:250,w:76,h:112,type:'seminar'},
 {x:75,y:392,w:78,h:116,type:'lounge'},
 {x:196,y:392,w:76,h:116,type:'office'},
 {x:89,y:529,w:67,h:46,type:'stairs'},
 {x:196,y:528,w:76,h:47,type:'seminar'},
];
const modern:Room[]=[
 {x:443,y:114,w:82,h:115,type:'quiet'},
 {x:560,y:114,w:77,h:115,type:'study'},
 {x:443,y:257,w:82,h:113,type:'seminar'},
 {x:560,y:257,w:77,h:113,type:'office'},
 {x:443,y:402,w:82,h:107,type:'lounge'},
 {x:560,y:402,w:77,h:107,type:'seminar'},
 {x:443,y:529,w:82,h:45,type:'stairs'},
 {x:560,y:529,w:77,h:45,type:'reading'},
];

function Desk({x,y,w=32}: {x:number;y:number;w?:number}){
 return <g><rect x={x+1} y={y+3} width={w} height="16" rx="2" fill="#809084" opacity=".18"/>
 <rect x={x} y={y} width={w} height="12" rx="2" fill="#d2c9bb" stroke="#aeaa9f" strokeWidth=".8"/>
 <path d={`M${x+3} ${y+11}v3 M${x+w-3} ${y+11}v3`} stroke="#b8ae9f" strokeWidth="1.5"/>
 <rect x={x+w/2-5} y={y-6} width="10" height="5" rx="1.5" fill="#a6b8aa"/>
 </g>;
}
function Table({x,y}: {x:number;y:number}){
 return <g><ellipse cx={x+18} cy={y+17} rx="22" ry="5" fill="#96a597" opacity=".14"/>
 <rect x={x} y={y} width="36" height="21" rx="3" fill="#d9d2c4" stroke="#c0b8ab" strokeWidth="1"/>
 {[[-6,-2],[37,-2],[-6,16],[37,16]].map(([dx,dy],i)=><g key={i}><rect x={x+dx} y={y+dy} width="6" height="8" rx="2" fill="#a9b5a8"/><rect x={x+dx+1} y={y+dy+1} width="4" height="4" rx="1" fill="#d6e0d4"/></g>)}
 </g>;
}
function Plant({x,y,r=9}:{x:number;y:number;r?:number}){
 return <g><ellipse cx={x+1} cy={y+3} rx={r+3} ry={r/2+2} fill="#3e5b48" opacity=".12"/>
 <circle cx={x} cy={y} r={r} fill="#b9cfac"/>
 {Array.from({length:7},(_,i)=>{const a=2*Math.PI*i/7;return <ellipse key={i} cx={x+Math.cos(a)*r*.45} cy={y+Math.sin(a)*r*.45} rx={r*.35} ry={r*.61} transform={`rotate(${i*51},${x+Math.cos(a)*r*.45},${y+Math.sin(a)*r*.45})`} fill={i%2?'#80a982':'#96ba90'}/>;})}
 <circle cx={x} cy={y} r={r*.32} fill="#e4edcf"/></g>;
}
function Furniture({r,i,floor}:{r:Room;i:number;floor:string}){
 const {x,y,w,h,type}=r;
 if(h<60)return type==='stairs'?<g>{Array.from({length:7},(_,j)=><line key={j} x1={x+8} x2={x+w-8} y1={y+6+j*5} y2={y+6+j*5} stroke="#c0c5ba" strokeWidth="2"/>)}<path d={`M${x+w/2} ${y+32}v-21l-6 6m6-6l6 6`} fill="none" stroke="#66957a" strokeWidth="2"/></g>:<Desk x={x+10} y={y+12} w={w-20}/>;
 if(type==='quiet' && floor==='1')return <g>
 <rect x={x+7} y={y+8} width={w-14} height={h-16} rx="4" fill="#e3eedc"/>
 {Array.from({length:3},(_,j)=><g key={j}><Desk x={x+13} y={y+16+j*26} w={w-26}/></g>)}
 <Plant x={x+w-13} y={y+h-13} r={6}/>
 </g>;
 if(type==='reading'||type==='study')return <g>{Array.from({length:3},(_,j)=><g key={j}><rect x={x+9} y={y+12+j*25} width={w-18} height="13" rx="2" fill="#c3b69d" stroke="#b4a78d" strokeWidth=".8"/>{Array.from({length:5},(_,k)=><rect key={k} x={x+12+k*(w-25)/5} y={y+11+j*25} width="3" height="11" fill={k%2?'#9eab9c':'#e4e2d9'}/>)}</g>)}</g>;
 if(type==='lounge')return <g><rect x={x+12} y={y+14} width="27" height="19" rx="7" fill="#aec6b2"/><rect x={x+14} y={y+16} width="23" height="11" rx="5" fill="#cfdfcc"/><rect x={x+w-39} y={y+14} width="27" height="19" rx="7" fill="#aec6b2"/><rect x={x+w-37} y={y+16} width="23" height="11" rx="5" fill="#cfdfcc"/><circle cx={x+w/2} cy={y+57} r="13" fill="#d4c3a3" stroke="#bfa987"/><Plant x={x+w/2} y={y+h-18} r={9}/></g>;
 if(type==='office')return <g><Desk x={x+12} y={y+18} w={w-24}/><rect x={x+14} y={y+49} width={w-28} height="8" rx="1.5" fill="#b0b7ac"/><rect x={x+14} y={y+61} width={w-28} height="8" rx="1.5" fill="#d1d5c7"/><Plant x={x+w-15} y={y+h-17} r={6}/></g>;
 return <g><Table x={x+8} y={y+16}/><Table x={x+8} y={y+58}/>{w>75&&<Desk x={x+45} y={y+44} w={w-52}/>}</g>;
}
function RoomArt({r,i,floor,bright}:{r:Room;i:number;floor:string;bright:boolean}){
 const {x,y,w,h}=r;
 const special=bright&&r.type==='quiet';
 const fill=special?'#e4f0dc':i%4===0?'#edece5':i%3===0?'#f0ecdf':'#f5f4ee';
 return <g>
 <path d={`M${x} ${y+h}l8 8h${w}l-8 -8 M${x+w} ${y}l8 8v${h}`} fill="#e0e9dd" opacity=".93"/>
 <rect x={x} y={y} width={w} height={h} rx="1.5" fill={fill}/>
 <rect x={x+4} y={y+4} width={w-8} height={h-8} rx="1.5" fill="none" stroke="#fbfaf6" strokeWidth="1.4"/>
 <Furniture r={r} i={i} floor={floor}/>
 <path d={`M${x} ${y}h${w}v${h}h-${w}z`} fill="none" stroke="#c3d0c6" strokeWidth="1.8"/>
 <path d={`M${x+w-2} ${y+h*.43}v21`} stroke="#f8f7f0" strokeWidth="5.7"/>
 <path d={`M${x+w-1} ${y+h*.43}v21`} stroke="#9cab9c" strokeWidth="1.1" strokeDasharray="1 3"/>
 {special&&<path d={`M${x+4} ${y+4}H${x+w-4}v${h-8}H${x+4}Z`} stroke="#9bbc88" strokeWidth="1.4" strokeDasharray="4 4" fill="none"/>}
 </g>;
}
/** Artistic, plan-aligned 2.5D model. This deliberately does not claim architectural measurements. */
export default function UniversityCommonsArchitecture({floor,wing}:{floor:string;wing:Wing}){
 const fadedHistoric=wing==='modern'?.21:1;
 const fadedModern=wing==='heritage'?.21:1;
 return <g className="uc-architecture" key={`ucomm-architecture-${floor}`}>
 <defs>
 <linearGradient id="uc-floor-stone" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fcfbf7"/><stop offset="1" stopColor="#e6e7e0"/></linearGradient>
 <linearGradient id="uc-atrium-glass" x1="0" y1="0" x2=".4" y2="1"><stop stopColor="#ecf5e8"/><stop offset="1" stopColor="#d7e5d6"/></linearGradient>
 <linearGradient id="uc-heritage-wall" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f8f6ef"/><stop offset="1" stopColor="#d6d7cc"/></linearGradient>
 <pattern id="uc-stone-tile" width="27" height="27" patternUnits="userSpaceOnUse"><path d="M27 0H0V27" stroke="#c5c8c0" strokeWidth=".6" fill="none" opacity=".48"/></pattern>
 <pattern id="uc-windows" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M0 0h12v4H0z" fill="#cbded9" stroke="#9facaa" strokeWidth=".5"/></pattern>
 <filter id="uc-building-shadow" x="-20%" y="-25%" width="150%" height="170%"><feDropShadow dx="1" dy="20" stdDeviation="12" floodColor="#52665a" floodOpacity=".13"/></filter>
 <filter id="uc-mini-shadow" x="-35%" y="-35%" width="180%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#4a524c" floodOpacity=".16"/></filter>
 </defs>
 <ellipse cx="352" cy="635" rx="286" ry="23" fill="#afc3b4" opacity=".16"/>
 <g filter="url(#uc-building-shadow)">
  <path d="M59 100L259 100 286 145 286 263 423 263 423 90 648 90 648 580 423 580 423 586 286 586 286 587 59 587Z" fill="#dee8dd" transform="translate(2 12)"/>
  <path d="M59 100L259 100 286 145 286 263 423 263 423 90 648 90 648 580 423 580 423 586 286 586 286 587 59 587Z" fill="url(#uc-floor-stone)" stroke="#c1cec3" strokeWidth="3" strokeLinejoin="round"/>
  <path d="M59 100L259 100 286 145 286 263 423 263 423 90 648 90 648 580 423 580 423 586 286 586 286 587 59 587Z" fill="url(#uc-stone-tile)" opacity=".55"/>
 </g>
 <g opacity={fadedHistoric}>
  {heritage.map((r,i)=><RoomArt key={`h${i}`} r={r} i={i} floor={floor} bright={false}/>)}
  <rect x="159" y="118" width="29" height="449" fill="#fafaf6" opacity=".98"/>
  <path d="M172 130V558" stroke="#b5bfb3" strokeWidth="1.3" strokeDasharray="2 8"/>
  <path d="M67 105H255" stroke="#e6dfd0" strokeWidth="10" opacity=".86"/>
  {Array.from({length:11},(_,i)=><rect key={i} x={72+i*17} y="97" width="11" height="6" rx="1" fill="#bdd4d2" stroke="#a5b4b0" strokeWidth=".7"/>)}
  <text x="169" y="72" fill="#496154" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="2.6">HISTORIC WING</text>
 </g>
 <g opacity={fadedModern}>
  {modern.map((r,i)=><RoomArt key={`m${i}`} r={r} i={i} floor={floor} bright={floor==='1'}/>)}
  <rect x="531" y="116" width="23" height="441" fill="#fafbf7" opacity=".98"/>
  <path d="M541 126V544" stroke="#b3c4b9" strokeWidth="1.4" strokeDasharray="2 8"/>
  <path d="M432 98H638" stroke="#d7e5e2" strokeWidth="9" opacity=".9"/>
  {Array.from({length:11},(_,i)=><rect key={i} x={439+i*17} y="91" width="11" height="6" rx="1" fill="#bad8d8" stroke="#9db5b3" strokeWidth=".7"/>)}
  <text x="539" y="66" fill="#496154" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="2.6">NEW WING</text>
 </g>
 {/* Circulation / atrium. Route edges are aligned over these strips. */}
 <g>
  <rect x="281" y="264" width="144" height="322" fill="url(#uc-atrium-glass)" stroke="#b9cabb" strokeWidth="1.4"/>
  <path d="M174 349H538" stroke="#fdfcf8" strokeWidth="33" strokeLinecap="round"/>
  <path d="M352 283V633" stroke="#fffdf8" strokeWidth="30" strokeLinecap="round"/>
  <path d="M174 349H538 M352 283V626" stroke="#d6dfd5" strokeWidth=".9" strokeDasharray="4 11" fill="none"/>
  <rect x="293" y="415" width="120" height="106" rx="3" fill={floor==='1'?'#e3eedf':'#f1f0e9'} stroke="#becdbd" strokeWidth="1.2"/>
  {[310,344,379].map((x,i)=><g key={i} filter="url(#uc-mini-shadow)"><rect x={x-11} y="440" width="22" height="35" rx="8" fill="#a7c0ae"/><rect x={x-8} y="443" width="16" height="23" rx="6" fill="#d8e6d9"/></g>)}
  {[295,404].map((x,i)=><Plant key={i} x={x} y={398} r={9}/>)}
  <Plant x={352} y={553} r={13}/>
  <g><rect x="326" y="272" width="53" height="66" rx="3" fill="#f6f9f2" stroke="#a2b4a7" strokeWidth="1.9"/>
   {Array.from({length:7},(_,i)=><line key={i} x1="333" y1={282+i*7} x2="372" y2={282+i*7} stroke="#becbc0" strokeWidth="2.4"/>)}
   <path d="M352 324V286l-7 7m7-7l7 7" stroke="#387c60" strokeWidth="2.6" fill="none"/></g>
  <rect x="299" y="601" width="104" height="19" rx="8" fill="#e7eee5" stroke="#c7d5c7"/>
  <text x="351" y="613" textAnchor="middle" fontWeight="730" fontSize="9" fill="#76917e" letterSpacing="1.1">ARRIVAL</text>
  <text x="351" y="534" textAnchor="middle" fill="#7c9180" fontSize="10" fontWeight="700" letterSpacing="2">ATRIUM</text>
 </g>
 </g>;
}
