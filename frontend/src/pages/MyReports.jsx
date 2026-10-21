import React from 'react';
import ReportCard from '../components/ReportCard.jsx';
export default function MyReports({
  reports,
  user,
  openReport,
  busy
}) {
  return <section className="page"><span className="eyebrow">Your workspace</span><h1>{user.role === 'reporter' ? 'My Reports' : user.role==='reviewer'?'All Reported Cases':'Accepted Cases'}</h1><p>Open a report to view its status and private messages.</p>{reports.length ? <div className="report-grid">{reports.map(report => <ReportCard key={report.id} report={report} onOpen={openReport} busy={busy} />)}</div> : <div className="panel empty-state"><h2>No reports yet</h2><p>{user.role === 'reporter' ? 'Submit a fictional concern to get started.' : 'Assigned cases will appear here.'}</p></div>}</section>;
}
