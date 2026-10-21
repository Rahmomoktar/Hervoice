import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { call } from './lib/api.js';
import {useNavigation} from './lib/navigation.js';
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
  const view=route.protected&&!user?'login':route.view;
  useEffect(()=>{if(invitation)go('invite',{replace:true});},[invitation]);
  useEffect(()=>{if(route.protected&&!user)go('login',{replace:true});},[location.pathname,user?.id]);
  useEffect(()=>{requestAnimationFrame(()=>{if(location.hash){document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'smooth',block:'start'});}else window.scrollTo(0,0)});},[location.pathname,location.hash]);
  const [error, E] = useState(''),
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
    E('');
    N('');
    go(next,options);
  }
  const running = useRef(false);
  async function run(fn, {clear=true} = {}) {
    if (running.current) return;
    running.current = true;
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
      navigate('dashboard');
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
  async function loadReport(id) {
    const d = await call('/reports/' + id, 'GET', null, token);
    const msgs = (user.role==='reviewer'&&d.report.reviewer!==user.id||user.role==='consultant'&&d.report.consultant!==user.id)?{messages:[]}:await call('/reports/' + id + '/messages', 'GET', null, token);
    D(d.report);
    M(msgs.messages);
    G('');
    H('');
    navigate('detail',{reportId:id});
  }
  async function openReport(id) {
    await run(() => loadReport(id));
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
      const result = await call('/admin/staff', 'POST', {name:newStaff.name,email:newStaff.email,role:newStaff.role,password:newStaff.password}, token);
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
    removeUser,
    createStaff,
    staffInvitation,
    askAI,
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
 {user && <div className="workspace-top"><span>YOUR VOICE. YOUR SPACE.</span><div className="account-chip"><span className="avatar">{user.name.charAt(0)}</span><div><strong>{user.name}</strong><small>{user.role}</small></div></div></div>}
 {busy && <div className="loading" role="status">Working…</div>}
 <fieldset className="workspace-controls" disabled={busy}>
 {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success" role="status">{notice}</div>}
 {view === 'home' && <Home {...pageProps} />}
 {view === 'register' && <Register {...pageProps} />}
 {view === 'login' && <Login {...pageProps} />}
 {view === 'invite' && invitation && <AuthForm key="invite" {...pageProps} mode="invite" onAccept={acceptInvitation}/>}
 {view === 'dashboard' && Dashboard && <Dashboard {...pageProps} />}
 {view === 'reports' && user && user.role !== 'admin' && <MyReports {...pageProps} />}
 {view === 'new-report' && user?.role === 'reporter' && <SubmitReport {...pageProps} />}
 {view === 'detail' && user && selected?.id===route.reportId && <ReportDetails {...pageProps} />}
 {view === 'ai' && user?.role === 'reporter' && <AIConsultant {...pageProps} />}
 {view === 'not-found' && <section className="page"><h1>Page not found</h1><p>This address does not match a HER VOICE page.</p><button onClick={()=>navigate(user?'dashboard':'home')}>Go back home</button></section>}
 {view === 'invite' && !invitation && <section className="page"><p>Open the complete invitation link provided by your administrator.</p></section>}
 </fieldset>
 <footer>HER VOICE · Classroom demonstration · Fictional information only</footer>
 </main></div>;
}
