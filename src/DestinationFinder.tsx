import {CampusArt} from './CampusArt';
import {useState} from 'react';
import {Layers3,MapPin} from 'lucide-react';
import {buildings,building,facilities,type Facility} from './data';
import {findPlaces} from './logic';
import {isIndoorBuilding} from './IndoorNavModel';

export function DestinationFinder({kind,start,routingStatus}:{kind:string;routingStatus:string;start:(facility:Facility,origin:string,camera:boolean,course:string)=>void}){
  const [query,setQuery]=useState(''),[picked,setPicked]=useState<Facility>(),[origin,setOrigin]=useState(''),[courseCode,setCourseCode]=useState('');
  const isClass=kind==='Classrooms';
  const course=isClass&&/^[a-z]{2,6}\s*\d{3}[a-z]?$/i.test(query.trim());
  const suggestions=isClass?(query.trim()?findPlaces(query,kind):['BUS 1-05','BUS 2-05','CSC','CCIS 1-140'].flatMap(q=>findPlaces(q,kind).slice(0,1))).slice(0,8):facilities.filter(f=>f.category===kind&&!f.sample);
  const ranked=suggestions;
  const exactRoom=suggestions.find(f=>f.name.toLowerCase().replace(/[^a-z0-9]/g,'')===query.toLowerCase().replace(/[^a-z0-9]/g,''));
  const target=isClass?(picked??exactRoom??(query.trim()&&suggestions.length===1?suggestions[0]:undefined)):ranked[0];
  return <div className="stack finder">
    {isClass&&<><label>What class are you taking?<input value={courseCode} maxLength={40} onChange={e=>setCourseCode(e.target.value)} placeholder="e.g. CMPUT 174 (optional)"/></label><label>Which room is on your schedule?<input value={query} onChange={e=>{setQuery(e.target.value);setPicked(undefined);}} placeholder="e.g. BUS 1-05"/></label>
    {course&&<p>Enter the building and room from Bear Tracks for this course.</p>}
    <div className="stack">{suggestions.map(f=><button className="finder-result panel" key={f.id} aria-pressed={picked?.id===f.id} onClick={()=>{setPicked(f);navigator.vibrate?.(12);}}><CampusArt name="Classrooms"/><span><strong>{f.name}</strong><small>{f.detail.split(' · ')[0]} · {f.floor}</small></span></button>)}</div>
    {!course&&query&&!suggestions.length&&<p>No matching room in the Registrar’s directory.</p>}</>}

    {!isClass&&origin&&target&&<div className="result panel"><div className="finder-amenity"><CampusArt name={kind}/><strong>{target.name}</strong></div><p>{target.floor} · {building(target.building).name}</p></div>}
    {!isClass&&!suggestions.length&&<p>No verified {kind.toLowerCase()} locations are available in the directory.</p>}
    {target&&!target.building&&<p>This room is verified. Its building pin is still missing from the local routing map.</p>}
    <div className="finder-actions">{target&&<button className="primary" disabled={!target.building||!!routingStatus} onClick={()=>{if(target.building)start(target,origin||target.building,false,courseCode.trim());}}><Layers3 size={20}/> Open indoor map</button>}</div>
    {routingStatus&&<p role="status" className="calculating-route">{routingStatus}</p>}
    {target?.building&&<small>{isIndoorBuilding(target.building)?'Indoor preview available. Floor geometry is illustrative, not a verified room-level route.':'No indoor map is available for this building yet.'}</small>}

  </div>;
}
