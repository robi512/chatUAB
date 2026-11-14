import {useEffect,useRef,useState} from 'react';
import {ArrowUp,Compass,LocateFixed,MapPin,X} from 'lucide-react';
import footprints from './campus-footprints.json';
import {bearing,type Point} from './walking';
import {distance} from './logic';

type Orientation=DeviceOrientationEvent&{webkitCompassHeading?:number;webkitCompassAccuracy?:number};
type GuideProps={path:Point[];fallback:Point;waypoint?:Point;close?:()=>void;destination?:string;instruction?:string;remaining?:string;next?:()=>void};
export function CameraGuide({path,fallback,waypoint,close,destination,instruction,remaining,next}:GuideProps){
  const video=useRef<HTMLVideoElement>(null),dialog=useRef<HTMLDialogElement>(null);
  const [heading,setHeading]=useState<number>(),[position,setPosition]=useState<Point>();
  const [error,setError]=useState(''),[ready,setReady]=useState(false),[locationState,setLocationState]=useState('Finding your location…');
  const [compassNotice,setCompassNotice]=useState(''),[attempt,setAttempt]=useState(0),[locationAttempt,setLocationAttempt]=useState(0);
  const orientationAPI=window.DeviceOrientationEvent as (typeof DeviceOrientationEvent&{requestPermission?:()=>Promise<string>})|undefined;
  useEffect(()=>{const el=dialog.current;if(el){el.showModal();return ()=>el.close();}},[]);
  useEffect(()=>{
    let active=true,stream:MediaStream|undefined;
    const camera=navigator.mediaDevices;
    if(!camera?.getUserMedia)setError('Camera is unavailable in this browser.');
    else camera.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(value=>{
      if(!active){value.getTracks().forEach(t=>t.stop());return;}
      stream=value;
      if(video.current){video.current.srcObject=value;setReady(true);}
    }).catch(()=>{if(active)setError('Camera unavailable. Allow camera access and retry.');});
    const update=(e:Event)=>{
      const o=e as Orientation;
      if(typeof o.webkitCompassHeading==='number'&&(o.webkitCompassAccuracy??0)>=0&&(o.webkitCompassAccuracy??0)<=35)setHeading(o.webkitCompassHeading);
      else if(o.absolute&&o.alpha!==null)setHeading((360-o.alpha)%360);
    };
    window.addEventListener('deviceorientation',update);window.addEventListener('deviceorientationabsolute',update);
    return ()=>{active=false;stream?.getTracks().forEach(t=>t.stop());window.removeEventListener('deviceorientation',update);window.removeEventListener('deviceorientationabsolute',update);};
  },[attempt]);
  useEffect(()=>{
    if(!navigator.geolocation){setLocationState('Location unavailable · route reference');return;}
    const watch=navigator.geolocation.watchPosition(p=>{
      const point:Point=[p.coords.latitude,p.coords.longitude];
      if(p.coords.accuracy<=45&&path.some(routePoint=>distance(routePoint,point)<60)){setPosition(point);setLocationState('Location found');}
      else {setPosition(undefined);setLocationState('Waiting for a nearby GPS fix');}
    },()=>{setPosition(undefined);setLocationState('Location unavailable · route reference');},{enableHighAccuracy:true,maximumAge:3000,timeout:8500});
    return ()=>navigator.geolocation.clearWatch(watch);
  },[path,locationAttempt]);
  const from=position??fallback;
  let nearest=0;
  for(let i=1;i<path.length;i++)if(distance(from,path[i])<distance(from,path[nearest]))nearest=i;
  const target=waypoint??path[Math.min(nearest+1,path.length-1)];
  const turnAngle=instruction?.toLowerCase().includes('left')?-48:instruction?.toLowerCase().includes('right')?48:0;
  const turnRoute=turnAngle<0?'M190 408 L190 240 Q190 166 121 166 L45 166':turnAngle>0?'M190 408 L190 240 Q190 166 259 166 L335 166':'M190 408 L190 83';
  const x=(p:Point)=>p[1],y=(p:Point)=>p[0];
  const xs=path.map(x),ys=path.map(y),west=Math.min(...xs),east=Math.max(...xs),south=Math.min(...ys),north=Math.max(...ys);
  const mapPoint=(p:Point)=>[12+96*(x(p)-west)/(east-west||1),8+66*(north-y(p))/(north-south||1)];
  const [dotX,dotY]=mapPoint(from);
  const content=<>
    <video ref={video} autoPlay muted playsInline aria-label="Rear camera"/>
    <div className="camera-shade"/>
    <div className="camera-top">
      <div className="camera-mini"><svg viewBox="0 0 120 82" aria-label="Walking route overview">{(footprints as Point[][]).filter(shape=>shape.some(p=>p[0]>=south-.00015&&p[0]<=north+.00015&&p[1]>=west-.00015&&p[1]<=east+.00015)).map((shape,i)=><polygon key={i} points={shape.map(p=>mapPoint(p).join(',')).join(' ')} fill="#426454" stroke="#638777" strokeWidth=".7"/>)}<polyline points={path.map(p=>mapPoint(p).join(',')).join(' ')} fill="none" stroke="#31d991" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx={dotX} cy={dotY} r="4" fill={position?'#a4ffdb':'#fff'} stroke="#113e31" strokeWidth="2"/></svg><small><LocateFixed size={12}/>{locationState}</small></div>
      {close&&<button className="camera-close icon" aria-label="Close camera" onClick={close}><X size={24}/></button>}
    </div>
    <div className="camera-center">
      {ready&&!error&&<div className="camera-path-preview"><svg viewBox="0 0 380 430" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Illustrative perspective route continuing to the next schematic turn">
        <defs><linearGradient id="camera-route-gradient" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#BEEAFF" stopOpacity=".28"/><stop offset="1" stopColor="#169AF0" stopOpacity=".82"/></linearGradient></defs>
        <path d={turnRoute} stroke="#001A3599" strokeWidth="33" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d={turnRoute} stroke="url(#camera-route-gradient)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path className="camera-path-dashes" d={turnRoute} stroke="#D5F4FF" strokeWidth="5" strokeDasharray="3 24" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {[0,1,2].map(i=><g key={i} transform={`translate(190 ${342-i*55}) scale(${1-i*.22})`}><path d="M-12 12 0-2 12 12" fill="none" stroke="#F4FCFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></g>)}
        {turnAngle!==0&&<path d={turnAngle<0?'M107 147 90 166 107 185':'M273 147 290 166 273 185'} fill="none" stroke="#F4FCFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>}
      </svg><small>CAMERA ROUTE PREVIEW · NOT LIVE AR</small></div>}
      {(!ready||error)&&<div className="camera-acquire"><Compass size={29}/><p>{error||'Opening camera…'}</p></div>}

    </div>
    <div className="camera-turn panel"><small><MapPin size={14}/> {destination??'Walking directions'}</small><strong className="camera-next-instruction"><ArrowUp size={26} style={{transform:'rotate('+turnAngle+'deg)'}}/>{instruction??'Follow the mapped route'}</strong>{remaining&&<span>{remaining}</span>}{next&&<button className="primary" onClick={next}>Next turn</button>}
      {error&&<button className="pill" onClick={()=>{setError('');setReady(false);setAttempt(n=>n+1);}}>Retry camera</button>}
      {!error&&locationState.startsWith('Location unavailable')&&<button className="pill" onClick={()=>{setLocationState('Finding your location…');setLocationAttempt(n=>n+1);}}>Retry location</button>}
      {ready&&heading===undefined&&orientationAPI?.requestPermission&&<button className="pill" onClick={async()=>{try{const status=await orientationAPI.requestPermission?.();setCompassNotice(status==='granted'?'Move the phone gently to acquire heading.':'Compass access is disabled.');}catch{setCompassNotice('Compass access is unavailable.');}}}>Enable compass</button>}
      {compassNotice&&<small role="status">{compassNotice}</small>}
    </div>
  </>;
  return close?<dialog className="camera-immersive" aria-label="Camera directions" ref={dialog} onCancel={e=>{e.preventDefault();close();}}>{content}</dialog>:<div className="camera-immersive camera-inline">{content}</div>;
}
