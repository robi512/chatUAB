import {useEffect,useRef,type ReactNode} from 'react';
import {Bookmark,ChevronRight,X} from 'lucide-react';
export function Sheet({title,close,children}:{title:string;close:()=>void;children:ReactNode}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const el=ref.current;if(el&&!el.open)el.showModal();return()=>el?.close();},[]);
  return <dialog ref={ref} className="sheet" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}} aria-labelledby="sheet-title"><header><div className="grab"/><h2 id="sheet-title">{title}</h2><button onClick={close} className="icon" aria-label="Close"><X size={20}/></button></header><div className="sheet-content">{children}</div></dialog>;
}
export function Save({id,saved,toggle}:{id:string;saved:string[];toggle:(id:string)=>void}){
  const active=saved.includes(id);
  return <button className="save icon" aria-pressed={active} aria-label={active?'Remove bookmark':'Save bookmark'} onClick={()=>toggle(id)}><Bookmark size={21} fill={active?'currentColor':'none'}/></button>;
}
export function Row({icon,title,onClick}:{icon:ReactNode;title:string;onClick:()=>void}){
  return <button className="list-row" onClick={onClick}>{icon}<span>{title}</span><ChevronRight size={17}/></button>;
}
export function Head({title,subtitle,action}:{title:string;subtitle:string;action?:ReactNode}){
  return <header className="page-head"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</header>;
}
export function External({href,children,className='pill'}:{href:string;children:ReactNode;className?:string}){
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>;
}
