import React from 'react';
import { House, PlusSquare, MessageSquare, Bot, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';
export default function Navbar({
  user,
  view,
  busy,
  navigate,
  logout,
  run,
  refresh
}) {
  if (!user) {
    const home = () => {navigate('home'); requestAnimationFrame(() => window.scrollTo({top:0,behavior:'smooth'}));};
    const section = id => navigate('home',{hash:id});
    return <header className="landing-navbar"><button className="logo-button" disabled={busy} onClick={home}><img src="/her-voice-logo-transparent.png" alt="HER VOICE hijabi woman logo"/><strong>HER <span>VOICE</span></strong></button><nav aria-label="Main navigation"><button disabled={busy} className={view==='home'?'active-home':''} onClick={home}>Home</button><button disabled={busy} onClick={()=>navigate('community')}>Community Posts</button><button disabled={busy} onClick={()=>section('about')}>About</button><button disabled={busy} onClick={()=>section('how-it-works')}>How It Works</button><button disabled={busy} onClick={()=>section('resources')}>Resources</button><button disabled={busy} onClick={()=>section('support')}>Support</button><button disabled={busy} onClick={()=>section('support')}>Contact</button></nav><div className="landing-nav-actions"><button disabled={busy} onClick={()=>navigate('login')}>Login</button><button disabled={busy} className="purple" onClick={()=>navigate('register')}>Get Started</button></div></header>;
  }
  const links = user ? [[House, 'home', 'Home'], [LayoutDashboard, 'dashboard', 'Dashboard'], [MessageSquare, 'community', 'Community Posts'], [ClipboardList, 'reports', user.role === 'reporter' ? 'My Reports' : user.role==='reviewer'?'All Reported Cases':'Assigned Cases'], ...(user.role === 'reporter' ? [[PlusSquare, 'new-report', 'Submit Report'], [Bot, 'ai', 'AI Consultant']] : [])] : [[House, 'home', 'Home'], [PlusSquare, 'register', 'Register'], [LayoutDashboard, 'login', 'Log in']];
  return <header className={user ? 'sidebar' : 'topbar'}><button disabled={busy} className="logo-button" onClick={() => navigate(user ? 'dashboard' : 'home')}><img src="/her-voice-logo-transparent.png" alt="HER VOICE hijabi woman logo" /><strong>HER VOICE</strong></button><p className="brand-tagline">Listen · Support · Empower</p><nav aria-label="Main navigation">{links.filter(([, key]) => !(user?.role === 'admin' && key === 'reports')).map(([Icon, key, label]) => <button disabled={busy} key={key} className={view === key ? 'nav-active' : ''} aria-current={view === key ? 'page' : undefined} onClick={() => user && ['dashboard', 'reports'].includes(key) ? run(async () => {
        await refresh();
        navigate(key);
      }) : navigate(key)}><Icon size={20} />{label}</button>)}{user && <><button disabled={busy} className="logout" onClick={logout}><LogOut size={20} />Logout</button></>}</nav>{user && <div className="sidebar-bottom"><span className="decorative-leaf" aria-hidden="true">❧</span><p>You are heard.<br />You matter.<br /><em>Stronger together.</em></p><small>Fictional demo information only.</small></div>}</header>;
}
