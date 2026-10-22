import React from 'react';
import {Plus} from 'lucide-react';
import ReportsTable from '../components/ReportsTable.jsx';
export default function MyReports({
  reports,
  user,
  openReport,
  openMessages,
  busy,
  navigate
}) {
  const heading=user.role==='reporter'?'My Reports':user.role==='reviewer'?'All Reported Cases':'Assigned Cases';
  return <section className="page reports-page"><header className="reports-page-header"><div><h1>{heading}</h1><p>{user.role==='reporter'?'View and track the reports you have submitted. See their current status, recent updates, and messages from the review team or consultants.':'Review the cases available to your role, their status, and authorized conversations.'}</p></div>{user.role==='reporter'&&<button className="purple create-report-button" disabled={busy} onClick={()=>navigate('new-report')}><Plus size={25}/>Create New Report</button>}</header><ReportsTable reports={reports} openReport={openReport} openMessages={openMessages} busy={busy} showHeading={false}/></section>;
}
