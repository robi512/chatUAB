import {Armchair,BookOpen,CalendarDays,Droplet,GraduationCap,MapPin,Microwave,Plug,ShieldCheck,Sparkles} from 'lucide-react';

const artwork={
  Spaces:[Armchair,'#b8dfce','#145c49'], Classrooms:[GraduationCap,'#ffe7a4','#715016'],
  Outlets:[Plug,'#d6e3fb','#37528a'], Water:[Droplet,'#c6ebfb','#176281'],
  Microwaves:[Microwave,'#ffd9b4','#864710'], Events:[CalendarDays,'#ffd8ce','#8b3f31'],
  Map:[MapPin,'#b8e3c0','#145a3f'], More:[Sparkles,'#e4dafa','#5d4188'],
  Home:[MapPin,'#ffe5a0','#164936'], Study:[BookOpen,'#c5e6cf','#155339'],
  Verify:[ShieldCheck,'#d2e5ff','#224c78'],
} as const;
export function CampusArt({name}:{name:string}){
  const [Icon,light,ink]=artwork[name as keyof typeof artwork]??artwork.More;
  return <span className="campus-art" aria-hidden="true" style={{backgroundColor:light,color:ink}}><Icon strokeWidth={2.1}/></span>;
}
