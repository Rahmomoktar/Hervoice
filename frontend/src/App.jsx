import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { call } from './lib/api.js';
import {useNavigation} from './lib/navigation.js';
import {useAutoRefresh} from './lib/useAutoRefresh.js';
import Navbar from './components/Navbar.jsx';
import ConfirmLogout from './components/ConfirmLogout.jsx';
import AuthForm from './components/AuthForm.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import ReporterDashboard from './pages/ReporterDashboard.jsx';
import SubmitReport from './pages/SubmitReport.jsx';
import MyReports from './pages/MyReports.jsx';
import ReportDetails from './pages/ReportDetails.jsx';
import ReviewerDashboard from './pages/ReviewerDashboard.jsx';
import ConsultantDashboard from './pages/ConsultantDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AIConsultant from './pages/AIConsultant.jsx';
import Community from './pages/Community.jsx';
import { ShieldCheck, MessageCircle, ClipboardCheck, Bot, Users, LogOut, PlusCircle, HeartHandshake } from 'lucide-react';
export default function App() {
  const {
    user,
    token,
    setUser: U,
    setToken: T
  } = useAuth();
  const [invitation] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('invite') || '');
  const [staffInvitation, setStaffInvitation] = useState(null);
  const [logoutPending,setLogoutPending]=useState(false);
  const {location,route,go}=useNavigation();
  const communityRequested=useRef(route.view==='community');
  const view=route.protected&&!user?'login':route.view;
  useEffect(()=>{if(invitation)go('invite',{replace:true});},[invitation]);
  useEffect(()=>{if(route.protected&&!user){if(route.view==='community')communityRequested.current=true;go('login',{replace:true});}},[location.pathname,user?.id]);
  useEffect(()=>{requestAnimationFrame(()=>{if(location.hash){document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'smooth',block:'start'});}else window.scrollTo(0,0)});},[location.pathname,location.hash]);
  const [error, E] = useState(''),
    [syncError,setSyncError]=useState(''),
    [notice, N] = useState(''),
    [busy, B] = useState(false);
  const [credentials, C] = useState({
      name: '',
      email: '',
      password: ''
    }),
    [reportForm, F] = useState({
      category: 'Bullying',
      description: ''
    }),
    [reports, R] = useState([]),
    [unassigned, Q] = useState([]),
    [users, S] = useState([]),
    [consultants, K] = useState([]),
    [selected, D] = useState(null),
    [messages, M] = useState([]),
    [message, G] = useState(''),
    [note, H] = useState(''),
    [newStaff, J] = useState({
      name: '',
      email: '',
      password: '',
      role: 'reviewer'
    }),
    [chat, A] = useState([]),
    [prompt, P] = useState('');
  function navigate(next,options) {
    setSyncError('');
    if(next==='home')communityRequested.current=false;
    E('');
    N('');
    go(next,options);
  }
  const running = useRef(false);
  const operationVersion=useRef(0);
  async function run(fn, {clear=true} = {}) {
    if (running.current) return;
    running.current = true;
    operationVersion.current++;
    if(clear){E('');N('');}
    B(true);
    try {
      await fn();
    } catch (e) {
      E(e.message);
    } finally {
      running.current = false;
      B(false);
    }
  }
  async function refresh(u = user, t = token) {
    operationVersion.current++;
    if (u.role === 'reporter') {
      R((await call('/reports/mine', 'GET', null, t)).reports);
    } else if (u.role === 'admin') {
      S((await call('/admin/users', 'GET', null, t)).users);
    } else {
      R((await call(u.role==='reviewer'?'/reports/all':'/reports/accepted', 'GET', null, t)).reports);
      if (u.role === 'reviewer') {
        Q((await call('/reports/unassigned', 'GET', null, t)).reports);
        K((await call('/staff/consultants', 'GET', null, t)).consultants);
      }
    }
  }
  useEffect(()=>{
    if(!user||!route.protected)return;
    if(route.view==='detail'){
      if(selected?.id!==route.reportId)run(async()=>{
        const detail=await call('/reports/'+route.reportId,'GET',null,token);
        const conversation=(user.role==='reviewer'&&detail.report.reviewer!==user.id||user.role==='consultant'&&detail.report.consultant!==user.id)?{messages:[]}:await call('/reports/'+route.reportId+'/messages','GET',null,token);
        D(detail.report);M(conversation.messages);G('');H('');
      });
    }else if(['dashboard','reports'].includes(route.view))run(()=>refresh(),{clear:false});
  },[location.pathname,user?.id,token]);
  useAutoRefresh(async isCurrent=>{
    if(running.current)return;
    const version=operationVersion.current;
    const updates={};
    if(route.view==='detail'){
      const detail=await call('/reports/'+route.reportId,'GET',null,token);
      const assigned=user.role==='reporter'||user.role==='reviewer'&&detail.report.reviewer===user.id||user.role==='consultant'&&detail.report.consultant===user.id;
      const conversation=assigned?await call('/reports/'+route.reportId+'/messages','GET',null,token):{messages:[]};
      if(!isCurrent()||running.current||version!==operationVersion.current)return;
      D(detail.report);M(conversation.messages);
    }else{
      if(user.role==='admin')updates.users=(await call('/admin/users','GET',null,token)).users;
      else updates.reports=(await call(user.role==='reporter'?'/reports/mine':user.role==='reviewer'?'/reports/all':'/reports/accepted','GET',null,token)).reports;
      if(user.role==='reviewer'){
        const [queue,staff]=await Promise.all([call('/reports/unassigned','GET',null,token),call('/staff/consultants','GET',null,token)]);
        updates.unassigned=queue.reports;updates.consultants=staff.consultants;
      }
      if(!isCurrent()||running.current||version!==operationVersion.current)return;
      if(updates.users)S(updates.users);if(updates.reports)R(updates.reports);
      if(updates.unassigned)Q(updates.unassigned);if(updates.consultants)K(updates.consultants);
    }
    setSyncError('');
  },{enabled:!!user&&!!token&&!busy&&['dashboard','reports','detail'].includes(route.view),scope:(user?.id||'')+token+location.pathname,onError:()=>setSyncError('Automatic updates are temporarily unavailable. Retrying while this page is open.')});
  async function authenticate(e, register) {
    e.preventDefault();
    await run(async () => {
      const data = await call(register ? '/auth/register' : '/auth/login', 'POST', credentials);
      U(data.user);
      T(data.token);
      C({
        name: '',
        email: '',
        password: ''
      });
      navigate(communityRequested.current?'community':'dashboard');
      communityRequested.current=false;
      await refresh(data.user, data.token);
    });
  }
  async function submit(e) {
    e.preventDefault();
    await run(async () => {
      const result = await call('/reports', 'POST', reportForm, token);
      F({
        category: 'Bullying',
        description: ''
      });
      N('Report submitted: ' + result.report.code);
      await refresh();
      navigate('dashboard');
      N('Your demo report was submitted. Reference: ' + result.report.code);
    });
  }
  async function loadReport(id, hash) {
    const d = await call('/reports/' + id, 'GET', null, token);
    const msgs = (user.role==='reviewer'&&d.report.reviewer!==user.id||user.role==='consultant'&&d.report.consultant!==user.id)?{messages:[]}:await call('/reports/' + id + '/messages', 'GET', null, token);
    D(d.report);
    M(msgs.messages);
    G('');
    H('');
    navigate('detail',{reportId:id,hash});
  }
  async function openReport(id) {
    await run(() => loadReport(id));
  }
  async function openMessages(id) {
    await run(() => loadReport(id,'private-messages'));
  }
  async function sendMessage(e) {
    e.preventDefault();
    await run(async () => {
      await call('/reports/' + selected.id + '/messages', 'POST', {
        text: message
      }, token);
      G('');
      M((await call('/reports/' + selected.id + '/messages', 'GET', null, token)).messages);
    });
  }
  async function updateReport(body) {
    await run(async () => {
      await call('/reports/' + selected.id, 'PATCH', body, token);
      await refresh();
      await loadReport(selected.id);
      N('Update saved');
    });
  }
  async function acceptInvitation(e) {
    e.preventDefault();
    await run(async()=>{await call('/auth/accept-invitation','POST',{invitation,password:credentials.password});C({name:'',email:'',password:''});navigate('login');N('Password set. Log in with your staff email and new password.');});
  }
  async function createStaff(e) {
    e.preventDefault();
    await run(async () => {
      setStaffInvitation(null);
      const result = await call('/admin/staff', 'POST', {name:newStaff.name,email:newStaff.email,role:newStaff.role,password:newStaff.password,...(newStaff.role==='consultant'?{consultantTitle:newStaff.consultantTitle,specialties:newStaff.specialties,organization:newStaff.organization}:{})}, token);
      setStaffInvitation(result);
      J({
        name: '',
        email: '',
        password: '',
        role: 'reviewer'
      });
      await refresh();
      N(result.message);
    });
  }
  async function askAI(e,question) {
    e?.preventDefault();
    const q=(question??prompt).trim();
    if(!q)return;
    P(q);
    await run(async () => {
      const d = await call('/ai/chat', 'POST', {
        message: q
      }, token);
      P('');
      A(old => [...old, {q,reply:d.reply,actions:d.actions||[]}]);
    });
  }
  async function acceptCase() {await run(async()=>{await call('/reports/'+selected.id+'/accept','POST',{},token);await refresh();await loadReport(selected.id);N('Case accepted. You can now assign a consultant.');});}
  async function removeUser(account) {
    if(!window.confirm('Remove '+account.name+'? They will lose access. Case history will be preserved.'))return;
    await run(async()=>{const result=await call('/admin/users/'+account.id,'DELETE',null,token);await refresh();N(result.message);});
  }
  function logout() {setLogoutPending(true);}
  function finishLogout(){
    setSyncError('');
    communityRequested.current=false;
    setLogoutPending(false);
    setStaffInvitation(null);
    U(null);
    T('');
    D(null);
    R([]);
    Q([]);
    S([]);
    K([]);
    M([]);
    G('');
    H('');
    A([]);
    P('');
    F({
      category: 'Bullying',
      description: ''
    });
    C({
      name: '',
      email: '',
      password: ''
    });
    J({
      name: '',
      email: '',
      password: '',
      role: 'reviewer'
    });
    navigate('home');
  }
  const pageProps = {
    view,
    detailSection:location.hash==='#private-messages'?'messages':'details',
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
    openMessages,
    sendMessage,
    updateReport,
    acceptCase,
    removeUser,
    createStaff,
    staffInvitation,
    askAI,
    clearChat:()=>{A([]);P('');E('');N('');},
    logout,
    N
  };
  const Dashboard = {
    reporter: ReporterDashboard,
    reviewer: ReviewerDashboard,
    consultant: ConsultantDashboard,
    admin: AdminDashboard
  }[user?.role];
  return <div className={user ? 'shell authenticated' : 'shell'}>
 <a className="skip-link" href="#main-content">Skip to content</a>
 <Navbar {...pageProps} />
 <ConfirmLogout open={logoutPending} onCancel={()=>setLogoutPending(false)} onConfirm={finishLogout}/>
 <main id="main-content" aria-busy={busy}>
 {user && <div className="workspace-top"><span>YOUR VOICE. YOUR SPACE.</span><div className="account-chip"><span className="avatar">{user.name.charAt(0)}</span><div><strong>{user.name}</strong><small>{user.role==='consultant'?(user.consultantTitle||'General consultant'):user.role}</small></div></div></div>}
 {busy && <div className="loading" role="status">Working…</div>}
 {user&&syncError&&<p className="auto-refresh-notice" role="status">{syncError}</p>}
 <fieldset className="workspace-controls" disabled={busy}>
 {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success" role="status">{notice}</div>}
 {view === 'home' && <Home {...pageProps} />}
 {view === 'register' && <Register {...pageProps} />}
 {view === 'login' && <>{communityRequested.current&&<p className="community-login-note" role="status">Sign in to explore approved Community Posts. After login, you will return to the posts.</p>}<Login {...pageProps} /></>}
 {view === 'invite' && invitation && <AuthForm key="invite" {...pageProps} mode="invite" onAccept={acceptInvitation}/>}
 {view === 'dashboard' && Dashboard && <Dashboard {...pageProps} />}
 {view === 'reports' && user && user.role !== 'admin' && <MyReports {...pageProps} />}
 {view === 'new-report' && user?.role === 'reporter' && <SubmitReport {...pageProps} />}
 {view === 'detail' && user && selected?.id===route.reportId && <ReportDetails {...pageProps} />}
 {view === 'ai' && user?.role === 'reporter' && <AIConsultant {...pageProps} />}
 {view === 'community' && user && <Community key={user.id} user={user} token={token} />}
 {view === 'not-found' && <section className="page"><h1>Page not found</h1><p>This address does not match a HER VOICE page.</p><button onClick={()=>navigate(user?'dashboard':'home')}>Go back home</button></section>}
 {view === 'invite' && !invitation && <section className="page"><p>Open the complete invitation link provided by your administrator.</p></section>}
 </fieldset>
 <footer>HER VOICE · Classroom demonstration · Fictional information only</footer>
 </main></div>;
}
