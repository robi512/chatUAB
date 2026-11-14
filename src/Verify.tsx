import {useEffect,useRef,useState} from 'react';
import {Calendar,Camera,ChevronRight,FileText,History,Image,Link2,MapPin,ScanLine,Users,Search,ShieldCheck,ExternalLink} from 'lucide-react';
import {inspectLink} from './risk';
import jsQR from 'jsqr';
import {events,sources,buildings,facilities} from './data';
import {eventTime,matchLocation,verify,type Result} from './logic';
import {External,Head,Row,Sheet} from './ui';
export const modes=['Event','Link','Poster','Location'] as const;
type Mode=typeof modes[number];
export type Check=Result&{input:string;mode:Mode};
export function Verify({openLocation,checks,addCheck,report}:{openLocation:(id:string)=>void;checks:Check[];addCheck:(check:Check)=>void;report:(text:string)=>void}){
  const [mode,setMode]=useState<Mode>('Event'),[form,setForm]=useState(false),[input,setInput]=useState(''),[expected,setExpected]=useState(''),[result,setResult]=useState<Result>(),[expanded,setExpanded]=useState(false),[recent,setRecent]=useState(false),[reporting,setReporting]=useState(false),[busy,setBusy]=useState(false);
  const [resultInput,setResultInput]=useState('');
  const [posterText,setPosterText]=useState('');
  const [stage,setStage]=useState('');
  const publicLookup=(site:'eventbrite'|'instagram')=>{const q=input.trim()||'University of Alberta events';const search=site==='eventbrite'?`site:eventbrite.ca ${q} Edmonton`:`site:instagram.com ${q} University of Alberta`;window.open('https://www.google.com/search?q='+encodeURIComponent(search),'_blank','noopener,noreferrer');};
  const runCheck=()=>{const job=++generation.current;setBusy(true);setStage('Comparing against saved campus source records…');setResult(undefined);window.setTimeout(()=>{if(generation.current!==job)return;finish(input,verify(mode==='Poster'&&!/^(https?:\/\/|www\.)/i.test(input)?'Event':mode,input,expected||undefined));setStage('');setBusy(false);},850);};
  const file=useRef<HTMLInputElement>(null);
  const generation=useRef(0);
  const event=events[0];
  const icons=[Calendar,Link2,Image,MapPin];
  function open(next:Mode){generation.current++;setBusy(false);setMode(next);setInput('');setExpected('');setPosterText('');setResult(undefined);setStage('');setForm(true);}
  function finish(value:string,outcome:Result){setResult(outcome);setResultInput(value);addCheck({...outcome,input:value,mode});setStage('');}
  async function scan(image:File){
    const job=++generation.current;
    setBusy(true);setStage('Scanning the image on this device…');setResult(undefined);setPosterText('');
    let bitmap:ImageBitmap|undefined;
    try{
      if(image.size>20*1024*1024)throw new Error('Choose an image under 20 MB.');
      bitmap=await createImageBitmap(image);
      const canvas=document.createElement('canvas');
      const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));
      canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const context=canvas.getContext('2d',{willReadFrequently:true});
      if(!context)throw new Error('Image processing is unavailable.');
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height);
      const code=jsQR(pixels.data,canvas.width,canvas.height);
      if(job!==generation.current)return;
      if(code){setInput(code.data);finish(code.data,verify(/^(https?:\/\/|www\.)/i.test(code.data)?'Poster':'Event',code.data));return;}
      const Detector=(window as unknown as {TextDetector?:new()=>{detect:(image:HTMLCanvasElement)=>Promise<{rawValue:string}[]>}}).TextDetector;
      if(Detector){
        const value=(await new Detector().detect(canvas)).map(x=>x.rawValue).join(' ');
        if(job!==generation.current)return;
        setPosterText(value);
        if(value){const url=value.match(/https?:\/\/[^\s]+/)?.[0];const match=events.find(e=>value.toLowerCase().includes(e.title.toLowerCase()));const candidate=url??match?.title??value;setInput(candidate);finish(candidate,verify(url?'Poster':'Event',candidate));return;}
      }
      finish(image.name,{status:'Unable to Check',detail:'No readable QR code or poster text was found. Paste the event title or URL below to compare it manually.',at:Date.now()});
    }catch(error){if(job===generation.current)finish(image.name,{status:'Unable to Check',detail:error instanceof Error?error.message:'The image could not be processed.',at:Date.now()});}
    finally{bitmap?.close();if(job===generation.current){setBusy(false);setStage('');}}
  }
  useEffect(()=>()=>{generation.current++;},[]);
  const risk=result&&(mode==='Link'||mode==='Poster'&&/^(https?:\/\/|www\.)/i.test(resultInput))?inspectLink(resultInput):null;
  return <section className="page verify-page">
    <div className="verify-title-wrap"><Head title="Verify" subtitle="Find evidence for events, links, and posters." action={<button className="icon circle" aria-label="Scan poster" onClick={()=>open('Poster')}><ScanLine/></button>}/><span className="verify-beta-badge">BETA</span></div>
    <p className="verify-intro">A helpful first check — not an official event certification.</p>
    <div className="verify-motion-card" role="img" aria-label="Animated poster scanning illustration"><ShieldCheck size={72}/><div className="verify-motion-frame"><ScanLine size={25}/><span className="verify-motion-line"/></div><strong>Scan · compare · explore sources</strong><small>QR detection runs locally on your device</small></div>
    <div className="verify-modes">{modes.map((m,i)=>{const Icon=icons[i];return <button key={m} className={mode===m?'selected':''} onClick={()=>open(m)}><Icon size={25}/>{m}</button>;})}</div>
    <div className="verify-source-links">
      <h3>Look for public evidence</h3><p>Open Eventbrite or public Instagram search results to compare names, organizers, dates, and registration links. These searches are manual; ChatUAB does not claim a live platform connection.</p>
      <div className="verify-source-actions"><button type="button" onClick={()=>publicLookup('eventbrite')}><Search size={17}/> Eventbrite <ExternalLink size={13}/></button><button type="button" onClick={()=>publicLookup('instagram')}><Search size={17}/> Public Instagram <ExternalLink size={13}/></button></div>
    </div>
    <div className="verify-listed-sources"><div><strong>Organizer listings saved locally</strong><small>Checked November 14, 2026 · Not live certification</small></div><div className="verify-source-picks">{events.slice(0,4).map(event=><button key={event.id} onClick={()=>{open('Event');setInput(event.title);}}><ShieldCheck size={16}/><span>{event.title}</span><ChevronRight size={14}/></button>)}</div></div>
    <h2 className="section-title">More to Verify</h2>
    <div className="panel list"><Row icon={<Link2/>} title="Check a link" onClick={()=>open('Link')}/><Row icon={<MapPin/>} title="Verify a location (room, building)" onClick={()=>open('Location')}/><Row icon={<History/>} title="Review recent checks" onClick={()=>setRecent(true)}/><Row icon={<FileText/>} title="Report an item (QR, poster, etc.)" onClick={()=>setReporting(true)}/></div>
    {form&&<Sheet title={'Verify '+mode.toLowerCase()} close={()=>{generation.current++;setBusy(false);setForm(false);}}>
      {mode==='Poster'&&<div className="stack"><p>Process a QR code on this device. Text recognition depends on the browser.</p><input ref={file} type="file" accept="image/*" hidden onChange={e=>{if(e.target.files?.[0])void scan(e.target.files[0]);e.target.value='';}}/><button className="primary" onClick={()=>file.current?.click()}><Image size={18}/> Upload poster</button><label className="pill"><Camera size={18}/> Use camera<input className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={e=>{if(e.target.files?.[0])void scan(e.target.files[0]);e.target.value='';}}/></label>{posterText&&<p>Detected text: {posterText}</p>}</div>}
      <form className="stack" onSubmit={e=>{e.preventDefault();runCheck();}}>
        {mode==='Event'&&<label>Choose an event<select value={events.some(e=>e.title===input)?input:''} onChange={e=>setInput(e.target.value)}><option value="">Enter a title</option>{events.map(e=><option key={e.id}>{e.title}</option>)}</select></label>}
        <label>{mode==='Link'?'URL':mode==='Location'?'Building, classroom or facility':mode==='Poster'?'Detected URL or event title':'Event title'}<input value={input} onChange={e=>setInput(e.target.value)} placeholder={mode==='Location'?'CCIS 1-150':mode==='Link'?'https://www.ualberta.ca/en/maps.html':''}/></label>
        {mode==='Event'&&<label>Venue on your listing (optional)<input value={expected} onChange={e=>setExpected(e.target.value)} placeholder="University Commons"/></label>}
        {mode==='Link'&&<label>Compare against an official record<select value={expected} onChange={e=>setExpected(e.target.value)}><option value="">Any catalog match</option>{Object.entries(sources).map(([key,url])=><option key={key} value={url}>{key}</option>)}</select></label>}
        <button className="primary" disabled={busy||!input.trim()}>Compare with sources</button>
      </form>
      {busy&&<div className="verify-stage" role="status"><span className="verify-stage-spinner"/>{stage||'Processing on your device…'}</div>}
      {result&&<div className="verify-source-links"><h3>Double-check public listings</h3><div className="verify-source-actions"><button onClick={()=>publicLookup('eventbrite')}>Eventbrite <ExternalLink size={14}/></button><button onClick={()=>publicLookup('instagram')}>Instagram <ExternalLink size={14}/></button></div></div>}
      {result&&<article key={result.at} className="result panel verify-reveal" role="status"><strong>{result.status}</strong><p>{result.detail}</p>{risk&&<div className="risk-summary"><strong>{risk.label}</strong>{risk.host&&<small>Destination host: {risk.host}</small>}{risk.flags.length>0&&<ul>{risk.flags.map(flag=><li key={flag}>{flag}</li>)}</ul>}<small>Local checks only. This does not establish site safety or image authenticity.</small></div>}{result.source&&<small className="source-label">Source: {result.source}</small>}{mode==='Location'&&result.status==='Confirmed Match'&&<button className="pill" onClick={()=>{const {building:b,facility:f}=matchLocation(resultInput);if(b||f){setForm(false);openLocation(b?.id??f!.building);}}}>Show location on map</button>}<small>Checked {new Date(result.at).toLocaleString()}</small></article>}
    </Sheet>}
    {recent&&<Sheet title="Recent checks" close={()=>setRecent(false)}>{checks.length?checks.map((c,i)=><div className="result panel" key={i}><strong>{c.status} · {c.mode}</strong><p>{c.input}</p><small>{new Date(c.at).toLocaleString()}</small></div>):<p>No checks yet.</p>}</Sheet>}
    {reporting&&<Sheet title="Report an item" close={()=>setReporting(false)}><form className="stack" onSubmit={e=>{e.preventDefault();const value=new FormData(e.currentTarget).get('report');if(typeof value==='string'&&value.trim()){report(value.trim());setReporting(false);}}}><label>What should be reviewed?<textarea required name="report" rows={4}/></label><p>Reports stay on this device.</p><button className="primary">Save report locally</button></form></Sheet>}
  </section>;
}
