import React from 'react';
import { Users, UserPlus } from 'lucide-react';
export default function AdminDashboard({
  user,
  users,
  newStaff,
  J,
  createStaff,
  removeUser,
  staffInvitation,
  busy
}) {
  return <section className="page dashboard"><span className="eyebrow">Administrator workspace</span><h1>Welcome back, {user.name}</h1><p>Manage classroom accounts and your support team.</p><div className="stats-grid">{['reporter', 'reviewer', 'consultant', 'admin'].map((role, i) => <article className={'stat-card ' + ['lavender', 'pink', 'blue', 'teal'][i]} key={role}><Users /><div><strong>{users.filter(u => u.role === role).length}</strong><h3>{role}s</h3></div></article>)}</div><div className="two-cols"><section className="panel"><h2><Users size={23} />Registered Accounts</h2>{users.map(u => <div className="report-line" key={u.id}><span><strong>{u.name}</strong><small>{u.email}</small></span><div className="account-actions"><span className="status">{u.role}{u.active===false?' · Invited':''}</span>{u.role!=='admin'&&<button disabled={busy} className="remove-user" onClick={()=>removeUser(u)}>Remove user</button>}</div></div>)}</section><section className="panel"><h2><UserPlus size={23} />Manage Staff → Add Staff</h2><p className="fineprint">Create a reviewer or consultant account with a password of 8 or more characters.</p><form onSubmit={createStaff}><label>Name<input required minLength={2} maxLength={80} value={newStaff.name} onChange={e => J({
              ...newStaff,
              name: e.target.value
            })} /></label><label>Email<input type="email" required maxLength={254} value={newStaff.email} onChange={e => J({
              ...newStaff,
              email: e.target.value
            })} /></label><label>Password<input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={newStaff.password} onChange={e=>J({...newStaff,password:e.target.value})}/></label><label>Role<select value={newStaff.role} onChange={e => J({
              ...newStaff,
              role: e.target.value
            })}><option value="reviewer">Reviewer</option><option value="consultant">Human consultant</option></select></label><button disabled={busy} className="purple">Create staff account</button></form>{staffInvitation?.delivery==='local'&&<div className="invitation-result"><h3>Local demo invitation</h3><p>Email was not sent. This private link grants account activation and expires in 24 hours. Open it in a separate browser tab for the staff member.</p><a href={staffInvitation.invitationUrl} target="_blank" rel="noreferrer">Open password setup</a><label>Private invitation link<input readOnly value={staffInvitation.invitationUrl} onFocus={e=>e.target.select()}/></label></div>}</section></div></section>;
}
