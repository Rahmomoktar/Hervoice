import React from 'react';
import { MessageSquare, Bot, ArrowRight } from 'lucide-react';
import DashboardSummary from '../components/DashboardSummary.jsx';
import ReportsTable from '../components/ReportsTable.jsx';
export default function ReporterDashboard(props) {
  const {
    navigate,
    reports,
    openReport,
    busy
  } = props;
  return <section className="page dashboard"><DashboardSummary {...props} /><ReportsTable {...props} reports={reports.slice(0, 5)} /><div className="two-cols dashboard-extras"><article className="panel"><h2><MessageSquare size={24} />Private Messages</h2><p>Continue a conversation with your assigned case team.</p>{reports.length ? <button className="purple" disabled={busy} onClick={() => openReport(reports[0].id)}>Open latest report <ArrowRight size={17} /></button> : <p className="fineprint">Messages will be available from your report once a reviewer is assigned.</p>}</article><article className="panel assistant-preview"><h2><Bot size={24} />AI Consultant</h2><div className="bubble">How can I explain the reporting process?</div><p>Explore predefined answers in our classroom assistant.</p><button onClick={() => navigate('ai')}>Open chat <ArrowRight size={17} /></button></article></div></section>;
}
