import React from 'react';
import ReportsTable from '../components/ReportsTable.jsx';
export default function MyReports({
  reports,
  user,
  openReport,
  busy
}) {
  return <section className="page"><span className="eyebrow">Your workspace</span><h1>{user.role === 'reporter' ? 'My Reports' : user.role==='reviewer'?'All Reported Cases':'Assigned Cases'}</h1><p>Search your available cases, filter by status, and open a report to view its details and authorized conversation.</p><ReportsTable reports={reports} openReport={openReport} busy={busy} title="Case workspace"/></section>;
}
