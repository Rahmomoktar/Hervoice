import React from 'react';
import DashboardSummary from '../components/DashboardSummary.jsx';
import ReportsTable from '../components/ReportsTable.jsx';
export default function ConsultantDashboard(props) {
  return <section className="page dashboard"><DashboardSummary {...props} /><ReportsTable {...props} title="All Accepted Reports" /><div className="support-banner"><strong>Thoughtful support, one case at a time.</strong><p>Read any report accepted by a reviewer. Private messages, notes and status changes are available after the reviewer assigns the case to you.</p></div></section>;
}
