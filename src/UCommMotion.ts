import type {UCommGraph,UCommNode,UCommRoute} from './UniversityCommonsModel';

export type MapCamera={zoom:number;panX:number;panY:number};
/** Camera translation required to place a selected map node at the centre of the scene. */
export function cameraForNode(node:Pick<UCommNode,'x'|'y'>,zoom=1.5):MapCamera{
 return {zoom,panX:(350-node.x)*zoom,panY:(360-node.y)*zoom};
}
/** Smooth, continuous SVG path through graph nodes; rounded corners remain inside the schematic circulation. */
export function roundedRoute(nodes:ReadonlyArray<Pick<UCommNode,'x'|'y'>>,radius=12):string{
 if(!nodes.length)return '';
 if(nodes.length===1)return `M ${nodes[0].x} ${nodes[0].y}`;
 let d=`M ${nodes[0].x} ${nodes[0].y}`;
 for(let i=1;i<nodes.length-1;i++){
  const p=nodes[i-1],q=nodes[i],n=nodes[i+1];
  const before=Math.hypot(q.x-p.x,q.y-p.y),after=Math.hypot(n.x-q.x,n.y-q.y);
  const bend=Math.min(radius,before/2,after/2);
  if(bend<1){d+=` L ${q.x} ${q.y}`;continue;}
  const a={x:q.x-(q.x-p.x)*bend/before,y:q.y-(q.y-p.y)*bend/before};
  const b={x:q.x+(n.x-q.x)*bend/after,y:q.y+(n.y-q.y)*bend/after};
  d+=` L ${a.x.toFixed(2)} ${a.y.toFixed(2)} Q ${q.x} ${q.y} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
 }
 const last=nodes[nodes.length-1];return d+` L ${last.x} ${last.y}`;
}
/** Retain meaningful turns, floor transitions, first position and arrival instead of every graph subdivision. */
export function routeMoments(graph:UCommGraph,route:NonNullable<UCommRoute>):number[]{
 const byId=new Map(graph.nodes.map(n=>[n.id,n]));
 const ids=route.ids;if(ids.length<=2)return ids.map((_,i)=>i);
 const moments=[0];
 for(let i=1;i<ids.length-1;i++){
  const prev=byId.get(ids[i-1])!,here=byId.get(ids[i])!,next=byId.get(ids[i+1])!;
  if(prev.floor!==here.floor||here.floor!==next.floor){moments.push(i);continue;}
  const ax=here.x-prev.x,ay=here.y-prev.y,bx=next.x-here.x,by=next.y-here.y;
  const mag=Math.hypot(ax,ay)*Math.hypot(bx,by);
  if(mag>0&&Math.abs((ax*by-ay*bx)/mag)>.27)moments.push(i);
 }
 moments.push(ids.length-1);
 return [...new Set(moments)];
}

/**
 * Keep the plan reachable at every zoom level. A large fixed pan clamp was
 * allowing the entire building to slide out of view on narrow phones.
 * These limits scale with zoom so drag/pinch and cinematic motion share the
 * same visual boundaries.
 */
export const CAMERA_MIN_ZOOM=.94;
export const CAMERA_MAX_ZOOM=1.28;
export function clampCamera(camera:MapCamera):MapCamera {
 const finite=(value:number,fallback:number)=>Number.isFinite(value)?value:fallback;
 const zoom=Math.max(CAMERA_MIN_ZOOM,Math.min(CAMERA_MAX_ZOOM,finite(camera.zoom,1)));
 const allowanceX=60+Math.max(0,zoom-1)*260;
 const allowanceY=65+Math.max(0,zoom-1)*270;
 return {
  zoom,
  panX:Math.max(-allowanceX,Math.min(allowanceX,finite(camera.panX,0))),
  panY:Math.max(-allowanceY,Math.min(allowanceY,finite(camera.panY,0))),
 };
}

