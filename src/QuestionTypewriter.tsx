import {useEffect,useState} from 'react';
export const campusQuestions=[
  'Where is the nearest water fountain?',
  'Where is my next class?',
  'Find a quiet study space.',
  'How do I get to CCIS?',
  'What is happening on campus?',
  'Where can I print on campus?'
];
export function QuestionTypewriter(){
  const [step,setStep]=useState(0);
  const [count,setCount]=useState(0);
  const [backspace,setBackspace]=useState(false);
  useEffect(()=>{
    if(typeof window==='undefined'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const q=campusQuestions[step];
    const delay=!backspace&&count===q.length?1800:backspace?30:55;
    const timer=window.setTimeout(()=>{
      if(!backspace&&count===q.length){setBackspace(true);return;}
      if(backspace&&count===0){setBackspace(false);setStep(v=>(v+1)%campusQuestions.length);return;}
      setCount(v=>v+(backspace?-1:1));
    },delay);
    return ()=>window.clearTimeout(timer);
  },[step,count,backspace]);
  return <span aria-hidden="true" className="question-typing">{campusQuestions[step].slice(0,count)||campusQuestions[step].slice(0,1)}<span className="question-caret"/></span>;
}
