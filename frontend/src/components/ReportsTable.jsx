import React from 'react';
import { FileText, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from './ReportCard.jsx';
export default function ReportsTable({
  reports,
  openReport,
  busy,
  title = 'My Recent Reports',
  navigate
}) {
  return <section className="panel report-table-panel"><div className="section-heading"><h2><FileText size={23} />{title}</h2>{navigate && <button className="text-button" onClick={() => navigate('reports')}>View all →</button>}</div>{reports.length ? <div className="table-scroll"><table><thead><tr><th>Reference</th><th>Report category and written report</th><th>Date submitted</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{reports.map(r => <tr key={r.id}><td>{r.code}</td><td className="written-report-cell"><strong>{r.category}</strong><p className="written-report-text">{r.description}</p>{r.accepted&&<small className="accepted-label">Accepted by reviewer</small>}</td><td>{new Date(r.createdAt).toLocaleDateString()}</td><td><StatusBadge status={r.status} /></td><td><button disabled={busy} className="open-report" onClick={() => openReport(r.id)} aria-label={'Open report ' + r.code}><span>View details</span><ArrowUpRight size={18} /></button></td></tr>)}</tbody></table></div> : <div className="empty-state"><FileText size={30} /><h3>Your next chapter starts here</h3><p>No reports to display yet.</p></div>}</section>;
}
