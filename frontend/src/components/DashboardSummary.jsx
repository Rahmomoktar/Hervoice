import React from 'react';
import {FileText,Clock,Activity,CheckCircle2,ArrowUpRight} from 'lucide-react';
import WorkspaceIntro from './WorkspaceIntro.jsx';
export default function DashboardSummary(props){
 const {user,reports,navigate,busy}=props;
 const cards=[[FileText,user.role==='reviewer'?'All reported cases':user.role==='consultant'?'Assigned cases':'Your reports',reports.length,'In your current case list','lavender'],[Clock,'Awaiting clarification',reports.filter(r=>r.status==='Awaiting Clarification').length,'A follow-up may be needed','pink'],[Activity,'Active cases',reports.filter(r=>['Under Review','In Progress'].includes(r.status)).length,'Under review or in progress','blue'],[CheckCircle2,'Closed cases',reports.filter(r=>r.status==='Closed').length,'Marked closed by case staff','teal']];
 return <><WorkspaceIntro {...props}/><div className="stats-grid overview-metrics">{cards.map(([Icon,label,value,caption,tone])=><article className={'stat-card '+tone} key={label}><div className="metric-top"><span className="stat-icon"><Icon size={21}/></span><span className="metric-label">{label}</span></div><strong>{value}</strong><p>{caption}</p></article>)}</div><div className="workspace-section-label"><span>CASE OVERVIEW</span><button disabled={busy} className="text-button" onClick={()=>navigate('reports')}>Open case workspace <ArrowUpRight size={15}/></button></div></>;
}
