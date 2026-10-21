import React from 'react';
import { ShieldCheck, MessageCircle, Bot, PlusCircle } from 'lucide-react';
import { call } from '../lib/api.js';
import PrivateMessages from '../components/PrivateMessages.jsx';
import CommunitySharing from '../components/CommunitySharing.jsx';
const categories = ['Bullying', 'Harassment', 'Discrimination', 'Unfair Treatment', 'Other'];
export default function ReportDetails(props) {
  const {
    view,
    user,
    token,
    error,
    notice,
    busy,
    credentials,
    C,
    reportForm,
    F,
    reports,
    unassigned,
    users,
    consultants,
    selected,
    messages,
    message,
    G,
    note,
    H,
    newStaff,
    J,
    chat,
    prompt,
    P,
    navigate,
    run,
    refresh,
    authenticate,
    submit,
    openReport,
    sendMessage,
    updateReport,
    acceptCase,
    createStaff,
    askAI,
    logout,
    N
  } = props;
  return <section className="page"><button disabled={busy} onClick={() => run(async () => {
      await refresh();
      navigate('dashboard');
    })}>← Back to dashboard</button><h1>Report {selected.code}</h1>{selected.consultantProfile&&<div className="case-specialist"><ShieldCheck size={23}/><div><strong>Your assigned case specialist</strong><p>{selected.consultantProfile.name} · {selected.consultantProfile.consultantTitle}{selected.consultantProfile.organization?" · "+selected.consultantProfile.organization:""}</p></div></div>}{user?.role==='reviewer'&&!selected.reviewer&&<button className="purple" disabled={busy} onClick={acceptCase}>Accept case and assign to me</button>}<div className="two-cols"><div className="panel"><span className="status">{selected.status}</span><h2>{selected.category}</h2><p className="report-text">{selected.description}</p>{(user?.role==='consultant'&&selected.consultant===user.id||user?.role==='reviewer'&&selected.reviewer===user.id) && <><h3>Review actions</h3><div className="button-row"><select aria-label="Change status" value={selected.status} onChange={e => updateReport({
              status: e.target.value
            })}>{['Under Review', 'Awaiting Clarification', 'In Progress', 'Closed'].map(s => <option key={s}>{s}</option>)}</select></div>{user?.role === 'reviewer' && <>{!selected.accepted?<button className="purple" disabled={busy} onClick={acceptCase}>Accept case for consultant support</button>:<p className="accepted-label">✓ Accepted for consultant support</p>}<label>Assign a suitable case specialist<select disabled={!selected.accepted||busy} value={selected.consultant || ''} onChange={e => e.target.value && updateReport({
              consultant: e.target.value
            })}><option value="">Choose consultant</option>{consultants.filter(c=>c.id===selected.consultant||(c.specialties||categories).includes(selected.category)).map(c => <option key={c.id} value={c.id} disabled={!(c.specialties||categories).includes(selected.category)}>{c.name} · {c.consultantTitle||"General consultant"}{c.organization?" · "+c.organization:""}{!(c.specialties||categories).includes(selected.category)?" · existing assignment":""}</option>)}</select></label><p className="specialty-matches">Choose a consultant whose supported categories include {selected.category}. Titles describe internal support roles; assignment does not send reports to outside organizations or police.</p></>}</>}{user?.role === 'consultant' && selected.consultant===user.id && <><h3>Staff-only notes</h3>{selected.notes?.map((n, i) => <p className="staff-note" key={i}>{n.text}</p>)}<form onSubmit={e => {
            e.preventDefault();
            updateReport({
              note
            });
          }}><textarea aria-label="Internal case note" value={note} onChange={e => H(e.target.value)} minLength={3} maxLength={1000} required placeholder="Write an internal fictional case note" /><button disabled={busy} className="purple">Add note</button></form></>}</div><PrivateMessages {...props} /></div><CommunitySharing key={selected.id} selected={selected} user={user} token={token}/></section>;
}