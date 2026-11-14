import {useEffect,useMemo,useState} from 'react';
import {ArrowUp,ArrowUpLeft,ArrowUpRight,Camera,Volume2,VolumeX,X} from 'lucide-react';
import {CameraGuide} from './CameraGuide';
import {distance} from './logic';
import {walkingSteps,type Point} from './walking';
export function WalkGuide({path,destination,initialCamera,exit,progress}:{path:Point[];destination:string;initialCamera:boolean;exit:()=>void;progress:(point:Point)=>void}){
  const steps=useMemo(()=>walkingSteps(path),[path]);
  const [step,setStep]=useState(0),[mode,setMode]=useState<'manual'|'gps'|'sim'>(initialCamera?'gps':'manual'),[voice,setVoice]=useState(false),[camera,setCamera]=useState(initialCamera),[status,setStatus]=useState('');
  const current=steps[step],previous=steps[step-1]?.meters??0,total=steps.at(-1)?.meters??0;
  const Icon=current?.instruction==='Turn left'?ArrowUpLeft:current?.instruction==='Turn right'?ArrowUpRight:ArrowUp;
  useEffect(()=>{
    if(mode!=='sim'||!current)return;
    const timer=setTimeout(()=>{progress(path[current.index]);setStep(step+1);},2400);
    return ()=>clearTimeout(timer);
  },[mode,current,path,step,progress]);
  useEffect(()=>{
    if(mode!=='gps')return;
    if(!navigator.geolocation){setStatus('GPS is unavailable. Use Next step.');return;}
    const watch=navigator.geolocation.watchPosition(p=>{
      const here:Point=[p.coords.latitude,p.coords.longitude];
      if(p.coords.accuracy>55){setStatus('Waiting for a more accurate GPS fix.');return;}
      if(Math.min(...path.map(point=>distance(point,here)))>45){setStatus('You’re away from the mapped path.');return;}
      setStatus('GPS tracking');progress(here);
      if(current&&distance(path[current.index],here)<18)setStep(step+1);
    },()=>setStatus('GPS permission denied or location unavailable. Use Next step.'),{enableHighAccuracy:true});
    return ()=>navigator.geolocation.clearWatch(watch);
  },[mode,path,current,step,progress]);
  useEffect(()=>{
    if(!voice||!('speechSynthesis' in window))return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(current?'In '+Math.round(current.meters-previous)+' meters, '+current.instruction:'End of mapped route'));
    return ()=>speechSynthesis.cancel();
  },[current,previous,voice]);
  return <section className="walk-guide panel" aria-label="Walking navigation">
    <div className="walk-head"><div className="turn-icon"><Icon size={30}/></div><div role="status"><small>{destination}{mode==='sim'?' · Route preview':''}</small><strong>{current?'In '+Math.round(current.meters-previous)+' m · '+current.instruction:'End of mapped route'}</strong><small>{Math.round(total-previous)} m left · {Math.ceil((total-previous)/75)} min</small></div><button className="icon" aria-label="Exit navigation" onClick={exit}><X size={21}/></button></div>
    {status&&mode==='gps'&&<small>{status}</small>}
    <div className="actions">
      {current&&<><button className="pill" onClick={()=>{progress(path[current.index]);setStep(step+1);}}>Next step</button><button className="pill" onClick={()=>setMode(mode==='sim'?'manual':'sim')}>{mode==='sim'?'Pause':'Preview route'}</button><button className="pill" onClick={()=>setMode(mode==='gps'?'manual':'gps')}>{mode==='gps'?'Stop GPS':'Use GPS'}</button></>}
      <button className="icon" aria-label={voice?'Mute directions':'Speak directions'} onClick={()=>setVoice(v=>!v)}>{voice?<Volume2 size={19}/>:<VolumeX size={19}/>}</button>
      <button className="primary camera-launch" aria-label={camera?'Close camera':'Camera preview'} onClick={()=>setCamera(v=>!v)}><Camera size={23}/>{camera?'Back to map':'Camera'}</button>
    </div>
    {camera&&<div className="walk-camera"><CameraGuide path={path} fallback={path[steps[step-1]?.index??0]} waypoint={current?path[current.index]:undefined} close={()=>setCamera(false)} next={current?()=>{progress(path[current.index]);setStep(step+1);}:undefined} destination={destination} instruction={current?'In '+Math.round(current.meters-previous)+' m · '+current.instruction:'End of mapped route'} remaining={Math.round(total-previous)+' m left · '+Math.ceil((total-previous)/75)+' min'}/></div>}
  </section>;
}
