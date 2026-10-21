import {useEffect,useRef} from 'react';
// Each request checks its page/session before applying results. Hidden tabs do not poll.
export function useAutoRefresh(callback,{enabled=true,scope='',interval=15000,onError}={}){
 const latest=useRef(callback),errorHandler=useRef(onError),currentScope=useRef(scope),currentEnabled=useRef(enabled);
 latest.current=callback;errorHandler.current=onError;currentScope.current=scope;currentEnabled.current=enabled;
 useEffect(()=>{
  if(!enabled)return;
  let cancelled=false,inFlight=false;
  const isCurrent=()=>!cancelled&&currentEnabled.current&&currentScope.current===scope;
  async function update(){
   if(document.visibilityState!=='visible'||inFlight||!isCurrent())return;
   inFlight=true;
   try{await latest.current(isCurrent)}catch(error){if(isCurrent())errorHandler.current?.(error)}finally{inFlight=false}
  }
  const timer=window.setInterval(update,interval);
  window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);
  return()=>{cancelled=true;window.clearInterval(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update)};
 },[enabled,scope,interval]);
}
