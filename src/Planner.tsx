import {useState} from 'react';
import {Calendar,Clock,MapPin,Trash2} from 'lucide-react';
import {buildings,building} from './data';
import {downloadCalendar} from './calendar';

export type Plan = {id:string;title:string;building:string;room:string;start:string;end:string};
export function Planner({plans,add,remove,openMap}:{plans:Plan[];add:(item:Plan)=>void;remove:(id:string)=>void;openMap:(id:string,room:string)=>void}){
  const [error,setError]=useState('');
  const [creating,setCreating]=useState(!plans.length);
  return <div className="stack planner">
    <p>Add classes, study sessions, or campus meetups to your personal schedule. Times follow this device’s time zone.</p>
    {plans.map(plan=><article key={plan.id} className="result panel stack">
      <div><strong>{plan.title}</strong><p><Clock size={15}/> {new Date(plan.start).toLocaleString()} · {new Date(plan.end).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</p><small><MapPin size={14}/> {building(plan.building).name}{plan.room?' · '+plan.room:''}</small></div>
      <div className="actions"><button className="pill" onClick={()=>openMap(plan.building,plan.room)}>Open map</button><button className="pill" onClick={()=>downloadCalendar(plan.id,plan.title,plan.start,plan.end,building(plan.building).name+' '+plan.room)}><Calendar size={15}/> Export</button><button className="icon" aria-label={'Remove '+plan.title} onClick={()=>remove(plan.id)}><Trash2 size={18}/></button></div>
    </article>)}
    {creating?<form className="stack result panel" onSubmit={e=>{
      e.preventDefault();
      const data=new FormData(e.currentTarget);
      const value=(key:string)=>String(data.get(key)??'').trim();
      const start=new Date(value('start')),end=new Date(value('end'));
      if(!value('title')||!Number.isFinite(+start)||!Number.isFinite(+end)||+end<=+start){setError('Enter a title and an end time after the start time.');return;}
      add({id:crypto.randomUUID(),title:value('title'),building:value('building'),room:value('room'),start:start.toISOString(),end:end.toISOString()});
      setError('');setCreating(false);
    }}>
      <label>Title<input name="title" required maxLength={100} placeholder="Chemistry lecture"/></label>
      <label>Building<select name="building">{buildings.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label>Room or meeting point<input name="room" maxLength={60} placeholder="Optional"/></label>
      <label>Starts<input type="datetime-local" name="start" required/></label>
      <label>Ends<input type="datetime-local" name="end" required/></label>
      {error&&<p role="alert">{error}</p>}<button className="primary">Save to schedule</button>
    </form>:<button className="primary" onClick={()=>setCreating(true)}>Add a campus plan</button>}
  </div>;
}
