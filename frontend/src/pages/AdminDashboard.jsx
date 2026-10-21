import React,{useState} from 'react';
import WorkspaceIntro from '../components/WorkspaceIntro.jsx';
import SpecialistFields,{ConsultantProfileEditor} from '../components/SpecialistFields.jsx';
import { Users, UserPlus } from 'lucide-react';
export default function AdminDashboard({
  user,
  navigate,
  token,
  refresh,
  users,
  newStaff,
  J,
  createStaff,
  removeUser,
  staffInvitation,
  busy
}) {
  const [query,Q]=useState(''),[roleFilter,V]=useState('');
  const visible=users.filter(u=>(!roleFilter||u.role===roleFilter)&&(!query||[u.name,u.email,u.consultantTitle||'',u.organization||''].some(v=>v.toLowerCase().includes(query.toLowerCase()))));
  return <section className="page dashboard admin-dashboard"><WorkspaceIntro user={user} navigate={navigate} busy={busy}/><div className="stats-grid">{['reporter', 'reviewer', 'consultant', 'admin'].map((role, i) => <article className={'stat-card ' + ['lavender', 'pink', 'blue', 'teal'][i]} key={role}><Users /><div><strong>{users.filter(u => u.role === role).length}</strong><h3>{role}s</h3></div></article>)}</div><div className="dashboard-layout"><section className="panel"><h2><Users size={23} />Registered Accounts</h2><p className="section-subtitle">{users.length} accounts in the current list</p><div className="case-toolbar"><label><span className="sr-only">Search accounts</span><input placeholder="Search name or email" value={query} onChange={e=>Q(e.target.value)}/></label><label><span className="sr-only">Filter account role</span><select value={roleFilter} onChange={e=>V(e.target.value)}><option value="">All roles</option>{['reporter','reviewer','consultant','admin'].map(r=><option key={r}>{r}</option>)}</select></label></div><div className="admin-account-list">{!visible.length&&<p className="empty-state">No matching accounts.</p>}{visible.map(u => <div className="report-line" key={u.id}><span><strong>{u.name}</strong><small>{u.email}</small>{u.role==='consultant'&&<span className="consultant-profile-line">{u.consultantTitle||'General consultant'}{u.organization?' · '+u.organization:''}<br/>{u.specialties?.join(' · ')}</span>}</span><div className="account-actions"><span className="status">{u.role}{u.active===false?' · Invited':''}</span>{u.role!=='admin'&&<button disabled={busy} className="remove-user" onClick={()=>removeUser(u)}>Remove user</button>}</div>{u.role==='consultant'&&<ConsultantProfileEditor account={u} token={token} onSaved={refresh}/>}</div>)}</div></section><div><section className="panel" id="add-staff"><h2><UserPlus size={23} />Manage Staff → Add Staff</h2><p className="fineprint">Create a reviewer or consultant account with a password of 8 or more characters.</p><form onSubmit={createStaff}><label>Name<input required minLength={2} maxLength={80} value={newStaff.name} onChange={e => J({
              ...newStaff,
              name: e.target.value
            })} /></label><label>Email<input type="email" required maxLength={254} value={newStaff.email} onChange={e => J({
              ...newStaff,
              email: e.target.value
            })} /></label><label>Password<input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={newStaff.password} onChange={e=>J({...newStaff,password:e.target.value})}/></label><label>Role<select value={newStaff.role} onChange={e => J({
              ...newStaff,
              role: e.target.value
            })}><option value="reviewer">Reviewer</option><option value="consultant">Human consultant</option></select></label>{newStaff.role==='consultant'&&<SpecialistFields value={newStaff} onChange={J}/>}<button disabled={busy||(newStaff.role==='consultant'&&newStaff.specialties?.length===0)} className="purple">Create staff account</button></form>{staffInvitation?.delivery==='local'&&<div className="invitation-result"><h3>Local demo invitation</h3><p>Email was not sent. This private link grants account activation and expires in 24 hours. Open it in a separate browser tab for the staff member.</p><a href={staffInvitation.invitationUrl} target="_blank" rel="noreferrer">Open password setup</a><label>Private invitation link<input readOnly value={staffInvitation.invitationUrl} onFocus={e=>e.target.select()}/></label></div>}</section><section className="moderation-shortcut"><h2>Community care</h2><p>Review pending advice and manage reviewer moderation permissions. Private case content stays outside this workspace.</p><button disabled={busy} onClick={()=>navigate('community')}>Open moderation workspace</button></section></div></div></section>;
}