import React,{useState} from 'react';
import {consultantTitles,specialistCategories} from '../lib/specialists.js';
import {call} from '../lib/api.js';
import '../specialists.css';
export default function SpecialistFields({value,onChange}){
 const specialties=value.specialties??specialistCategories;
 return <div className="specialist-fields"><label>Consultant title<select value={value.consultantTitle??'General consultant'} onChange={e=>onChange({...value,consultantTitle:e.target.value})}>{consultantTitles.map(t=><option key={t}>{t}</option>)}</select></label><label>Organization or team (optional)<input maxLength={100} value={value.organization??''} onChange={e=>onChange({...value,organization:e.target.value})} placeholder="For example: fictional support organization"/></label><fieldset className="specialty-options"><legend>Report categories this consultant supports</legend>{specialistCategories.map(c=><label key={c}><input type="checkbox" checked={specialties.includes(c)} onChange={e=>onChange({...value,specialties:e.target.checked?[...specialties,c]:specialties.filter(s=>s!==c)})}/>{c}</label>)}</fieldset><p className="specialist-help">A title describes the support role; it is not a credential verification. Reviewers assign only accepted cases in a consultant’s supported categories. Police and organization contacts are internal consultant accounts; no report is sent outside the app.</p></div>;
}
export function ConsultantProfileEditor({account,token,onSaved}){
 const [form,F]=useState({consultantTitle:account.consultantTitle??'General consultant',organization:account.organization??'',specialties:account.specialties??specialistCategories}),[busy,B]=useState(false),[error,E]=useState(''),[notice,N]=useState('');
 async function save(e){e.preventDefault();if(busy)return;B(true);E('');N('');try{const d=await call('/admin/users/'+account.id+'/specialist','PATCH',form,token);await onSaved();N(d.message)}catch(err){E(err.message)}finally{B(false)}}
 return <details className="specialist-editor"><summary>Edit consultant specialty</summary><form onSubmit={save}><SpecialistFields value={form} onChange={F}/>{error&&<p role="alert" className="specialist-error">{error}</p>}{notice&&<p role="status">{notice}</p>}<button disabled={busy||!form.specialties.length}>{busy?'Saving…':'Save specialist profile'}</button></form></details>;
}
