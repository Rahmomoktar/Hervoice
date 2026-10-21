import {useEffect,useState} from 'react';

export const paths={community:'/community',home:'/',login:'/login',register:'/register',dashboard:'/dashboard',reports:'/reports','new-report':'/reports/new',ai:'/ai-consultant',invite:'/accept-invitation'};
export function resolveRoute(pathname){
 const path=pathname.replace(/\/+$/,'')||'/';
 const match=Object.entries(paths).find(([,url])=>url===path);
 if(match)return {view:match[0],protected:!['home','login','register','invite'].includes(match[0])};
 const detail=path.match(/^\/reports\/([a-f\d]{24})$/i);
 if(detail)return {view:'detail',reportId:detail[1],protected:true};
 return {view:'not-found',protected:false};
}
const readLocation=()=>({pathname:window.location.pathname,hash:window.location.hash});
export function useNavigation(){
 const [location,setLocation]=useState(readLocation);
 useEffect(()=>{const sync=()=>setLocation(readLocation());window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync)}},[]);
 function go(view,{reportId,hash,replace=false}={}){
  const path=view==='detail'?'/reports/'+encodeURIComponent(reportId):paths[view];
  if(!path)throw new Error('Unknown page');
  const url=path+(hash?'#'+encodeURIComponent(hash):'');
  if(window.location.pathname+window.location.hash!==url){window.history[replace?'replaceState':'pushState'](null,'',url);setLocation(readLocation())}
 }
 return {location,route:resolveRoute(location.pathname),go};
}
