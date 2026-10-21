import React from 'react';
export function StatusBadge({
  status
}) {
  return <span className={'status status-' + status.toLowerCase().replaceAll(' ', '-')}>{status}</span>;
}
export default function ReportCard({
  report,
  onOpen,
  busy
}) {
  return <button disabled={busy} className="report-card" onClick={() => onOpen(report.id)}><small>{report.code}</small><h3>{report.category}</h3><p className="report-card-description">{report.description}</p><StatusBadge status={report.status} /><p>{new Date(report.createdAt).toLocaleDateString()}</p><strong>Open report →</strong></button>;
}
