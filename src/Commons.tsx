import {CommonsCutaway} from './CommonsCutaway';
import {useState} from 'react';
import {ArrowUpRight,BookOpen,Building2,DoorOpen,Layers,MapPin,Navigation,Users,Armchair,AudioLines} from 'lucide-react';
import {photo} from './data';

export const commonsPlaces=[
  {floor:1,name:'InfoLink',detail:'Campus information · main floor'},
  {floor:1,name:'Undergraduate Computing Science association',detail:'Student group · main floor'},
  {floor:1,name:'Main-floor study seating',detail:'Open seating near the windows'},
  {floor:1,name:'Computing Science labs',detail:'Teaching labs · first floor'},
  {floor:2,name:'Student Service Centre',detail:'Student services · second floor'},
  {floor:2,name:'Computing Science labs',detail:'Teaching labs · second floor'},
  {floor:3,name:'McCullough Reading Room',detail:'Historic study space · third floor'},
  {floor:4,name:'Cupola corridor',detail:'View the cupola from the corridor'},
  {floor:5,name:'Computing Science main office',detail:'Room 5-140 · confirm access'},
  {floor:7,name:'Computing Science mailing address',detail:'Room 7-213 · confirm access'},
];
export function Commons({directions}:{directions:()=>void}){
  const [floor,setFloor]=useState(1);
  const [query,setQuery]=useState('');
  const matches=commonsPlaces.filter(p=>query.trim()?p.name.toLowerCase().includes(query.trim().toLowerCase())||p.detail.toLowerCase().includes(query.trim().toLowerCase()):p.floor===floor);
  return <section className="commons-detail">
    <div className="commons-photo"><img src={photo('commons')} alt="Historic exterior of the building now known as University Commons"/><span><MapPin size={14}/> North Campus</span></div>
    <div className="commons-body">
      <h2>University Commons</h2><p>Student services, classrooms and study spaces</p>
      <button className="primary" onClick={directions}><Navigation size={17}/> Walk to University Commons</button>
      <CommonsCutaway floor={floor} select={n=>{setFloor(n);setQuery('');}}/><div className="commons-floor-title"><Layers size={18}/><h3>Inside the building</h3></div>
      <div className="commons-floors" aria-label="University Commons floors">{Array.from({length:7},(_,i)=>i+1).map(n=><button key={n} aria-pressed={n===floor&&!query} onClick={()=>{setFloor(n);setQuery('');}}>{n}</button>)}</div>
      <label className="commons-search">Find a room or service<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try 5-140 or Reading Room"/></label>
      <div key={query?'search':floor} className="commons-rooms">
        {matches.map(p=><article key={p.floor+p.name}><div className="room-icon">{p.name.includes('study')||p.name.includes('Reading')?<BookOpen size={18}/>:<DoorOpen size={18}/>}</div><div><strong>{p.name}</strong><small>{p.detail}</small></div><span>F{p.floor}</span></article>)}
        {!matches.length&&<p>{query?'No matching place in the published directory.':'Directory entries for this floor are coming soon.'}</p>}
      </div>
      <small>{floor>=5&&!query?'Department levels · confirm access before visiting. ':'Student-facing floor directory. '}Indoor corridor directions are coming soon.</small>
    </div>
  </section>;
}

export function StudyActivity({tick,crowded,recommended}:{tick:number;crowded:boolean;recommended:boolean}){
  const offset=[0,2,1,4,3,1][tick%6];
  const people=(crowded?39:13)+offset;
  return <div className="activity-card panel"><div><strong>Study activity</strong><span className="activity-badge">{recommended?'Recommended for you':crowded?'Busy':'Good for focus'}</span></div><div className="activity-stats">
    <span><AudioLines/><strong>{(crowded?64:41)+offset} dB</strong><small>Sound level</small></span>
    <span><Users/><strong>{people}</strong><small>Est. people</small></span>
    <span><Armchair/><strong>{50-people}</strong><small>Est. seats</small></span>
  </div><small>Illustrative readings</small></div>;
}
