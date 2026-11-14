import {CampusArt} from './CampusArt';

const layers=[
  {name:'Main-floor study seating',icon:'Study'},
  {name:'Teaching labs and services',icon:'Classrooms'},
  {name:'McCullough Reading Room',icon:'Spaces'},
  {name:'Cupola corridor',icon:'Map'},
  {name:'Computing Science office',icon:'Classrooms'},
  {name:'Floor 6',icon:'Map'},
  {name:'Computing Science offices',icon:'Classrooms'},
];
export function CommonsCutaway({floor,select}:{floor:number;select:(n:number)=>void}){
  return <div className="commons-cutaway" aria-label="Illustrated floor selector">
    <div className="cutaway-scene">
      {layers.slice(0,4).map((layer,i)=><button key={layer.name} className={'cut-floor '+(floor===i+1?'cut-active':'')} style={{bottom:18+i*42,left:20+i*14,zIndex:i+1}} onClick={()=>select(i+1)} aria-label={'Explore floor '+(i+1)}>
        <span className="cut-wall"/><span className="cut-glass"/><span className="cut-furniture"><i/><i/><i/></span><span className="cut-pin"><CampusArt name={layer.icon}/></span><strong>F{i+1}</strong>
      </button>)}
    </div>
    <div className="cut-caption"><span>Floor {floor}</span><strong>{layers[floor-1].name}</strong><small>Illustrated building overview</small></div>
  </div>;
}
