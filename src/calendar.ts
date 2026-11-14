const escape=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&');
const stamp=(s:string)=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
export function calendarFile(id:string,title:string,start:string,end:string,place:string){
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ChatUAB//EN','BEGIN:VEVENT',
    'UID:'+escape(id)+'@chatuab.local','DTSTAMP:'+stamp(new Date().toISOString()),
    'DTSTART:'+stamp(start),'DTEND:'+stamp(end),'SUMMARY:'+escape(title),'LOCATION:'+escape(place),
    'END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
export function downloadCalendar(id:string,title:string,start:string,end:string,place:string){
  const url=URL.createObjectURL(new Blob([calendarFile(id,title,start,end,place)],{type:'text/calendar;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=id+'.ics';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
