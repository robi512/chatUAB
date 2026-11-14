import {CampusArt} from './CampusArt';
import {BearAssistant} from './BearAssistant';
import {ServiceArt,type ArtName} from './ServiceArt';
import {FacilitySignal} from './FacilitySignal';
import {QuestionTypewriter,campusQuestions} from './QuestionTypewriter';
import {answerOffline,starterQuestions} from './OfflineBrain';
import {useCallback,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Activity,Camera,ArrowLeft,ArrowUp,Armchair,Bell,BookOpen,Calendar,ChevronRight,Clock,Droplet,Ellipsis,Home,Info,Layers,MapPin,Mic,Navigation,Plug,Search,Settings,Share2,Shield,Utensils,Users,Wifi,MessageCircle,Compass,ArrowRight,SlidersHorizontal} from 'lucide-react';
import {building,buildings,categories,events,facilities,filters,photo,sources,sourceDate,spaceBuilding,studyImage,spaces,featuredStudyIds,featuredStudySpaces,type CampusEvent,type Filter,type Space} from './data';
import {ask,classify,defaults,distance,eventTime,findBuildings,findPlaces,searchStudy,matches,rank,measure,type Preferences,type Reading} from './logic';
import {IndoorNavigator} from './IndoorNavigator';
import {UniversityCommonsNavigator} from './UniversityCommonsNavigator';
import {isIndoorBuilding} from './IndoorNavModel';
import {DestinationFinder} from './DestinationFinder';
import {Commons,StudyActivity} from './Commons';
import {type Point} from './walking';
import {Head,Row,Save,Sheet} from './ui';
import {Verify,type Check} from './Verify';
import {Planner,type Plan} from './Planner';
import {downloadCalendar} from './calendar';
import './style.css';
import './premium.css';
import './finishing.css';
import './delight.css';
import './stable-polish.css';
import './offline-polish.css';
const tabs=['Home','Map','Study','Verify'] as const;
type Tab=typeof tabs[number];
type Panel='assistant'|'noise'|'more'|'events'|'notices'|'settings'|'saved'|'space'|'event'|'place'|'directions'|'planner'|'finder'|'commons';
type View={tab:Tab;panel?:Panel;id?:string};
function useLocal<T,>(key:string,initial:T){
  const [value,set]=useState<T>(()=>{try{const raw=localStorage.getItem('chatuab:'+key);return raw?JSON.parse(raw) as T:initial;}catch{return initial;}});
  useEffect(()=>{try{localStorage.setItem('chatuab:'+key,JSON.stringify(value));}catch{/* in-memory fallback */}},[key,value]);
  return [value,set] as const;
}
function initialView():View{
  const [slug,id]=location.hash.replace(/^#\/?/,'').split('/');
  const tab=tabs.find(t=>t.toLowerCase()===(slug==='library'?'study':slug))??'Home';
  return id&&tab==='Study'&&spaces.some(s=>s.id===id)?{tab,panel:'space',id}:{tab};
}
function StudyVisual({space,detail=false}:{space:Space;detail?:boolean}){
  const image=studyImage(space);
  if(image)return <img className={detail?'detail-image':undefined} src={/^https?:/.test(image)?image:photo(image)} onError={e=>{const fallback=photo(space.image);if(e.currentTarget.src!==new URL(fallback,location.href).href)e.currentTarget.src=fallback;}} loading={detail?'eager':'lazy'} alt={image.startsWith('study-interior-')?`Illustrative interior for ${space.name}`:`${space.name} campus-related photograph`}/>;
  const floor=space.floor;
  return <div className={'study-floor-art '+(detail?'detail-image':'')} data-zone={space.zone}><CampusArt name={space.zone==='Discussion'?'Spaces':'Study'}/><strong>{floor}</strong><span>{space.zone} study zone</span></div>;
}
function App(){
  const [view,setView]=useState<View>(initialView),[saved,setSaved]=useLocal<string[]>('saved',[]),[prefs,setPrefs]=useLocal<Preferences>('preferences',defaults),[readings,setReadings]=useLocal<Reading[]>('readings',[]),[demo,setDemo]=useLocal('demo',false),[checks,setChecks]=useLocal<Check[]>('checks',[]),[,setReports]=useLocal<string[]>('reports',[]),[recent,setRecent]=useLocal<string[]>('searches',[]);
  const [signalCategory,setSignalCategory]=useState<'Water'|'Microwaves'|'Outlets'|null>(null);
  const [filter,setFilter]=useState<Filter>('All'),[buildingId,setBuilding]=useState('ucomm'),[indoor,setIndoor]=useState(true),[category,setCategory]=useState('All'),[mapQuery,setMapQuery]=useState(''),[position,setPosition]=useState<[number,number]>(),[notice,setNotice]=useState(''),[eventIndex,setEventIndex]=useState(0);
  const [plans,setPlans]=useLocal<Plan[]>('plans',[]);
  const [introComplete,setIntroComplete]=useLocal<boolean>('onboarding-complete',false);
  const [preferredStart,setPreferredStart]=useLocal<string>('usual-start-building',''),[appearance,setAppearance]=useLocal<'light'|'dark'>('appearance','light');
  const [introReplay,setIntroReplay]=useState(false),[introStep,setIntroStep]=useState(0);
  const [studyVisits,setStudyVisits]=useLocal<Record<string,number>>('study-visits',{});
  const [detailSection,setDetailSection]=useState('Overview');
  const [studyQuery,setStudyQuery]=useState(''),[studySort,setStudySort]=useState('recommended'),[savedOnly,setSavedOnly]=useState(false);
  const [tick,setTick]=useState(0),[crowded,setCrowded]=useState(false);
  useEffect(()=>{if(view.panel!=='noise'&&view.panel!=='space')return;const timer=setInterval(()=>setTick(n=>n+1),3000);return ()=>clearInterval(timer);},[view.panel,view.tab]);
  const [messages,setMessages]=useLocal<string[]>('chat',[]),[question,setQuestion]=useState(''),[noiseSpace,setNoiseSpace]=useState('cameron');
  const [pendingQuestion,setPendingQuestion]=useState('');
  const responseTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [eventQuery,setEventQuery]=useState('');
  const [isOffline,setIsOffline]=useState(typeof navigator!=='undefined'?!navigator.onLine:false);
  const [measuring,setMeasuring]=useState(false);
  const [liveProgress,setLiveProgress]=useState<{score:number;seconds:number}|null>(null);
  const [measurementError,setMeasurementError]=useState('');
  const measurementController=useRef<AbortController|null>(null);
  const main=useRef<HTMLElement>(null);
  const toast=useCallback((text:string)=>setNotice(text),[]);
  useEffect(()=>{history.replaceState(initialView(),'');const pop=(e:PopStateEvent)=>setView(e.state??initialView());window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);},[]);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),3200);return()=>clearTimeout(t);},[notice]);
  useEffect(()=>{main.current?.scrollTo(0,0);},[view.tab]);

  const activeReadings=readings.filter(r=>r.kind==='Live'||(demo&&r.kind==='Demo'));
  const lastLiveReading=readings.find(r=>r.kind==='Live'&&r.space===noiseSpace);
  const recommendations=rank(activeReadings,prefs,position);
  const latest=activeReadings[0],pickedBuilding=building(buildingId);
  useEffect(()=>()=>{measurementController.current?.abort();if(responseTimer.current)clearTimeout(responseTimer.current);},[]);
  useEffect(()=>{const sync=()=>setIsOffline(!navigator.onLine);window.addEventListener('online',sync);window.addEventListener('offline',sync);return()=>{window.removeEventListener('online',sync);window.removeEventListener('offline',sync);}},[]);
  useEffect(()=>{if(view.panel!=='noise')measurementController.current?.abort();},[view.panel]);
  const startMeasurement=async()=>{
    if(measurementController.current||measuring)return;
    const controller=new AbortController();
    measurementController.current=controller;
    const selected=noiseSpace;
    setMeasuring(true);setMeasurementError('');setLiveProgress(null);
    try{
      let lastSecond=-1;
      const score=await measure((value,seconds)=>{
        if(!controller.signal.aborted&&seconds!==lastSecond){lastSecond=seconds;setLiveProgress({score:value,seconds});}
      },controller.signal);
      if(controller.signal.aborted)return;
      setReadings(old=>[{space:selected,score,at:Date.now(),kind:'Live' as const},...old].slice(0,60));
      toast('Local microphone reading saved for '+spaces.find(s=>s.id===selected)?.name+'. Recommendations updated.');
    }catch(error){
      if(!controller.signal.aborted)setMeasurementError(error instanceof Error?error.message:'Could not use the microphone.');
    }finally{
      if(measurementController.current===controller)measurementController.current=null;
      setMeasuring(false);setLiveProgress(null);
    }
  };

  const orderedPlans=[...plans].sort((a,b)=>+new Date(a.start)-+new Date(b.start));
  const nextPlan=orderedPlans.find(plan=>+new Date(plan.end)>Date.now());
  const visit=(next:View,replace=false)=>{
    const hash='#/'+next.tab.toLowerCase()+(next.panel==='space'?'/'+next.id:'');
    history[replace?'replaceState':'pushState'](next,'',hash);setView(next);
  };
  const open=(panel:Panel,id?:string)=>{if(panel==='directions'){setLaunchCamera(false);setWalk(undefined);setRouteStart(id==='sub'?'ccis':'sub');}if(panel==='space'){setDetailSection('Overview');if(id)setStudyVisits(old=>({...old,[id]:(old[id]??0)+1}));}visit({tab:view.tab,panel,id},!!view.panel);};
  const close=()=>visit({tab:view.tab},true);
  const tab=(next:Tab)=>visit({tab:next});
  const toggle=(id:string)=>{const had=saved.includes(id);setSaved(old=>had?old.filter(x=>x!==id):[...old,id]);toast(had?'Removed from saved items':'Saved on this device');};
  const [routePoint,setRoutePoint]=useState<Point>();
  const [routingStatus,setRoutingStatus]=useState('');
  const [launchCamera,setLaunchCamera]=useState(false);
  const [mapFocus,setMapFocus]=useState(0),[routeStart,setRouteStart]=useState(preferredStart||'sub');
  const [walk,setWalk]=useState<{path:Point[];meters:number;approach:number;start:Point;destination:string}>();
  const routeProgress=useCallback((point:Point)=>setRoutePoint(point),[]);
  const mapSelect=useCallback((id:string)=>{setBuilding(id);setMapFocus(value=>value+1);setWalk(undefined);setRoutePoint(undefined);},[]);
  const goMap=(id:string,filterCategory='All',query='')=>{setSignalCategory(null);setWalk(undefined);mapSelect(spaceBuilding(id));setIndoor(true);setCategory(filterCategory);setMapQuery(query);tab('Map');};
  const signalGo=(next:'Water'|'Microwaves'|'Outlets')=>{setSignalCategory(next);visit({tab:'Map'});};
  const goLibrary=(next:Filter)=>{setFilter(next);setSavedOnly(false);setStudyQuery('');tab('Study');};
  const locate=()=>{
    if(!navigator.geolocation){toast('Location is unavailable. Choose a campus building to start.');return;}
    toast('Finding your location…');
    navigator.geolocation.getCurrentPosition(p=>{
      setPosition([p.coords.latitude,p.coords.longitude]);setRouteStart('gps');
      toast(p.coords.accuracy>60?'Approximate location found. A building start may be more reliable.':'Location found');
    },()=>toast('Location unavailable. Choose a campus building to start.'),{enableHighAccuracy:true,timeout:8000,maximumAge:10000});
  };
  const submit=(value:string)=>{const q=value.trim();if(!q||pendingQuestion)return;setPendingQuestion(q);setQuestion('');setRecent(old=>[q,...old.filter(x=>x!==q)].slice(0,6));if(responseTimer.current)clearTimeout(responseTimer.current);responseTimer.current=setTimeout(()=>{setMessages(old=>[...old,q].slice(-16));setPendingQuestion('');responseTimer.current=null;},600);};
  function simulate(){
    const top=recommendations.find(item=>item.space.outlets)?.space.id??'cameron';
    const other=top==='cameron'?'sperber':'cameron',now=Date.now();
    setDemo(true);setReadings(old=>[{space:top,score:91,at:now,kind:'Demo' as const},{space:other,score:14,at:now,kind:'Demo' as const},...old.filter(r=>r.kind!=='Demo')].slice(0,60));toast('Study recommendations updated.');
  }
  const services=[
    {title:'Spaces',Icon:Layers,action:()=>goLibrary('All')},{title:'Classrooms',Icon:Armchair,action:()=>open('finder','Classrooms')},{title:'Outlets',Icon:Plug,action:()=>goMap('cameron','Outlets')},{title:'Water',Icon:Droplet,action:()=>open('finder','Water')},{title:'Microwaves',Icon:Utensils,action:()=>open('finder','Microwaves')},{title:'Events',Icon:Calendar,action:()=>open('events')},{title:'Map',Icon:MapPin,action:()=>tab('Map')},{title:'More',Icon:Ellipsis,action:()=>open('more')},
  ];
  const space=spaces.find(s=>s.id===view.id),event=events.find(e=>e.id===view.id)??events[0],facility=facilities.find(f=>f.id===view.id),place=building(facility?.building??spaceBuilding(view.id??buildingId));
  const mapResults=findPlaces(mapQuery,category).filter(f=>!f.sample);
  const filteredMap=category!=='All'||!!mapQuery.trim();
  const matchingBuildings=category==='All'&&mapQuery.trim()?findBuildings(mapQuery):[];
  const resultBuildingIds=filteredMap?[...new Set([...matchingBuildings.map(b=>b.id),...mapResults.filter(f=>!f.sample).map(f=>f.building)])]:buildings.map(b=>b.id);
  const pinKey=resultBuildingIds.join(',');
  const visibleBuilding=resultBuildingIds.includes(buildingId)?pickedBuilding:buildings.find(b=>b.id===resultBuildingIds[0]);
  const mapDestination=visibleBuilding??pickedBuilding;
  const showOnMap=(id:string)=>{mapSelect(id);document.getElementById('campus-map-panel')?.scrollIntoView({block:'nearest'});};
  const displayedSpaces=latest||position||prefs.group||prefs.member||!prefs.power?recommendations.filter(r=>featuredStudyIds.includes(r.space.id as typeof featuredStudyIds[number])).map(r=>r.space):featuredStudySpaces;
  const sortedSpaces=displayedSpaces.filter(s=>(filter==='Quiet'?s.zone==='Quiet':filter==='Silent'?s.zone==='Silent':filter==='Group'?s.zone==='Discussion':matches(s,filter,prefs.member))&&(!savedOnly||saved.includes(s.id))&&searchStudy(s,studyQuery));
  if(studySort==='name')sortedSpaces.sort((a,b)=>a.name.localeCompare(b.name));
  if(studySort==='distance'&&position)sortedSpaces.sort((a,b)=>(recommendations.find(r=>r.space.id===a.id)?.meters??0)-(recommendations.find(r=>r.space.id===b.id)?.meters??0));
  function eventCard(e:CampusEvent){
    return <button className="event-small panel curated-event" key={e.id} onClick={()=>open('event',e.id)}><span className="event-date-tile" aria-hidden="true"><strong>{new Date(e.date+'T12:00:00').toLocaleDateString('en-CA',{day:'2-digit'})}</strong><small>{new Date(e.date+'T12:00:00').toLocaleDateString('en-CA',{month:'short'}).toUpperCase()}</small></span><span className="curated-event-copy"><strong>{e.title}</strong><small>{e.organizer} · {e.location}</small><em><Shield size={12}/> {e.source?'Organizer listing found':'No organizer source'}</em></span><ChevronRight size={17}/></button>;
  }
  function card(s:Space){
    const reading=recommendations.find(x=>x.space.id===s.id)?.reading;
    return <article className="study-card panel" key={s.id}>
      <button className="study-open" onClick={()=>open('space',s.id)} aria-label={'Details for '+s.name}>
        <div className="study-image-wrap"><StudyVisual space={s}/>{featuredStudyIds.includes(s.id as typeof featuredStudyIds[number])&&<span className="study-image-note">Illustrative interior · not an actual room photo</span>}</div>
        <div className="study-copy"><h2>{s.name}</h2><p><i className={'status-dot '+(s.zone==='Silent'?'silent':'')}/>{s.zone} <b>·</b> {s.floor}</p>{reading&&<small>{reading.kind} · {classify(reading.score)} · {reading.score}/100</small>}</div>
        <div className="amenities">{s.outlets&&<span><Plug/> Outlets</span>}{s.wifi&&<span><Wifi/> Wi-Fi</span>}{s.group&&<span><Users/> Group rooms</span>}{!s.outlets&&!s.wifi&&<span><BookOpen/> Individual study</span>}</div>
      </button><Save id={s.id} saved={saved} toggle={toggle}/>
    </article>;
  }
  function resultRow(id:string){
    const s=spaces.find(x=>x.id===id),f=facilities.find(x=>x.id===id),e=events.find(x=>x.id===id),b=buildings.find(x=>x.id===id);
    if(!s&&!f&&!e&&!b)return null;
    return <div className="place-row panel" key={id}><div><strong>{s?.name??f?.name??e?.title??b?.name}</strong><small>{s?s.zone+' · '+s.floor:f?(f.sample?'Demo · ':'')+building(f.building).short+' · '+f.floor:e?(e.source?'Organizer listing · ':'Sample · ')+e.location:'North Campus'}</small></div><div className="actions"><button className="pill" onClick={()=>open(s?'space':e?'event':'place',id)}>Details</button><button className="pill" onClick={()=>view.tab==='Map'&&!view.panel&&!f?.sample?showOnMap(f?.building??id):f?.sample?open('place',f.id):goMap(s?.id??f?.building??e?.building??id,f?.category??'All',f?.name??'')}><MapPin size={15}/> Map</button><Save id={id} saved={saved} toggle={toggle}/></div></div>;
  }
  const titleMap:Record<Panel,string>={assistant:'Ask ChatUAB',commons:'University Commons',finder:view.id??'Find a destination',planner:'My campus schedule',noise:'Campus conditions',more:'Campus resources',events:'Today on Campus',notices:'Notifications',settings:'Settings',saved:'Saved items',space:space?.name??'Study space',event:event.title,place:facility?.name??place.name,directions:'Directions'};
  return <div className="app-shell" data-theme={appearance}>
    <main ref={main} className={'app-main tab-'+view.tab.toLowerCase()}>
      {view.tab==='Home'&&<>
        <div className="home-page">
          <div className="home-topbar">
            <div className="home-brand"><span className="home-brand-mark"><BearAssistant size={43}/></span><div><strong>ChatUAB</strong><small>Built for U of A students</small></div></div>
            <div className="home-top-actions"><button className="home-top-icon" aria-label="Ask ChatUAB Bear" onClick={()=>open('assistant')}><MessageCircle size={21}/></button><button className="home-top-icon" aria-label="Notifications" onClick={()=>open('notices')}><Bell size={21}/></button></div>
          </div>
          <section className="delight-hero" aria-label="Ask your campus companion">
            <div className="delight-hero-top"><span className="delight-eyebrow">{isOffline?'OFFLINE · SAVED CAMPUS GUIDE':'YOUR CAMPUS, MADE SIMPLE'}</span><span className="delight-university-mark"><img src={import.meta.env.BASE_URL+'art/uofa-authentic-mark.png'} alt="University of Alberta crest and wordmark"/></span></div>
            <div className="delight-hero-message"><div><h1>Hey, explorer<span className="delight-bang">!</span></h1><p>Let's find your next favourite<br/>spot on campus.</p></div><button type="button" className="delight-hero-mascot" onClick={()=>open('assistant')} aria-label="Meet ChatUAB bear assistant"><span className="mascot-glow"/><BearAssistant size={110}/><span className="mascot-spark mascot-spark-one">✦</span><span className="mascot-spark mascot-spark-two">✧</span></button></div>
            <div className="delight-ai-label"><span className="delight-ai-pulse"/><strong>Ask the campus bear</strong><small>Here to help, always.</small></div>
            <div className="delight-ai-composer"><button className="delight-ai-question" onClick={()=>open('assistant')} aria-label="Open campus assistant"><Search size={18}/><span><QuestionTypewriter/></span></button><button className="delight-ai-send" onClick={()=>open('assistant')} aria-label="Ask ChatUAB"><ArrowUp size={19}/></button></div>
          </section>
          <div className="premium-home-content">
            <div className="delight-section-title"><div><span className="delight-eyebrow">ONE TAP AWAY</span><h2>What are we finding?</h2></div></div>
            <div className="delight-service-grid" aria-label="Campus shortcuts">
              {([
                ['Study spots','study',()=>goLibrary('All')],
                ['Classrooms','classrooms',()=>open('finder','Classrooms')],
                ['Water','water',()=>signalGo('Water')],
                ['Food','food',()=>open('finder','Food')],
                ['Events','events',()=>open('events')],
                ['Indoor map','map',()=>{setSignalCategory(null);tab('Map');}],
                ['Printing','printing',()=>open('finder','Printers')],
                ['Microwaves','microwave',()=>signalGo('Microwaves')],
              ] as [string,ArtName,()=>void][]).map(([label,art,act])=><button type="button" key={label} onClick={act} className="delight-service-tile"><ServiceArt name={art} size={74}/><span>{label}</span></button>)}
            </div>
            <section className="delight-study-feature">
              <div className="delight-section-title"><div><span className="delight-eyebrow">YOUR STUDY GUIDE</span><h2>10 distinct spots to explore</h2></div><button onClick={()=>goLibrary('All')}>All spaces <ArrowRight size={16}/></button></div>
              <p className="delight-feature-note">Ten documented study locations, each with its own illustrative image. No live occupancy feed.</p>
              <div className="delight-feature-grid">
                {featuredStudySpaces.map(s=><button className="delight-study-tile" key={s.id} onClick={()=>open('space',s.id)}><div className="delight-study-photo"><StudyVisual space={s}/><span className="delight-study-zone">{s.zone}</span></div><span className="delight-study-info"><strong>{s.name.includes(' · ')?s.name.split(' · ')[1]:s.name}</strong><small>{s.name.split(' · ')[0]}</small><span><MapPin size={12}/>{s.floor}</span></span></button>)}
              </div>
            </section>
            <section className="premium-updates">
              <div className="premium-section-heading"><div><span className="premium-section-eyebrow">THE LATEST</span><h2>Campus updates</h2></div><button onClick={()=>open('events')}>See all <ArrowRight size={16}/></button></div>
              <div className="premium-event-list">{events.slice(0,2).map(eventCard)}</div>
            </section>
            <button className="premium-more-link" onClick={()=>open('more')}><span className="premium-more-icon"><Compass size={20}/></span><span><strong>More campus tools</strong><small>Classrooms, water, printing & more</small></span><ChevronRight size={20}/></button>
            <p className="premium-disclaimer">An independent student-made campus guide · Not affiliated with the University of Alberta.</p>
          </div>
        </div>
      </>}
      {view.tab==='Study'&&<section className="page library-page">
        <div className="premium-page-heading"><div><span className="premium-section-eyebrow">YOUR SPACE, YOUR WAY</span><h1>Study spaces</h1><p>Find a spot that fits the way you work.</p></div><button className="home-top-icon" aria-label="Study preferences" onClick={()=>open('settings')}><SlidersHorizontal size={21}/></button></div>
        <label className="premium-study-search"><Search size={19}/><input aria-label="Search study spaces" value={studyQuery} onChange={e=>setStudyQuery(e.target.value)} placeholder="Search libraries, floors or study zones"/></label>
        <div className="chips" aria-label="Study space filters">{filters.map(f=><button className={filter===f?'selected':''} aria-pressed={filter===f} key={f} onClick={()=>setFilter(f)}>{f==='Quiet'?<Activity/>:f==='Group'?<Users/>:f==='24/7'?<Clock/>:null}{f}</button>)}</div>
        <p className="library-data-note">Study zones based on university listings · Photos are illustrative · No live crowding data</p><div className="results-tools"><span role="status">{sortedSpaces.length} {sortedSpaces.length===1?'space':'spaces'}</span><button className="pill" aria-pressed={savedOnly} onClick={()=>setSavedOnly(v=>!v)}>Saved</button><select aria-label="Sort study spaces" value={studySort} onChange={e=>setStudySort(e.target.value)}><option value="recommended">Recommended</option><option value="name">Name A–Z</option><option value="distance" disabled={!position}>Nearest</option></select></div>
        <div className="study-grid" key={filter+String(savedOnly)}>{sortedSpaces.length?sortedSpaces.map(card):<div className="empty panel">No spaces match these filters.<button className="pill" onClick={()=>{setFilter('All');setStudyQuery('');setSavedOnly(false);}}>Reset filters</button></div>}</div>
        <div className="panel list noise-link"><Row icon={<Settings/>} title="Study preferences" onClick={()=>open('settings')}/></div>
      </section>}
      {view.tab==='Map'&&<section className="page map-page indoor-only-page">
        {signalCategory?<FacilitySignal category={signalCategory} onClose={()=>setSignalCategory(null)} onBuilding={(id,facilityId)=>{if(isIndoorBuilding(id)){setSignalCategory(null);mapSelect(id);}else{open('place',facilityId);}}}/>:buildingId==='ucomm'?<UniversityCommonsNavigator onOtherBuildings={()=>mapSelect('ccis')} onExit={()=>tab('Home')} initialQuery={mapQuery}/>:<IndoorNavigator buildingId={buildingId} onBuildingChange={mapSelect} initialQuery={mapQuery} />}
      </section>}
      {view.tab==='Verify'&&<Verify openLocation={id=>goMap(id)} checks={checks} addCheck={check=>setChecks(old=>[check,...old].slice(0,30))} report={value=>{setReports(old=>[value,...old].slice(0,30));toast('Report saved on this device');}}/>}
    </main>
    {!(view.tab==='Map'&&buildingId==='ucomm'&&!signalCategory)&&<nav className="bottom-nav" aria-label="Main navigation" data-tab={view.tab}>{tabs.map((t,i)=>{const art:(ArtName)[]=['group','map','study','verify'];return <button key={t} aria-current={view.tab===t?'page':undefined} onClick={()=>{setSignalCategory(null);if(view.tab!==t)tab(t);}}><span className="bottom-nav-item"><span className="bottom-nav-icon"><ServiceArt name={art[i]} size={38}/></span><span className="bottom-nav-label">{t==='Study'?'Spaces':t}</span></span></button>;})}</nav>}
    {(!introComplete||introReplay)&&<div className="onboard-overlay" role="dialog" aria-modal="true" aria-labelledby="intro-heading">
      <div className="onboard-card">
        <div className="onboard-top"><span>ChatUAB <span className="onboard-top-dot"/></span><span>0{introStep+1} / 02</span></div>
        {introStep===0?<><div className="onboard-art onboard-art-intro"><div className="onboard-bear"><BearAssistant size={115}/></div><span className="onboard-orbit onboard-orbit-a"><MapPin size={21}/></span><span className="onboard-orbit onboard-orbit-b"><BookOpen size={21}/></span><span className="onboard-orbit onboard-orbit-c"><Navigation size={21}/></span></div><div className="onboard-copy"><span className="premium-section-eyebrow">YOUR CAMPUS COMPANION</span><h1 id="intro-heading">Campus,<br/>figured out.</h1><p>Find classes, quiet spaces, and your way around.</p></div><button className="onboard-primary" onClick={()=>setIntroStep(1)}>Continue <ArrowRight size={20}/></button></>:<><div className="onboard-art onboard-art-location"><img src={photo('campus')} alt="University of Alberta campus exterior"/><span className="onboard-location-pin"><MapPin size={29} fill="#10543c"/></span></div><div className="onboard-copy"><span className="premium-section-eyebrow">JUST ONE OPTIONAL DETAIL</span><h1 id="intro-heading">Make campus<br/>yours.</h1><p>Choose where you usually start. You can change this any time.</p><label className="onboard-select-label">Usual starting point<select value={preferredStart} onChange={e=>setPreferredStart(e.target.value)}><option value="">Choose later</option>{buildings.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label></div><button className="onboard-primary" onClick={()=>{setIntroComplete(true);setIntroReplay(false);setRouteStart(preferredStart||'sub');}}>Let's go <ArrowRight size={20}/></button></>}
        <div className="onboard-bottom"><div className="onboard-progress"><span className={introStep===0?'active':''}/><span className={introStep===1?'active':''}/></div><button onClick={()=>{setIntroComplete(true);setIntroReplay(false);}}>Skip</button></div>
      </div>
    </div>}
    {notice&&<div className="toast" role="status"><Info size={17}/>{notice}</div>}
    {view.panel&&<Sheet key={view.panel} title={titleMap[view.panel]} close={close}>
      {view.panel==='planner'&&<Planner plans={orderedPlans} add={plan=>{setPlans(old=>[...old,plan]);toast('Added to your campus schedule');}} remove={id=>{setPlans(old=>old.filter(plan=>plan.id!==id));toast('Removed from your campus schedule');}} openMap={(id,room)=>goMap(id,'All',room)}/>}
      {view.panel==='commons'&&<Commons directions={()=>goMap('commons')}/>}
      {view.panel==='finder'&&<DestinationFinder kind={view.id??'Classrooms'} routingStatus={routingStatus} start={(facility)=>{
        setRoutingStatus('');setBuilding(facility.building);setIndoor(true);setWalk(undefined);setMapQuery(facility.name);visit({tab:'Map'},true);
        toast(isIndoorBuilding(facility.building)?'Indoor schematic opened. Search for the destination in the map sheet.':'Indoor plan not available for this building. Choose a mapped building.');
      }}/>}
      {view.panel==='assistant'&&<div className="stack assistant">
        <div className="assistant-intro"><span><BearAssistant size={38}/></span><p><strong>ChatUAB Bear</strong><br/>Campus answers from saved local data · no AI API</p>{messages.length>0&&<button className="pill" onClick={()=>setMessages([])}>Clear chat</button>}</div>
        {!messages.length&&<div className="suggestions">{['Find a quiet study area with outlets','Find CCIS 1-140','How do I get to Cameron Library?','Where can I refill my water bottle?',...recent.filter(q=>!['Find a quiet study area with outlets','Find CCIS 1-140'].includes(q))].slice(0,7).map(q=><button className="pill" key={q} onClick={()=>submit(q)}>{q}</button>)}</div>}
        {messages.map((q,i)=>{const answer=answerOffline(q,activeReadings,prefs,position);return <div className="chat-turn" key={i}><div className="bubble user">{q}</div><div className="assistant-answer"><span className="assistant-answer-avatar"><BearAssistant size={32}/></span><div className="bubble">{answer.text}</div></div>{answer.ids.length>0&&<div className="assistant-rich-results">{answer.ids.slice(0,5).map(resultRow)}</div>}</div>;})}
        {pendingQuestion&&<div className="chat-turn"><div className="bubble user">{pendingQuestion}</div><div className="assistant-answer"><span className="assistant-answer-avatar"><BearAssistant size={32} thinking/></span><div className="bubble assistant-thinking" role="status" aria-live="polite"><span>Finding the right campus information</span><i/><i/><i/></div></div></div>}
        <div className="assistant-quick-prompts"><strong>Try asking</strong><div>{starterQuestions.map(item=><button type="button" key={item} disabled={!!pendingQuestion} onClick={()=>submit(item)}>{item}<ArrowRight size={13}/></button>)}</div></div>
        <form className="chat-input" onSubmit={e=>{e.preventDefault();submit(question);}}><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask ChatUAB…" aria-label="Ask ChatUAB question"/><button className="primary icon" aria-label="Send query" disabled={!question.trim()||!!pendingQuestion}><ArrowUp size={21}/></button></form>
        <button className="pill" onClick={()=>open('noise')}><Activity size={17}/> Campus conditions</button>
      </div>}
      {view.panel==='noise'&&<div className="stack">
        <label>Study area<select value={noiseSpace} onChange={e=>setNoiseSpace(e.target.value)}>{spaces.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <StudyActivity tick={tick} crowded={crowded} recommended={!crowded&&(saved.includes(noiseSpace)||(studyVisits[noiseSpace]??0)>=2)}/>
        <div className="result panel stack noise-measure" aria-label="On-device microphone measurement">
          <div className="noise-measure-head"><div><strong>Measure this space</strong><p>Five-second sound-level estimate on your device.</p></div><Mic size={23}/></div>
          {measuring&&liveProgress&&<div className="noise-progress" role="status"><span className="noise-value">{liveProgress.score}<small>/100</small></span><span>{liveProgress.seconds} s remaining · measuring locally</span></div>}
          {lastLiveReading&&!measuring&&<p className="live-reading" role="status">Last measured here: <strong>{lastLiveReading.score}/100 · {classify(lastLiveReading.score)}</strong></p>}
          {measurementError&&<p className="measurement-error" role="alert">{measurementError}</p>}
          <div className="actions"><button className="primary" disabled={measuring} onClick={startMeasurement}><Mic size={18}/>{measuring?'Measuring…':'Measure noise'}</button>{measuring&&<button className="pill" onClick={()=>measurementController.current?.abort()}>Cancel</button>}</div>
          <small>Microphone access is optional. No audio is stored or uploaded. The score is relative (0–100), not calibrated decibels, and reflects only this device at this place.</small>
        </div>
        <div className="result panel"><strong>Recommended now</strong><p>{recommendations[0].space.name}</p><button className="pill" onClick={()=>goMap(recommendations[0].space.id)}><Navigation size={16}/> Directions</button></div>
        <div className="result panel stack"><strong>Crowd controls</strong><p>Preview how a crowd changes the study recommendation.</p><button className="primary" onClick={()=>{setCrowded(true);simulate();}}>Simulate a crowd</button><button className="pill" onClick={()=>{setCrowded(false);setDemo(false);setReadings(old=>old.filter(r=>r.kind!=='Demo'));toast('Sample data reset. Real measurements kept.');}}>Reset sample</button></div>
        <button className="pill" onClick={()=>open('assistant')}>Back to Ask ChatUAB</button>
      </div>}
      {view.panel==='space'&&space&&<div className="stack detail">
        <StudyVisual space={space} detail/>{studyImage(space)&&<small>Campus photograph · see credits in About</small>}
        <strong>{space.floor} · {space.zone} zone</strong><p>{space.description}</p>
        <div className="actions"><button className="primary" onClick={()=>goMap(space.id)}><Navigation size={17}/> Directions</button><Save id={space.id} saved={saved} toggle={toggle}/><button className="pill" onClick={async()=>{const url=new URL('#/study/'+space.id,location.href).href;try{if(navigator.share)await navigator.share({title:space.name,url});else{await navigator.clipboard.writeText(url);toast('Link copied');}}catch{toast('Share was cancelled or unavailable.');}}}><Share2 size={17}/> Share</button></div>
        <div className="chips detail-tabs" aria-label="Study space details">{['Overview','Noise zones','Booking'].map(section=><button key={section} aria-pressed={section===detailSection} className={section===detailSection?'selected':''} onClick={()=>setDetailSection(section)}>{section}</button>)}</div>
        {detailSection==='Noise zones'&&<><h3>Noise zones</h3><ul>{space.zones.map(z=><li key={z}>{z}</li>)}</ul></>}
        {detailSection==='Overview'&&<><h3>Amenities & access</h3><p>{space.outlets?'Powered tables documented. ':'Outlet locations are unspecified. '}{space.wifi?'Eduroam available. ':''}{space.access}</p></>}{detailSection==='Booking'&&<><h3>Study-room booking</h3><p>{space.booking}. Live availability and reservations are unavailable in ChatUAB.</p>
        </>}
        {isIndoorBuilding(spaceBuilding(space.id))&&<button className="pill" onClick={()=>goMap(space.id)}>Explore indoor floor guide</button>}<StudyActivity tick={tick} crowded={crowded} recommended={!crowded&&(saved.includes(space.id)||(studyVisits[space.id]??0)>=2)}/><small>Official directory checked {sourceDate}</small><button className="pill" onClick={()=>{setNoiseSpace(space.id);open('noise');}}>View campus conditions</button>
      </div>}
      {view.panel==='events'&&<div className="stack events-catalogue"><div className="events-catalogue-intro"><span className="event-verified-icon"><Calendar size={22}/></span><div><h3>Next two weeks</h3><p>Nov 14–28 · {events.length} sourced events</p></div></div><label className="premium-study-search"><Search size={18}/><input aria-label="Search campus events" value={eventQuery} onChange={e=>setEventQuery(e.target.value)} placeholder="Search events, venues or organizers"/></label><p className="events-provenance"><Shield size={14}/> Organizer listings saved Nov 14. Dates may change; external sources need internet.</p>{events.filter(e=>(e.title+' '+e.organizer+' '+e.location).toLowerCase().includes(eventQuery.toLowerCase())).map(eventCard)}</div>}
      {view.panel==='event'&&<div className="stack"><span className="demo-tag in-flow">{event.source?'Published organizer listing · source found':'Sample event · Unverified'}</span><p>{event.description}</p><p>{event.date} · {event.timeTbd?(event.start===event.end?'Time: see organizer listing':'Schedule: see organizer listing'):eventTime(event.start,event.end)}</p><p>{event.location} · {event.organizer}</p>{event.source?<a className="source-label" href={event.source} target="_blank" rel="noopener noreferrer">Open original organizer listing <ArrowRight size={14}/></a>:<p>Source: ChatUAB sample record.</p>}<div className="actions"><button className="primary" onClick={()=>goMap(event.building)}><Navigation size={17}/> Directions</button><Save id={event.id} saved={saved} toggle={toggle}/>{!event.timeTbd&&<button className="pill" onClick={()=>downloadEvent(event)}>Add to calendar</button>}</div></div>}
      {view.panel==='place'&&<div className="stack"><p>{facility?facility.detail:place.description}</p><p>{facility?place.name+' · '+facility.floor:'North Campus · Edmonton'}</p><small>{facility?.sample?'Demonstration only':'Official campus record · checked '+sourceDate}</small><small className="source-label">Source: {facility?.source??sources.map}</small><div className="actions"><button className="primary" onClick={()=>facility?.category==='Water'||facility?.category==='Microwaves'||facility?.category==='Outlets'?signalGo(facility.category):isIndoorBuilding(place.id)?goMap(place.id):toast('Indoor directions are not mapped for this building yet.')}><MapPin size={17}/> {facility?.category==='Water'||facility?.category==='Microwaves'?'Show building signal':'Open map'}</button><button className="pill" onClick={()=>isIndoorBuilding(place.id)?goMap(place.id):toast('Turn-by-turn indoor directions are not available for this building.')}>Directions</button><Save id={facility?.id??place.id} saved={saved} toggle={toggle}/></div></div>}
      {view.panel==='directions'&&<div className="stack">
        <h3>Indoor directions</h3>
        <p>Destination: <strong>{place.name}</strong></p>
        <p>Choose a supported building, floor, starting point and destination in the interactive indoor guide. Outdoor routes are not part of this version.</p>
        <button className="primary" onClick={()=>goMap(place.id)}><Layers size={18}/> Open indoor map</button>
        {!isIndoorBuilding(place.id)&&<p className="result panel">A surveyed indoor plan for this building is not yet available. The map shows clearly labeled schematic demonstrations for supported buildings instead of inventing this location.</p>}
      </div>}
      {view.panel==='more'&&<div className="panel list"><Row icon={<BookOpen/>} title="Saved items" onClick={()=>open('saved')}/><Row icon={<Calendar/>} title="My campus schedule" onClick={()=>open('planner')}/><Row icon={<Activity/>} title="Campus conditions" onClick={()=>open('noise')}/><Row icon={<Settings/>} title="Settings" onClick={()=>open('settings')}/></div>}
      {view.panel==='saved'&&<div className="stack">{saved.length?saved.map(resultRow):<p>No bookmarks yet.</p>}</div>}
      {view.panel==='notices'&&<div className="stack"><p>No live campus notices are connected.</p><p>Library hours can vary by building and date.</p></div>}
      {view.panel==='settings'&&<div className="stack">
        <p>Preferences are saved on this device.</p><label className="appearance-setting">Appearance<select aria-label="App appearance" value={appearance} onChange={e=>setAppearance(e.target.value as 'light'|'dark')}><option value="light">Light</option><option value="dark">Dark</option></select></label><details><summary>About and photo credits</summary><p>Arts Building: IQRemix, CC BY-SA 2.0. Rutherford reading room and atrium: Viola-Ness, CC BY-SA 4.0. Cameron Library: Silver Dovelet, CC BY-SA 4.0. Images resized. Building images may not show the precise study zone. Photo credits and licensing are retained from the original project.</p></details>{([['power','Prioritize outlets'],['group','Prioritize group rooms'],['member','I have a student or staff ONEcard']] as const).map(([key,label])=><label className="toggle" key={key}><span>{label}</span><input type="checkbox" checked={prefs[key]} onChange={e=>setPrefs(old=>({...old,[key]:e.target.checked}))}/></label>)}
        <label className="toggle"><span>Use illustrative readings</span><input type="checkbox" checked={demo} onChange={e=>setDemo(e.target.checked)}/></label>
        <button className="pill" onClick={()=>open('saved')}>Open saved items</button>
        <button className="pill" onClick={()=>{setIntroStep(0);setIntroReplay(true);}}>Replay two-screen welcome</button>
      </div>}
    </Sheet>}
  </div>;
}
function downloadEvent(event:CampusEvent){
  downloadCalendar(event.id,(event.source?'':'[Sample] ')+event.title,event.start,event.end,event.location);
}
createRoot(document.getElementById('root')!).render(<App/>);

// Offline-first local knowledge and app shell after initial successful online load.
if ('serviceWorker' in navigator && location.protocol!=='file:') {
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js',{scope:import.meta.env.BASE_URL}).then(reg=>{
      const cacheLoaded=()=>{
        const urls=[location.href,...performance.getEntriesByType('resource').map(r=>r.name)].filter(u=>u.startsWith(location.origin));
        (navigator.serviceWorker.controller||reg.active)?.postMessage({type:'CACHE_CURRENT_PAGE',urls});
      };
      cacheLoaded();setTimeout(cacheLoaded,1400);
      navigator.serviceWorker.ready.then(cacheLoaded).catch(()=>{});
      navigator.serviceWorker.addEventListener('controllerchange',cacheLoaded,{once:true});
    }).catch(()=>{/* private browsing / blocked SW: app remains usable while online */});
  });
}
