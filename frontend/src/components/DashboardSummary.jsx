import React from 'react';
import { FileText, Clock, Settings, CheckCircle2, ShieldCheck } from 'lucide-react';
export default function DashboardSummary({
  user,
  reports
}) {
  const cards = [[FileText, 'Submitted', 'Reports you have submitted', 'lavender'], [Clock, 'Under Review', 'Being reviewed by staff', 'pink'], [Settings, 'In Progress', 'Action is being taken', 'blue'], [CheckCircle2, 'Closed', 'Resolved and completed', 'teal']];
  return <><div className="page-heading"><div><span className="eyebrow">{user.role} workspace</span><h1>Welcome back, {user.name}</h1><p>Your reports and messages are visible only to authorized case participants.</p></div>{user.profileCode && <div className="code-card"><ShieldCheck size={28} /><div><small>Private profile code</small><strong>{user.profileCode}</strong><small>An identifier, not a password</small></div></div>}</div><div className="stats-grid">{cards.map(([Icon, status, caption, color]) => <article className={'stat-card ' + color} key={status}><span className="stat-icon"><Icon size={25} /></span><div><strong>{reports.filter(r => r.status === status || status === 'Under Review' && r.status === 'Awaiting Clarification').length}</strong><h3>{status}</h3><p>{caption}</p></div></article>)}</div></>;
}
