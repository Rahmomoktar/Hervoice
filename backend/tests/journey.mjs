import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {User,Report} from '../src/models.js';
const suffix=Date.now(), password=randomBytes(4).toString('hex');
const uri=`mongodb://127.0.0.1:27017/her_voice_test_${suffix}`;
const env={...process.env,INVITATION_DELIVERY:'local',PORT:'5099',MONGO_URI:uri,JWT_SECRET:randomBytes(48).toString('hex')};
let child;
async function start(){child=spawn(process.execPath,['src/server.js'],{env,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);for(let i=0;i<100;i++){if(output.includes('API listening'))return;if(child.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,100))}throw Error('Server startup timeout: '+output)}
async function stop(){if(child&&child.exitCode===null){const done=once(child,'exit');child.kill();await done}}
let checks=0;
async function api(path,method='GET',body,token,status=200){const r=await fetch('http://127.0.0.1:5099/api'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();assert.equal(r.status,status,`${method} ${path}: ${JSON.stringify(data)}`);checks++;return data}
try{
 await mongoose.connect(uri,{serverSelectionTimeoutMS:5000});await Promise.all([User.init(),Report.init()]);
 const admin=await User.create({name:'Fictional Admin',email:'admin@example.test',role:'admin',passwordHash:await bcrypt.hash(password,12)});
 await start();await api('/health');
 const login=async email=>(await api('/auth/login','POST',{email,password})).token;
 const at=await login(admin.email);
 for(const role of ['reviewer','consultant']){
 const invited=await api('/admin/staff','POST',{name:'Fictional '+role,email:role+'@example.test',role},at,201);
 assert.equal(invited.delivery,'local');const invitation=new URL(invited.invitationUrl).hash.slice(8);
 assert.equal((await User.findOne({email:role+'@example.test'})).active,false);
 await api('/auth/login','POST',{email:role+'@example.test',password},undefined,401);
 await api('/auth/accept-invitation','POST',{invitation,password:'1234567'},undefined,400);
 await api('/auth/accept-invitation','POST',{invitation,password},undefined,200);
 await api('/auth/accept-invitation','POST',{invitation,password},undefined,400);
 }
 await api('/admin/staff','POST',{name:'Fictional Admin',email:'bad@example.test',role:'admin'},at,400);
 const eight=await api('/auth/register','POST',{name:'Fictional Eight',email:'eight@example.test',password:'Demo1234'},undefined,201);assert.equal(eight.user.role,'reporter');assert.ok(eight.user.profileCode);
 await api('/auth/register','POST',{name:'Fictional Seven',email:'seven@example.test',password:'Demo123'},undefined,400);
 console.log('PASS 8+ character passwords, admin-only staff invitations, activation, reuse denial and admin role rejection');
 const registered=await api('/auth/register','POST',{name:'Fictional Reporter',email:'reporter@example.test',password,role:'admin'},undefined,201);assert.equal(registered.user.role,'reporter');
 const rt=await login('reporter@example.test'),vt=await login('reviewer@example.test'),ct=await login('consultant@example.test');
 const outsider=await api('/auth/register','POST',{name:'Fictional Other',email:'other@example.test',password},undefined,201);
 const {report}=await api('/reports','POST',{category:'Bullying',description:'Fictional classroom example for automated testing only.'},rt,201);
 assert.ok(await Report.exists({_id:report.id}));console.log('PASS register, login, submit, MongoDB save');
 await api('/reports/'+report.id,'GET',undefined,undefined,401);
 for(const t of [outsider.token,ct,at]){await api('/reports/'+report.id,'GET',undefined,t,403);await api('/reports/'+report.id+'/messages','GET',undefined,t,403)}
 await api('/reports/'+report.id,'GET',undefined,vt);
 await api('/reports/'+report.id+'/messages','GET',undefined,vt,403);
 assert.ok((await api('/reports/all','GET',undefined,vt)).reports.some(r=>r.id===report.id));
 await api('/reports/all','GET',undefined,rt,403);
 await api('/admin/users','GET',undefined,rt,403);await api('/reports/'+report.id,'PATCH',{status:'Closed'},rt,403);
 await api('/reports/unassigned','GET',undefined,vt);await api('/reports/'+report.id+'/claim','POST',{},vt);await api('/reports/'+report.id,'GET',undefined,vt);
 await api('/reports/'+report.id+'/messages','POST',{text:'Fictional reviewer clarification'},vt,201);
 assert.equal((await api('/reports/'+report.id+'/messages','GET',undefined,rt)).messages.length,1);
 await api('/reports/'+report.id+'/messages','POST',{text:'Fictional reporter reply'},rt,201);
 const consultant=(await api('/staff/consultants','GET',undefined,vt)).consultants[0];
 await api('/reports/'+report.id,'PATCH',{consultant:consultant.id},vt,400);
 assert.equal((await api('/reports/assigned','GET',undefined,ct)).reports.length,0);
 assert.equal((await api('/reports/accepted','GET',undefined,ct)).reports.length,0);
 await api('/reports/'+report.id+'/accept','POST',{},rt,403);
 await api('/reports/'+report.id+'/accept','POST',{},vt);
 await api('/reports/'+report.id+'/accept','POST',{},vt,409);
 const acceptedQueue=await api('/reports/accepted','GET',undefined,ct);assert.equal(acceptedQueue.reports[0].description,report.description);
 await api('/reports/'+report.id,'GET',undefined,ct);
 await api('/reports/'+report.id+'/messages','GET',undefined,ct,403);
 await api('/reports/'+report.id,'PATCH',{status:'Closed'},ct,403);
 await api('/reports/accepted','GET',undefined,rt,403);
 await api('/reports/'+report.id,'PATCH',{consultant:consultant.id},vt);
 assert.equal((await api('/reports/assigned','GET',undefined,ct)).reports.length,1);
 await api('/reports/'+report.id,'PATCH',{note:'Fictional internal note'},ct);
 await api('/reports/'+report.id,'PATCH',{status:'In Progress'},ct);
 for(const path of ['/reports/mine','/reports/'+report.id]){const data=await api(path,'GET',undefined,rt);assert.ok(!JSON.stringify(data).includes('Fictional internal note'));assert.ok(!JSON.stringify(data).includes('"notes"'))}
 assert.equal((await api('/reports/'+report.id,'GET',undefined,rt)).report.status,'In Progress');
 console.log('PASS reviewer claim, private messaging/reply, assignment, consultant notes/status, reporter privacy, cross-role access');
 await api('/reports','POST',{category:'Other',description:'short'},rt,400);await api('/reports/'+report.id,'PATCH',{owner:outsider.user.id},vt,400);
 await api('/auth/register','POST',{name:'Fictional Long',email:'long@example.test',password:'x'.repeat(73)},undefined,400);
 const malformed=await fetch('http://127.0.0.1:5099/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(malformed.status,400);
 await api('/missing','GET',undefined,rt,404);await api('/auth/me','GET',undefined,'invalid-token',401);
 const cors=await fetch('http://127.0.0.1:5099/api/health',{headers:{Origin:'http://localhost:5173'}});assert.equal(cors.headers.get('access-control-allow-origin'),'http://localhost:5173');
 await stop();await start();assert.equal((await api('/reports/'+report.id,'GET',undefined,rt)).report.status,'In Progress');assert.equal((await api('/reports/'+report.id+'/messages','GET',undefined,rt)).messages.length,2);
 console.log('PASS backend restart persistence');
 await api('/auth/register','POST',{name:'Fictional Nine',email:'nine@example.test',password:'Demo12345'},undefined,201);
 for(const role of ['reviewer','consultant']){
  await api('/admin/staff','POST',{name:'Fictional Direct',email:'direct-'+role+'@example.test',role,password:'1234567'},at,400);
  await api('/admin/staff','POST',{name:'Fictional Direct',email:'direct-'+role+'@example.test',role,password:'x'.repeat(73)},at,400);
  await api('/admin/staff','POST',{name:'Fictional Direct',email:'direct-'+role+'@example.test',role,password},at,201);
  const direct=await api('/auth/login','POST',{email:'direct-'+role+'@example.test',password});assert.equal(direct.user.role,role);
 }
 console.log('PASS direct staff creation/login, short and oversized password rejection');
 await api('/admin/staff','POST',{name:'Fictional Intruder',email:'no@example.test',role:'reviewer'},rt,403);
 const pending=await api('/admin/staff','POST',{name:'Fictional Expired',email:'expired@example.test',role:'reviewer'},at,201);
 const expiredToken=new URL(pending.invitationUrl).hash.slice(8);
 const pendingUser=await User.findOne({email:'expired@example.test'}).select('+invitationHash');
 assert.notEqual(pendingUser.invitationHash,expiredToken);assert.equal(pendingUser.invitationHash.length,64);
 await User.updateOne({_id:pendingUser.id},{$set:{invitationExpires:new Date(Date.now()-1000)}});
 await api('/auth/accept-invitation','POST',{invitation:expiredToken,password},undefined,400);
 const reissued=await api('/admin/staff','POST',{name:'Fictional Expired',email:'expired@example.test',role:'reviewer'},at,201);
 const freshToken=new URL(reissued.invitationUrl).hash.slice(8);assert.notEqual(freshToken,expiredToken);
 await api('/auth/accept-invitation','POST',{invitation:expiredToken,password},undefined,400);
 await api('/auth/accept-invitation','POST',{invitation:freshToken,password},undefined,200);
 const listing=await api('/admin/users','GET',undefined,at);assert.ok(!JSON.stringify(listing).includes('invitationHash'));assert.ok(!JSON.stringify(listing).includes('passwordHash'));
 console.log('PASS expired invitation rejection, reissue, hashed tokens, staff authorization and credential privacy');
 const ownStatus=await api('/ai/chat','POST',{message:'What is my report status?'},rt);assert.ok(ownStatus.reply.includes(report.code));assert.ok(ownStatus.actions.some(a=>a.reportId===report.id));
 const privateStatus=await api('/ai/chat','POST',{message:'What is my report status?'},outsider.token);assert.ok(!privateStatus.reply.includes(report.code));
 await api('/ai/chat','POST',{message:'status'},at,403);
 const urgent=await api('/ai/chat','POST',{message:'I need to report an emergency'},rt);assert.ok(urgent.reply.includes('emergencies'));
 await api('/ai/chat','POST',{message:'   '},rt,400);
 const otherReviewer=await User.create({name:'Fictional Second Reviewer',email:'second@example.test',role:'reviewer',passwordHash:await bcrypt.hash(password,12)});
 const otherToken=await login(otherReviewer.email);
 assert.ok((await api('/reports/all','GET',undefined,otherToken)).reports.some(r=>r.id===report.id));
 await api('/reports/'+report.id,'GET',undefined,otherToken);
 await api('/reports/'+report.id+'/messages','GET',undefined,otherToken,403);
 await api('/reports/'+report.id,'PATCH',{status:'Closed'},otherToken,403);
 await api('/reports/'+report.id+'/accept','POST',{},otherToken,409);
 await api('/admin/users/'+registered.user.id,'DELETE',undefined,rt,403);
 await api('/admin/users/'+admin.id,'DELETE',undefined,at,400);
 await api('/admin/users/'+registered.user.id,'DELETE',undefined,at);
 assert.ok(await Report.exists({_id:report.id}));
 await api('/auth/me','GET',undefined,rt,401);
 await api('/auth/login','POST',{email:'reporter@example.test',password},undefined,401);
 assert.ok(!(await api('/admin/users','GET',undefined,at)).users.some(u=>u.id===registered.user.id));
 const reviewerId=(await User.findOne({email:'reviewer@example.test'})).id;
 await api('/admin/users/'+reviewerId,'DELETE',undefined,at);
 const unclaimed=await Report.findById(report.id);assert.equal(unclaimed.reviewer,null);assert.equal(unclaimed.consultant,null);assert.equal(unclaimed.accepted,false);
 await api('/auth/me','GET',undefined,vt,401);
 console.log('PASS reviewer global read, consultant acceptance gate, assistant status privacy, admin removal, token revocation and case retention');


 // Regression: the previous shared 100-request budget blocked ordinary dashboard use and login.
 for(let i=0;i<105;i++){
  const response=await fetch('http://127.0.0.1:5099/api/reports/mine',{headers:{Authorization:'Bearer '+outsider.token}});
  assert.equal(response.status,200,'Normal workspace requests must exceed the old 100-request ceiling');
 }
 for(let i=0;i<22;i++)await login(admin.email);
 console.log('PASS 105 workspace reads and 22 successful logins without rate-limit lockout');
 for(let i=0;i<25;i++){const res=await fetch('http://127.0.0.1:5099/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(res.status===429){assert.ok(Number(res.headers.get('Retry-After'))>0);assert.ok((await res.json()).error);console.log('PASS authentication rate limiting');break}if(i===24)throw Error('Rate limit missing')}
 console.log(`PASS ${checks} API assertions plus database, privacy, CORS, malformed JSON and persistence assertions. Fictional test database retained: her_voice_test_${suffix}`);
}finally{await stop();await mongoose.disconnect()}
