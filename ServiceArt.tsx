import type {CSSProperties} from 'react';
export type ArtName='study'|'classrooms'|'water'|'food'|'events'|'map'|'printing'|'transit'|'microwave'|'outlets'|'verify'|'group';
const base=import.meta.env.BASE_URL;
export function ServiceArt({name,size=68}:{name:ArtName;size?:number}){
  return <span className="service-art" style={{'--art-size':`${size}px`} as CSSProperties} aria-hidden="true"><img src={`${base}art/${name}.webp`} alt="" loading="lazy"/></span>;
}
