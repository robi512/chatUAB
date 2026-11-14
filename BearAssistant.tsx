/** Uploaded university bear artwork animated for ChatUAB; independent student project. */
export function BearAssistant({size=44,thinking=false}:{size?:number;thinking?:boolean}){
  return <span className={'bear-assistant-mascot'+(thinking?' bear-thinking':'')} style={{width:size,height:size}} role="img" aria-label="Friendly campus bear companion">
    <span className="bear-aura" aria-hidden="true"/>
    <img src={import.meta.env.BASE_URL+'art/bear-mascot.png'} alt="" draggable={false}/>
    <span className="bear-blink" aria-hidden="true"/>
    <span className="bear-heart" aria-hidden="true">✦</span>
  </span>;
}
