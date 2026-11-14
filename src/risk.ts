export function inspectLink(input:string){
  let url:URL;
  try{url=new URL(/^[a-z][a-z\d+.-]*:/i.test(input.trim())?input.trim():'https://'+input.trim());}
  catch{return {label:'Invalid address',flags:['This text could not be read as a URL.']};}
  const host=url.hostname.toLowerCase();
  const flags:string[]=[];
  if(url.protocol!=='https:')flags.push('The address does not use HTTPS.');
  if(!['https:','http:'].includes(url.protocol))flags.push('Unsupported link scheme.');
  if(url.username||url.password)flags.push('The address contains credentials before the actual host.');
  if(host.split('.').some(s=>s.startsWith('xn--')))flags.push('The domain uses encoded international characters. Check it for lookalikes.');
  if(/^(\d+\.){3}\d+$/.test(host)||host.startsWith('['))flags.push('The destination is an IP address.');
  if(/ualberta|beartracks|bear-tracks/.test(host)&&!/(^|\.)ualberta\.ca$/.test(host))flags.push('The domain resembles a campus service but sits outside ualberta.ca.');
  if(['bit.ly','t.co','tinyurl.com','is.gd','shorturl.at'].includes(host))flags.push('The short link hides the final destination.');
  if(!host.includes('.')&&!host.startsWith('['))flags.push('The host is missing a public domain suffix.');
  return {label:flags.length?'Suspicious signals found':'No obvious URL warning signs',host,flags};
}
