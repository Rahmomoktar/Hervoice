import React from 'react';
import {ArrowRight,Heart,ShieldCheck,Users,FileText,MessageCircle,Search,Headphones,ArrowUpRight} from 'lucide-react';

const features = [
  {Icon:FileText,title:'Submit a Report',text:'Share a fictional concern through your personal reporting space.',action:'Get started',target:'report',tone:'purple'},
  {Icon:MessageCircle,title:'Get Guidance',text:'Find clear information about reporting and what happens next.',action:'Explore resources',target:'resources',tone:'teal'},
  {Icon:Users,title:'Connect with Your Team',text:'Message the reviewer and consultant assigned to your case.',action:'How support works',target:'support',tone:'pink'},
  {Icon:ShieldCheck,title:'Stay Informed',text:'Follow your report and see updates from your case team.',action:'Learn more',target:'how-it-works',tone:'violet'}
];
const steps = [
  {Icon:FileText,title:'Submit',text:'Create an account and submit a fictional report.'},
  {Icon:Search,title:'Review',text:'A reviewer claims your report and reviews its details.'},
  {Icon:MessageCircle,title:'Get Support',text:'Exchange private messages with your assigned team.'},
  {Icon:Heart,title:'Move Forward',text:'Follow status updates and keep the conversation going.'}
];
export default function Home({user,navigate,busy}) {
  const start=()=>navigate(user?(user.role==='reporter'?'new-report':'dashboard'):'register');
  const jump=id=>navigate('home',{hash:id});
  return <div className="landing">
    <section className="landing-hero" aria-labelledby="hero-title">
      <img className="landing-art" src="/home-hero.png" alt="A woman in a lavender hijab looking toward a hopeful horizon" fetchPriority="high"/>
      <div className="landing-hero-inner">
        <div className="landing-copy">
          <span className="community-badge"><Heart size={17} fill="currentColor"/>A kinder community for every girl</span>
          <h1 id="hero-title">Speak Safely.<br/>Be Heard.<br/><span>Create Change.</span></h1>
          <p className="hero-description">A space to speak up, understand the reporting process, and connect with your case team. Your voice matters, and you are not alone.</p>
          <div className="landing-actions"><button className="purple" disabled={busy} onClick={start}>Submit a Report <ArrowRight size={18}/></button><button disabled={busy} onClick={()=>jump('about')}>Learn More</button></div>
          <div className="trust-row"><div><ShieldCheck/><span><strong>Personal space</strong><small>Access through your account</small></span></div><div><Users/><span><strong>Case team</strong><small>Assigned reviewers and consultants</small></span></div><div><Heart/><span><strong>Stronger tomorrow</strong><small>Every voice matters</small></span></div></div>
          <p className="landing-demo-note">Classroom prototype · Fictional information only · Not an emergency service</p>
        </div>
        <div className="hero-handwriting" aria-hidden="true">A Stronger<br/><span>Tomorrow</span><Heart size={18} fill="currentColor"/></div>
        <aside className="hero-values" aria-label="What you can do"><div><span className="value-icon purple-tone"><Users/></span><p><strong>Be heard</strong><small>A place for your voice</small></p></div><div><span className="value-icon pink-tone"><FileText/></span><p><strong>Speak up</strong><small>Submit a fictional report</small></p></div><div><span className="value-icon violet-tone"><Headphones/></span><p><strong>Stay connected</strong><small>Message your case team</small></p></div><div><span className="value-icon pink-tone"><Heart fill="currentColor"/></span><p><strong>Move forward</strong><small>Follow your report's progress</small></p></div></aside>
      </div>
    </section>
    <section className="landing-features" aria-label="Explore HER VOICE">{features.map(({Icon,title,text,action,target,tone})=><article key={title}><span className={'feature-icon '+tone}><Icon size={29}/></span><div><h2>{title}</h2><p>{text}</p><button disabled={busy} onClick={()=>target==='report'?start():jump(target)}>{action}<ArrowRight size={15}/></button></div></article>)}</section>
    <section className="landing-community" id="community-posts"><div><span className="landing-kicker">LISTEN. LEARN. SUPPORT.</span><h2>Stories shared with care.</h2><p>Explore community posts prepared from reviewed cases, with identifying details removed and consent to share. Read lessons learned and offer constructive comments after signing in.</p><small>Only approved summaries appear here. Private reports stay private.</small></div><button className="purple" disabled={busy} onClick={()=>navigate('community')}>Explore Community Posts <ArrowUpRight size={19}/></button></section>
    <section className="landing-process" id="how-it-works"><div className="process-content"><span className="landing-kicker">YOUR NEXT STEP STARTS HERE</span><h2>How HER VOICE Works</h2><p>Simple steps to understand the process.</p><div className="process-steps">{steps.map(({Icon,title,text},i)=><article key={title}><div className="step-top"><span className="step-number">{i+1}</span><span className={'step-icon step-'+i}><Icon size={30}/></span>{i<3&&<ArrowRight className="step-arrow" size={25}/>}</div><h3>{title}</h3><p>{text}</p></article>)}</div></div><blockquote><span aria-hidden="true">“</span><p>Every girl's voice can help create a kinder, stronger tomorrow.</p><div className="quote-line"/><small>Listen. Support. Empower.</small></blockquote></section>
    <section className="landing-information" id="about"><div><span className="landing-kicker">ABOUT HER VOICE</span><h2>Your voice is the beginning.</h2><p>HER VOICE is an educational prototype exploring how women and girls can submit concerns, follow updates, and communicate with an assigned case team.</p></div><div className="information-note"><ShieldCheck size={26}/><p>This classroom version is for fictional scenarios. It needs professional safeguarding and security review before use with real reports.</p></div></section>
    <section className="landing-resources" id="resources"><div><span className="landing-kicker">RESOURCES</span><h2>A little clarity for your next step.</h2></div><div className="resource-grid"><article><FileText/><h3>Before you submit</h3><p>Choose a category and describe a made-up scenario in 20–2,000 characters. Keep real names and personal information out of this demo.</p></article><article><Search/><h3>Understand your status</h3><p>Open My Reports to follow a case from Submitted through review and progress to Closed.</p></article><article><MessageCircle/><h3>Keep the conversation going</h3><p>Once a reviewer claims your case, open the report to read and send private messages.</p></article></div></section>
    <section className="landing-support" id="support"><div><span className="landing-kicker">SUPPORT & CONTACT</span><h2>You don't have to navigate it alone.</h2><p>In this demo, contact your assigned team through Private Messages inside a report. For personal support, speak with a trusted adult or qualified support professional. This platform is not monitored for emergencies.</p></div><button className="purple" disabled={busy} onClick={()=>navigate(user?'dashboard':'login')}>{user?'Open your dashboard':'Log in to your account'}<ArrowUpRight size={19}/></button></section>
  </div>;
}