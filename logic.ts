import {building,buildings,events,facilities,sourceDate,sources,spaces,spaceBuilding,type Filter,type Space} from './data';
export type Reading={space:string;score:number;at:number;kind:'Live'|'Demo'|'User-submitted'};
export type Preferences={group:boolean;power:boolean;member:boolean};
export const defaults:Preferences={group:false,power:true,member:false};
export const classify=(score:number)=>score<33?'Quiet':score<66?'Moderate':'Loud';
export const distance=(a:[number,number],b:[number,number])=>Math.hypot((a[0]-b[0])*111200,(a[1]-b[1])*66000);
export function rank(readings:Reading[],preferences:Preferences,position?:[number,number],now=Date.now()){
  return spaces.map(space=>{
    const reading=readings.filter(r=>r.space===space.id).sort((a,b)=>b.at-a.at)[0];
    const freshness=reading?Math.max(0,1-(now-reading.at)/7200000):0;
    const meters=position?distance(position,building(spaceBuilding(space.id)).point):null;
    const score=50+(space.zone==='Quiet'?12:10)+(space.outlets&&preferences.power?18:0)
      +(preferences.group&&space.group?8:0)+(space.always&&preferences.member?5:0)
      -(meters===null?0:Math.min(18,meters/70))+(reading?(38-reading.score)*freshness:0);
    return {space,score,reading,meters,freshness};
  }).sort((a,b)=>b.score-a.score);
}
export function matches(s:Space,f:Filter,member:boolean){
  switch(f){
    case 'Quiet': return s.zone==='Quiet'||s.zone==='Silent';
    case 'Silent': return s.zones.some(z=>/silent/i.test(z));
    case 'Group': return s.group;
    case 'Outlets': return s.outlets;
    case 'Wi-Fi': return s.wifi;
    case 'Open now': case '24/7': return !!s.always&&member;
    case 'Bookable': return s.bookable;
    case 'Individual study': return s.zone!=='Discussion';
    case 'Accessibility': return s.accessible;
    default: return true;
  }
}
const clean=(s:string)=>s.toLowerCase().trim().replace(/[^a-z0-9 -]/g,'').replace(/\s+/g,' ');
const searchText=(value:string)=>value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f’']/g,'').replace(/(\d)(?:\s*[-–—]\s*|\s+)(\d)/g,'$1$2').replace(/[^a-z0-9]+/g,' ').trim();
const aliases:Record<string,string>={Water:'water fountain bottle refill hydration',Outlets:'outlet charging power plug electrical',Food:'dining cafe restaurant cafeteria',Washrooms:'restroom bathroom toilet','Accessible washrooms':'accessible restroom bathroom toilet',Elevators:'lift','Indoor connections':'pedway corridor',Classrooms:'class room lecture theatre'};
export function searchMatches(query:string,fields:string[]){
  const index=searchText(fields.join(' '));
  return searchText(query).split(' ').every(word=>/^l?\d{3,}[a-z]?$/.test(word)?index.split(' ').includes(word):index.includes(word)||word.length>3&&word.endsWith('s')&&index.includes(word.slice(0,-1)));
}
export function findPlaces(query:string,category='All'){
  return facilities.filter(f=>{
    const b=building(f.building);
    return (category==='All'||f.category===category)&&searchMatches(query,[f.name,b.name,b.short,f.category,f.floor,aliases[f.category]??'']);
  });
}
export function findBuildings(query:string){
  return buildings.filter(b=>searchMatches(query,[b.name,b.short]));
}
export function searchStudy(space:Space,query:string){
  return searchMatches(query,[space.name,space.floor,space.zone,space.description,...space.zones,
    space.outlets?'outlets charging power plugs':'',space.wifi?'wifi wireless internet':'',space.group?'group rooms':'',space.bookable?'bookable booking':'']);
}
export function ask(query:string,readings:Reading[],prefs:Preferences,position?:[number,number]){
  const q=clean(query);
  const room=q.match(/\b(?:l)?\d-\d{2,3}[a-z]?\b/);
  if(room){
    const found=findPlaces(room[0]).filter(f=>!f.sample);
    return {text:found.length?'I found this in the university directory. Check building signage for the final indoor segment.':'I couldn’t confirm that room in the directory I have.',ids:found.map(f=>f.id)};
  }
  if(/(next|my) class|where.?s my class|timetable/.test(q))return {text:'Which building or room number is your class in? I can search known rooms and open the map, but I cannot see your personal timetable unless you add it.',ids:[]};
  if(/print|photocop/.test(q))return {text:'I do not have a verified list of currently available campus printers. Check the university or library printing information before travelling.',ids:[]};
  if(/quiet|silent|study|charg|outlet|laptop/.test(q)){
    const power=/charg|outlet|laptop/.test(q),group=/group/.test(q);
    const items=rank(readings,{...prefs,power:power||prefs.power,group:group||prefs.group},position).filter(({space})=>(!power||space.outlets)&&(!group||space.group));
    return {text:items.length?(group?'These libraries have group rooms. Use the official booking page to check availability.':'Here are study spaces ranked by documented amenities, your preferences and any recent local noise readings.'):'I couldn’t find a documented space with those amenities.',ids:items.map(x=>x.space.id)};
  }
  const requested=buildings.find(b=>new RegExp('\\b'+b.short.toLowerCase()+'\\b').test(q));
  if(requested)return {text:'I found '+requested.name+'. Open the map for outdoor directions and available floor information.',ids:[requested.id]};
  if(/water|fountain|refill/.test(q))return {text:position?'The directory lists a water refill station at SUB. I cannot confirm this is your closest indoor fountain.':'Where are you starting from? I have a documented refill option in SUB, but I cannot identify the nearest fountain without a starting point.',ids:['sub-water']};
  if(/event|hackathon/.test(q))return {text:'The event feed includes the organizer-listed HackED Beta and clearly labeled samples.',ids:events.map(e=>e.id)};
  return {text:'I couldn’t answer that from the campus records I have. Try a library name, room number, or study amenity.',ids:[]};
}
export const statuses=['Confirmed Match','Mismatch Detected','Unverified','Unable to Check'] as const;
export type Result={status:typeof statuses[number]; detail:string; source?:string; at:number};
function normalizeURL(input:string){
  const raw=input.trim();
  const url=new URL(/^[a-z][a-z\d+.-]*:/i.test(raw)?raw:'https://'+raw);
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password||!url.hostname.includes('.'))throw new Error('Unsupported URL');
  return url.origin.toLowerCase()+url.pathname.replace(/\/$/,'')+url.search;
}
export function matchLocation(input:string){
  const q=searchText(input);
  const b=buildings.find(x=>[x.name,x.short].some(n=>searchText(n)===q));
  const f=facilities.find(x=>!x.sample&&(searchText(x.name)===q||x.id==='office150'&&q==='ccis 1150'));
  return {building:b,facility:f};
}
export function verify(mode:string,input:string,expected?:string):Result{
  const result=(status:Result['status'],detail:string,source?:string)=>({status,detail,source,at:Date.now()});
  if(!input.trim())return result('Unable to Check','Enter information to compare.');
  if(mode==='Link'||mode==='Poster'){
    let url:string;
    try{url=normalizeURL(input)}catch{return result('Unable to Check','Enter a valid HTTP or HTTPS link.')}
    const known=Object.values(sources).find(s=>normalizeURL(s)===url);
    if(expected&&normalizeURL(expected)!==url)return result('Mismatch Detected','The submitted URL differs from the selected official reference. Redirects were not checked.',expected);
    return known?result('Confirmed Match','Exact normalized URL match in the official reference catalog. Redirects and website safety were not assessed.',known):result('Unverified','This URL is outside the local source catalog. Redirects were not checked.');
  }
  if(mode==='Location'){
    const {building:b,facility:f}=matchLocation(input);
    if(b||f)return result('Confirmed Match',b?b.name+' is listed on North Campus. Physical access and safety were not checked.':f!.name+' · '+f!.floor+'. Physical access and safety were not checked.',b?sources.map:f?.source);
    return result('Unverified','No exact match in the curated North Campus directory.');
  }
  const event=events.find(e=>clean(e.title)===clean(input));
  if(event?.source&&expected?.trim()&&!['university commons','ucomms','ucomms u of a'].includes(searchText(expected)))return result('Mismatch Detected','The organizer lists '+event.location+' as the venue.',event.source);
  if(event?.source)return result('Confirmed Match',event.title+' · '+event.organizer+' · '+event.date+' · '+event.location+'. Saved organizer listing checked against the ChatUAB snapshot dated '+sourceDate+'. Recheck the original listing for changes.',event.source);
  return result('Unverified',events.some(e=>clean(e.title)===clean(input))?'This is a sample event. There is no independent organizer listing.':'No independently sourced organizer record matches this submission.');
}
export const floorNodes={entry:[190,371],south:[190,288],hall:[190,201],west:[102,201],east:[282,201],north:[190,87],corner:[282,179]} as const;
export type Anchor=keyof typeof floorNodes;
const edges:[Anchor,Anchor][]=[['entry','south'],['south','hall'],['hall','west'],['hall','east'],['hall','north'],['east','corner']];
export function route(from:Anchor,to:Anchor){
  const paths:Anchor[][]=[[from]],seen=new Set<Anchor>([from]);
  for(const path of paths){
    const current=path[path.length-1];
    if(current===to)return path;
    for(const [a,b] of edges){
      const next=a===current?b:b===current?a:null;
      if(next&&!seen.has(next)){seen.add(next);paths.push([...path,next]);}
    }
  }
  return [];
}
export function eventTime(start:string,end:string){
  const format=(date:string)=>new Intl.DateTimeFormat('en-CA',{hour:'numeric',minute:'2-digit',timeZone:'America/Edmonton'}).format(new Date(date));
  return format(start)+' – '+format(end)+' MT';
}
export async function measure(onTick:(score:number,left:number)=>void,signal:AbortSignal){
  if(!navigator.mediaDevices?.getUserMedia||!window.AudioContext)throw new Error('Microphone requires a supported browser on HTTPS.');
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  let context:AudioContext|undefined;
  try{
    if(signal.aborted)throw new Error('Measurement cancelled.');
    context=new AudioContext();
    await context.resume();
    const analyser=context.createAnalyser(); analyser.fftSize=1024;
    context.createMediaStreamSource(stream).connect(analyser);
    const buffer=new Float32Array(analyser.fftSize);
    let score=0,total=0,count=0;
    const start=performance.now();
    while(performance.now()-start<5000){
      if(signal.aborted)throw new Error('Measurement cancelled.');
      analyser.getFloatTimeDomainData(buffer);
      const rms=Math.sqrt(buffer.reduce((sum,sample)=>sum+sample*sample,0)/buffer.length);
      const relative=Math.max(0,Math.min(100,(20*Math.log10(Math.max(rms,0.00001))+75)*1.55));
      score=count?score*.76+relative*.24:relative;
      total+=score;count++;
      onTick(Math.round(score),Math.max(0,Math.ceil((5000-(performance.now()-start))/1000)));
      await new Promise(resolve=>setTimeout(resolve,80));
    }
    return Math.round(total/count);
  }finally{stream.getTracks().forEach(track=>track.stop());if(context)await context.close();}
}
