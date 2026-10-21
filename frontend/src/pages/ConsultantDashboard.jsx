import React from 'react';
import {MessageSquare,ArrowUpRight,NotebookPen} from 'lucide-react';
import DashboardSummary from '../components/DashboardSummary.jsx';
import ReportsTable from '../components/ReportsTable.jsx';
export default function ConsultantDashboard(props){
 const {reports,busy,openReport,navigate}=props,active=reports.find(r=>r.status!=='Closed');
 return <section className="page dashboard"><DashboardSummary {...props}/><div className="dashboard-layout"><ReportsTable {...props} title="Your Assigned Cases"/><aside className="dashboard-side"><article className="panel action-panel"><span className="action-icon"><MessageSquare size={23}/></span><h2>Continue case support</h2><p>Read the conversation before adding advice or updating progress.</p>{active?<button disabled={busy} className="purple" onClick={()=>openReport(active.id)}>Open active case <ArrowUpRight size={16}/></button>:<p className="side-empty">No active assigned cases.</p>}</article><article className="panel action-panel"><span className="action-icon teal-icon"><NotebookPen size={23}/></span><h2>Keep notes purposeful</h2><p>Internal notes stay within authorized staff access. Keep public guidance general and free of identifying details.</p><button disabled={busy} onClick={()=>navigate('community')}>Read community guidance</button></article></aside></div></section>;
}
