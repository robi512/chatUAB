import {useEffect,useRef,useState} from 'react';
import L from 'leaflet';
import {Compass,Layers,LocateFixed,Maximize2,Minimize2,Navigation,RefreshCw} from 'lucide-react';
import {buildings,center,type Building} from './data';
import {distance} from './logic';
import footprints from './campus-footprints.json';
import graph from './campus-graph.json';
import {bearing} from './walking';
import 'leaflet/dist/leaflet.css';

type Point=[number,number];
type OutdoorProps={selected:Building;position?:Point;onSelect:(id:string)=>void;locate:()=>void;pinKey:string;focus:number;route?:Point[];routePoint?:Point;amenity:string;onAmenity:(kind:string)=>void};

/** Real geographic map; routes use the bundled campus footpath graph, not screen coordinates. */
export function Outdoor({selected,position,onSelect,locate,pinKey,focus,route:walk,routePoint,amenity,onAmenity}:OutdoorProps){
  const element=useRef<HTMLDivElement>(null);
  const map=useRef<L.Map|null>(null);
  const userMarker=useRef<L.CircleMarker|null>(null);
  const markers=useRef(new Map<string,L.Marker>());
  const selectCallback=useRef(onSelect);
  const amenityCallback=useRef(onAmenity);
  const street=useRef<L.TileLayer|null>(null);
  const satellite=useRef<L.TileLayer|null>(null);
  const [expanded,setExpanded]=useState(false);
  const [aerial,setAerial]=useState(false);
  const [mapTilesFailed,setMapTilesFailed]=useState(false);
  selectCallback.current=onSelect;
  amenityCallback.current=onAmenity;

  useEffect(()=>{
    if(!element.current)return;
    const view=L.map(element.current,{zoomControl:false,scrollWheelZoom:false,zoomSnap:.5,preferCanvas:true}).setView(center,16.5);
    map.current=view;
    L.control.zoom({position:'bottomleft'}).addTo(view);
    const tiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
    });
    let errors=0;
    tiles.on('tileerror',()=>{errors++;if(errors>=3)setMapTilesFailed(true);});
    tiles.on('tileload',()=>setMapTilesFailed(false));
    tiles.addTo(view);
    street.current=tiles;
    satellite.current=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{
      maxZoom:19,attribution:'Imagery &copy; Esri, Maxar, Earthstar Geographics, and GIS User Community'
    });
    satellite.current.on('tileerror',()=>setMapTilesFailed(true));
    satellite.current.on('tileload',()=>setMapTilesFailed(false));
    const footprintLayer=L.layerGroup().addTo(view);
    const shapes=footprints as Point[][];
    for(const shape of shapes){
      L.polygon(shape,{color:'#668471',weight:1,fillColor:'#C7D9C7',fillOpacity:.2,interactive:false}).addTo(footprintLayer);
    }
    // Draw existing path-network as delicate context, not as a false active route.
    const points=graph.nodes as Point[];
    L.polyline(graph.edges.map(([a,b])=>[points[a],points[b]]),{color:'#90B7A2',weight:1.5,opacity:.65,interactive:false}).addTo(view);
    buildings.forEach(b=>{
      const icon=L.divIcon({className:'campus-map-marker',html:'<span class="campus-map-marker-core"></span>',iconSize:[30,38],iconAnchor:[15,34]});
      const marker=L.marker(b.point,{title:b.name,alt:b.name,icon}).addTo(view);
      marker.bindTooltip(b.short,{direction:'top',offset:[0,-27],className:'campus-label'});
      marker.on('click',()=>selectCallback.current(b.id));
      markers.current.set(b.id,marker);
    });
    const resize=()=>view.invalidateSize(false);
    window.addEventListener('resize',resize);
    requestAnimationFrame(resize);
    return ()=>{window.removeEventListener('resize',resize);view.remove();markers.current.clear();map.current=null;userMarker.current=null;street.current=null;satellite.current=null;};
  },[]);

  useEffect(()=>{
    const view=map.current;
    if(!view||!street.current||!satellite.current)return;
    const active=aerial?satellite.current:street.current;
    const inactive=aerial?street.current:satellite.current;
    if(view.hasLayer(inactive))view.removeLayer(inactive);
    active.addTo(view);active.bringToBack();
  },[aerial]);

  useEffect(()=>{
    const view=map.current;
    if(!view)return;
    const visible=new Set(pinKey.split(',').filter(Boolean));
    for(const [id,marker] of markers.current){
      if(visible.has(id)){if(!view.hasLayer(marker))marker.addTo(view);}else marker.remove();
    }
    const locations=buildings.filter(b=>visible.has(b.id)).map(b=>b.point);
    if(locations.length===1)view.flyTo(locations[0],17,{duration:.5});
    else if(locations.length>1&&locations.length<10)view.fitBounds(L.latLngBounds(locations),{padding:[35,35],maxZoom:17,animate:false});
    else if(locations.length>=10)view.setView(center,16.5,{animate:false});
  },[pinKey]);

  useEffect(()=>{
    const view=map.current;
    if(!view)return;
    if(focus)view.panTo(selected.point,{animate:true,duration:.35});
    for(const [id,marker] of markers.current){
      const active=id===selected.id;
      marker.getElement()?.classList.toggle('current-pin',active);
      marker.setZIndexOffset(active?900:0);
      if(active&&view.hasLayer(marker))marker.openTooltip();else marker.closeTooltip();
    }
  },[selected,focus,pinKey]);

  useEffect(()=>{
    const view=map.current;if(!view||!position)return;
    userMarker.current?.remove();
    userMarker.current=L.circleMarker(position,{radius:9,color:'#fff',weight:3,fillColor:'#137D5E',fillOpacity:1}).addTo(view).bindTooltip('Your approximate outdoor location');
  },[position]);

  useEffect(()=>{
    const view=map.current;
    if(!view||!walk||walk.length<2)return;
    const casing=L.polyline(walk,{color:'#FFFFFF',weight:12,lineJoin:'round',lineCap:'round',opacity:.96}).addTo(view);
    const line=L.polyline(walk,{color:'#2574DA',weight:7,lineJoin:'round',lineCap:'round',opacity:.98}).addTo(view);
    const arrows:L.Marker[]=[];
    const spacing=Math.max(2,Math.floor(walk.length/13));
    for(let i=1;i<walk.length-1;i+=spacing){
      const angle=bearing(walk[i],walk[i+1]);
      const marker=L.marker(walk[i],{interactive:false,icon:L.divIcon({className:'route-chevron',html:`<span style="transform:rotate(${Math.round(angle)}deg)">↑</span>`,iconSize:[24,24],iconAnchor:[12,12]})}).addTo(view);
      arrows.push(marker);
    }
    view.fitBounds(line.getBounds(),{paddingTopLeft:[35,55],paddingBottomRight:[35,110],maxZoom:18,animate:true});
    return ()=>{casing.remove();line.remove();arrows.forEach(a=>a.remove());};
  },[walk]);

  useEffect(()=>{
    const view=map.current;if(!view||!routePoint||!walk?.length)return;
    const idx=walk.reduce((best,p,i)=>distance(p,routePoint)<distance(walk[best],routePoint)?i:best,0);
    const next=walk[Math.min(idx+1,walk.length-1)];
    const angle=bearing(routePoint,next);
    const marker=L.marker(routePoint,{icon:L.divIcon({className:'route-position-marker',html:`<span style="transform:rotate(${Math.round(angle)}deg)">↑</span>`,iconSize:[42,42],iconAnchor:[21,21]}),zIndexOffset:1000}).addTo(view);
    return ()=>{marker.remove();};
  },[routePoint,walk]);

  useEffect(()=>{
    const view=map.current;if(!view)return;
    const items=[{id:'sub',kind:'Water',title:'SUB water refill'},{id:'cab',kind:'Microwaves',title:'CAB basement microwaves'},{id:'cameron',kind:'Microwaves',title:'InfoLink microwave'}];
    const layer=L.layerGroup().addTo(view);
    for(const item of items.filter(item=>amenity===item.kind)){
      const b=buildings.find(b=>b.id===item.id);
      if(!b)continue;
      const marker=L.marker(b.point,{title:item.title,alt:item.title,zIndexOffset:80,icon:L.divIcon({className:'amenity-map-marker',html:'<span></span>',iconSize:[22,22]})}).addTo(layer);
      marker.bindTooltip(item.title,{direction:'top'});
      marker.on('click',()=>amenityCallback.current(item.kind));
    }
    return ()=>{layer.remove();};
  },[amenity]);

  useEffect(()=>{const timer=setTimeout(()=>map.current?.invalidateSize(),150);return ()=>clearTimeout(timer);},[expanded]);
  return <div id="campus-map-panel" className={'outdoor campus-map-stage '+(expanded?'expanded-map':'')}>
    <div className="campus-map-canvas" ref={element} aria-label="Interactive University of Alberta North Campus map"/>
    <div className="campus-map-kicker"><Compass size={14}/> NORTH CAMPUS · EDMONTON</div>
    {mapTilesFailed&&<div className="campus-map-offline" role="status">Map imagery unavailable. Campus pins and mapped paths still work.</div>}
    <div className="campus-map-tools">
      <button aria-label="Find my approximate location" onClick={locate}><LocateFixed size={20}/></button>
      <button aria-label="Center selected building" onClick={()=>map.current?.flyTo(selected.point,17,{duration:.5})}><Navigation size={20}/></button>
      <button aria-label={expanded?'Reduce map size':'Expand map'} onClick={()=>setExpanded(v=>!v)}>{expanded?<Minimize2 size={19}/>:<Maximize2 size={19}/>}</button>
      <button aria-label={aerial?'Switch to street map':'Switch to aerial imagery'} aria-pressed={aerial} onClick={()=>setAerial(value=>!value)}><Layers size={18}/></button>
      <button aria-label="Refresh map rendering" onClick={()=>map.current?.invalidateSize()}><RefreshCw size={18}/></button>
    </div>
    <div className="campus-map-bottom-label">Walking routes follow mapped campus paths. Check conditions on site.</div>
  </div>;
}

export const anchors={entry:'Entrance',south:'South hall',hall:'Central corridor',west:'Refill station',east:'Group rooms',north:'Study room',corner:'Elevator'} as const;
