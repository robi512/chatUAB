import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft,ArrowRight,Camera,Compass,MapPin,Navigation,ShieldAlert,X} from 'lucide-react';
import './ucomm-camera.css';

type Props={destination:string;floor:string;instruction:string;step:number;totalSteps:number;hasRoute:boolean;onClose:()=>void;onNext:()=>void};
/** Camera preview is deliberately *not* world-anchored AR. It visualizes the
 * selected schematic route instruction over a permitted camera feed. */
export function UCommCameraPreview({destination,floor,instruction,step,totalSteps,hasRoute,onClose,onNext}:Props){
 const closeRef=useRef(onClose);
 closeRef.current=onClose;
 const video=useRef<HTMLVideoElement>(null);
 const closeButton=useRef<HTMLButtonElement>(null);
 const [status,setStatus]=useState<'starting'|'ready'|'unavailable'>('starting');
 const [cameraError,setCameraError]=useState('');
 useEffect(()=>{
  let open=true;
  let stream:MediaStream|undefined;
  const originalOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  closeButton.current?.focus();
  const keydown=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();closeRef.current();}};
  window.addEventListener('keydown',keydown);
  if(!navigator.mediaDevices?.getUserMedia){setStatus('unavailable');setCameraError('Camera preview is not supported in this browser.');}
  else navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(s=>{
   if(!open){s.getTracks().forEach(t=>t.stop());return;}
   stream=s;
   if(video.current){video.current.srcObject=s;void video.current.play().catch(()=>{});}
   setStatus('ready');
  }).catch(()=>{if(open){setStatus('unavailable');setCameraError('Camera permission was not granted. You can still follow the illustrated route.');}});
  return ()=>{open=false;stream?.getTracks().forEach(t=>t.stop());window.removeEventListener('keydown',keydown);document.body.style.overflow=originalOverflow;};
 },[]);
 const turn=instruction.toLowerCase().includes('left')?'left':instruction.toLowerCase().includes('right')?'right':'straight';
 const routeShape=turn==='left'?'M170 490V279 Q170 211 109 211 H44':turn==='right'?'M170 490V279 Q170 211 231 211 H302':'M170 490V125';
 return createPortal(<div className="uc-camera-modal" role="dialog" aria-modal="true" aria-label="University Commons camera route preview">
  <div className="uc-camera-stage">
   <video ref={video} autoPlay muted playsInline aria-label="Live camera view"/>
   <div className="uc-camera-no-video" aria-hidden="true"/>
   {status==='unavailable'&&<div className="uc-camera-permission"><Camera size={32}/><strong>Camera not available</strong><p>{cameraError}</p></div>}
   <div className="uc-camera-shade"/>
   <header className="uc-camera-top"><button ref={closeButton} onClick={onClose} aria-label="Close camera preview"><ArrowLeft size={21}/></button><div><span>UNIVERSITY COMMONS</span><strong>Floor {floor} <span>·</span> Camera preview</strong></div><div className="uc-camera-top-compass"><Compass size={21}/></div></header>
   {hasRoute&&<div className="uc-camera-path" aria-hidden="true"><svg viewBox="0 0 346 536" preserveAspectRatio="xMidYMid meet">
    <defs><linearGradient id="uc-cam-line" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7ecdf8" stopOpacity=".35"/><stop offset="1" stopColor="#1689e8" stopOpacity=".91"/></linearGradient></defs>
    <path d={routeShape} stroke="#07253b" strokeOpacity=".37" strokeWidth="38" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={routeShape} stroke="url(#uc-cam-line)" strokeWidth="25" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={routeShape} className="uc-camera-flow" stroke="#ffffff" strokeWidth="3" strokeDasharray="2 24" fill="none" strokeLinecap="round"/>
    {[0,1,2].map(i=><g key={i} transform={`translate(170 ${440-i*65}) scale(${1-i*.18})`}><path d="M-14 8 L0 -8 L14 8" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></g>)}
    {turn!=='straight'&&<path d={turn==='left'?'M80 193L61 211L80 229':'M266 193L285 211L266 229'} stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>}
   </svg></div>}
   <span className="uc-camera-beacon"><i/> {hasRoute?'ROUTE INSTRUCTION PREVIEW':'SELECT A STARTING POINT'}</span>
   <div className="uc-camera-bottom">
    <div className="uc-camera-destination"><div><span>YOUR DESTINATION</span><strong>{destination}</strong><small><MapPin size={13}/> University Commons · Floor {floor}</small></div><span className="uc-camera-destination-icon"><Navigation size={23}/></span></div>
    <div className="uc-camera-instruction"><span><Navigation size={24}/></span><div><small>UP NEXT · {step} OF {totalSteps}</small><strong>{instruction}</strong></div></div>
    <div className="uc-camera-actions"><button className="uc-camera-exit" type="button" onClick={onClose}><X size={16}/> Close</button><button className="uc-camera-next" type="button" disabled={!hasRoute||step>=totalSteps} onClick={onNext}>{step>=totalSteps?'Destination reached':'Next turn'} <ArrowRight size={17}/></button></div>
    <p className="uc-camera-honesty"><ShieldAlert size={13}/> Directional overlay is illustrative; not indoor AR positioning.</p>
   </div>
  </div>
 </div>,document.body);
}
