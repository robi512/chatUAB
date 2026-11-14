import {useMemo,useState} from 'react';
import {ArrowLeft,BookOpen,ChevronRight,MapPin,Navigation,Search,X} from 'lucide-react';
import {buildings,facilities} from './data';
import {ServiceArt,type ArtName} from './ServiceArt';
import {isIndoorBuilding} from './IndoorNavModel';
/** A building-level campus locator, not a room-level positioning system. */
export function FacilitySignal({category,onClose,onBuilding}:{category:'Water'|'Microwaves'|'Outlets';onClose:()=>void;onBuilding:(buildingId:string,facilityId:string)=>void}){
  const items=useMemo(()=>facilities.filter(f=>!f.sample&&(category==='Outlets'?f.category==='Outlets':f.category===category)),[category]);
  const [picked,setPicked]=useState(items[0]?.id??'');
  const [query,setQuery]=useState('');
  const active=items.find(i=>i.id===picked)??items[0];
  const points=items.filter(i=>i.name.toLowerCase().includes(query.toLowerCase()));
  const coords=(id:string)=>{const b=buildings.find(item=>item.id===id);return b?.point??[53.526,-113.525];};
  const all=items.map(i=>coords(i.building)),lats=all.map(c=>c[0]),lons=all.map(c=>c[1]);
  const minLat=Math.min(...lats)-.0018,maxLat=Math.max(...lats)+.0018,minLon=Math.min(...lons)-.0026,maxLon=Math.max(...lons)+.0026;
  const xy=(id:string):[number,number]=>{const [lat,lon]=coords(id);return [12+(lon-minLon)/(maxLon-minLon)*76,84-(lat-minLat)/(maxLat-minLat)*68];};
  const art:ArtName=category==='Water'?'water':category==='Outlets'?'outlets':'microwave';
  return <section className="signal-screen" aria-label={`${category} building locator`}>
    <div className="signal-top"><button onClick={onClose} aria-label="Back to indoor map"><ArrowLeft/></button><div><span className="signal-kicker">CAMPUS ESSENTIALS</span><h1>Find {category.toLowerCase()}</h1></div></div>
    <label className="signal-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${category.toLowerCase()} locations`} /></label>
    <div className="signal-map" role="group" aria-label="Approximate campus building positions">
      <div className="signal-map-grid"/><div className="signal-campus-label">NORTH CAMPUS</div>
      {points.map(i=>{const [x,y]=xy(i.building);return <button key={i.id} className={'signal-pin '+(active?.id===i.id?'active':'')} style={{left:x+'%',top:y+'%'}} onClick={()=>setPicked(i.id)} aria-label={`Select ${i.name}`}><span className="signal-ripple"/><span className="signal-pin-core"><ServiceArt name={art} size={43}/></span><small>{buildings.find(b=>b.id===i.building)?.short??i.building}</small></button>;})}
      <div className="signal-map-note"><span className="signal-status-dot"/> Building locations · not exact equipment positions</div>
    </div>
    {active?<div className="signal-place-card"><div className="signal-place-icon"><ServiceArt name={art} size={84}/></div><div className="signal-place-info"><small>SELECTED CAMPUS LOCATION</small><h2>{active.name}</h2><p><MapPin size={14}/>{buildings.find(b=>b.id===active.building)?.name} · {active.floor}</p><p className="signal-place-detail">{active.detail}</p><button className="signal-primary" onClick={()=>onBuilding(active.building,active.id)}><Navigation size={17}/> {isIndoorBuilding(active.building)?'Open indoor guide':'View location details'} <ChevronRight size={18}/></button></div></div>:<div className="signal-place-card"><BookOpen/> No mapped facilities in this category yet.</div>}
  </section>;
}
