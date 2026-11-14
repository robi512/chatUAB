import graph from './campus-graph.json';
import {distance} from './logic';

export type Point=[number,number];
const points=graph.nodes as Point[];
const adjacency=points.map(()=>[] as {id:number;meters:number}[]);
for(const [a,b] of graph.edges){
  const meters=distance(points[a],points[b]);
  adjacency[a].push({id:b,meters});adjacency[b].push({id:a,meters});
}
const candidates=(p:Point)=>points.map((point,id)=>({id,meters:distance(p,point)})).filter(x=>x.meters<=145).sort((a,b)=>a.meters-b.meters).slice(0,8);
export function walkingRoute(start:Point,end:Point){
  const origins=candidates(start),targets=candidates(end);
  if(!origins.length||!targets.length)return null;
  const costs=points.map(()=>Infinity),previous=points.map(()=>-1),visited=new Set<number>();
  const queue=new Set<number>();
  for(const item of origins){costs[item.id]=item.meters*2;queue.add(item.id);}
  while(queue.size){
    let current=-1;
    for(const id of queue)if(current<0||costs[id]<costs[current])current=id;
    queue.delete(current);visited.add(current);
    for(const edge of adjacency[current]){
      const cost=costs[current]+edge.meters;
      if(!visited.has(edge.id)&&cost<costs[edge.id]){costs[edge.id]=cost;previous[edge.id]=current;queue.add(edge.id);}
    }
  }
  const target=targets.filter(x=>Number.isFinite(costs[x.id])).sort((a,b)=>costs[a.id]+a.meters*2-costs[b.id]-b.meters*2)[0];
  if(!target)return null;
  const path:Point[]=[];
  for(let id=target.id;id>=0;id=previous[id])path.unshift(points[id]);
  const meters=path.reduce((sum,point,i)=>i?sum+distance(path[i-1],point):sum,0);
  return {path,meters,approach:Math.round(distance(end,path[path.length-1]))};
}
export function bearing(from:Point,to:Point){
  const lat=(from[0]+to[0])*Math.PI/360;
  return (Math.atan2((to[1]-from[1])*Math.cos(lat),to[0]-from[0])*180/Math.PI+360)%360;
}

export function walkingSteps(path:Point[]){
  const steps:{index:number;meters:number;instruction:string}[]=[];
  let meters=0,last=0;
  for(let i=1;i<path.length;i++){
    meters+=distance(path[i-1],path[i]);
    const turn=i<path.length-1?(bearing(path[i],path[i+1])-bearing(path[i-1],path[i])+540)%360-180:0;
    if(i===path.length-1||Math.abs(turn)>=38&&meters-last>=7){
      steps.push({index:i,meters,instruction:i===path.length-1?'Reach the end of the mapped path':turn<0?'Turn left':'Turn right'});
      last=meters;
    }
  }
  return steps;
}
