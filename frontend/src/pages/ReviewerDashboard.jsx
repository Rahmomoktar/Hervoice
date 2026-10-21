import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { call } from '../lib/api.js';
import DashboardSummary from '../components/DashboardSummary.jsx';
import ReportsTable from '../components/ReportsTable.jsx';
export default function ReviewerDashboard(props) {
  const {
    unassigned,
    busy,
    run,
    token,
    refresh,
    N
  } = props;
  return <section className="page dashboard"><DashboardSummary {...props} /><ReportsTable {...props} title="All Reported Cases" /><section className="panel"><h2><ClipboardCheck size={24} />Unassigned Reports</h2><p className="fineprint">Open any case to review its details. Claim a case to manage its private conversation, then accept it before assigning a consultant.</p>{unassigned.length ? unassigned.map(r => <div className="report-line" key={r.id}><span><strong>{r.code}</strong> · {r.category}</span><button disabled={busy} onClick={() => run(async () => {
          await call('/reports/' + r.id + '/claim', 'POST', {}, token);
          await refresh();
          N('Case assigned to you');
        })}>Claim case</button></div>) : <p>No reports are waiting to be assigned.</p>}</section></section>;
}
