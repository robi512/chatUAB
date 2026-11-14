/** Schematic routing helpers. Pixel lengths are not physical metres. */
export type XY = readonly [number,number];
export type CardinalTurn = 'left'|'right'|'straight';
export const routeCoordinates = (corridor:readonly XY[], start:number, end:number):XY[] =>
  start<=end ? corridor.slice(start,end+1) : corridor.slice(end,start+1).reverse();
export const segmentLength = (points:readonly XY[]):number => points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);
export function turnBetween(a:XY,b:XY,c:XY):CardinalTurn {
  const abx=b[0]-a[0],aby=b[1]-a[1],bcx=c[0]-b[0],bcy=c[1]-b[1];
  const cross=abx*bcy-aby*bcx;
  const denom=Math.hypot(abx,aby)*Math.hypot(bcx,bcy);
  if(!denom||Math.abs(cross/denom)<0.3)return 'straight';
  return cross>0?'right':'left'; // svg coordinates have y increasing downwards
}
export function instructions(points:readonly XY[]):string[]{
  if(points.length<2)return ['Already at destination'];
  const steps=['Start at the selected point'];
  for(let i=1;i<points.length-1;i++){
    const turn=turnBetween(points[i-1],points[i],points[i+1]);
    if(turn!=='straight')steps.push(`Schematic ${turn} bend`);
  }
  steps.push('Arrive at selected destination');
  return steps;
}
export const svgRoute=(points:readonly XY[])=>points.length?`M ${points.map(([x,y])=>`${x} ${y}`).join(' L ')}`:'';
