import {Router} from 'express';
import {Report} from '../models/Report.js';
import {auth} from '../middleware/authMiddleware.js';
import {wrap} from '../utils/helpers.js';
const router=Router();
router.post('/api/ai/chat',auth('reporter'),wrap(async(req,res)=>{
 const message=req.body?.message;
 if(typeof message!=='string'||message.trim().length<1||message.length>500)return res.status(400).json({error:'Enter a question of 1–500 characters'});
 const q=message.trim().toLowerCase();
 let reply,actions=[];
 if(/urgent|danger|emergency|unsafe|hurt myself|suicid|kill myself/.test(q))reply='This classroom assistant cannot handle emergencies or assess immediate safety. If someone is in immediate danger, contact local emergency support or a trusted person nearby. For personal guidance, contact a qualified support professional. Please keep real sensitive details out of this demo.';
 else if(/status|track|progress|my cases|my reports|update/.test(q)){
  const reports=await Report.find({owner:req.user._id}).select('code status category accepted').sort({createdAt:-1}).limit(5);
  reply=reports.length?'Here are your latest reports:\n'+reports.map(r=>`${r.code} — ${r.category}: ${r.status}${r.accepted?' (accepted by a reviewer)':''}`).join('\n')+'\nOpen a report for its case conversation and latest status.':'You have no reports yet. Choose Submit Report to create a fictional case.';
  actions=reports.length?reports.map(r=>({label:'Open '+r.code,view:'detail',reportId:r.id})):[{label:'Submit Report',view:'new-report'}];
 }else if(/message|contact|reviewer|consultant|support team/.test(q)){reply='Open My Reports and select a case. Once a reviewer is assigned, use Private Messages to read and send replies. A reviewer can accept the case and assign a human consultant. The offline assistant is separate from your human case team.';actions=[{label:'My Reports',view:'reports'}]}
 else if(/privacy|private|anonymous|confidential|profile code/.test(q))reply='This prototype requires an account; it is not anonymous reporting. Reporters see their own cases. Reviewers can review all submitted reports, while private conversations are limited to the reporter and assigned staff. Consultants see only accepted cases assigned to them. Your profile code is an identifier, not a password. Use fictional information only.';
 else if(/bully|harass|discriminat|unfair|report|submit/.test(q)){reply='To submit a fictional concern:\n1. Choose Submit Report.\n2. Select Bullying, Harassment, Discrimination, Unfair Treatment, or Other.\n3. Describe the made-up scenario in 20–2,000 characters.\n4. Submit and keep the reference code.\nTrack your case in My Reports. Avoid real names, contact details, or sensitive personal information in this classroom demo.';actions=[{label:'Submit Report',view:'new-report'}]}
 else if(/hello|hi\b|hey|thank/.test(q))reply='Hello! I can help you submit a fictional report, check your own case status, explain privacy, or find the private messaging screen. What would you like to do?';
 else reply='I can help with reporting, your case status, privacy, and contacting your assigned team. Try “What is my report status?” or “How do I submit a report?” This offline assistant cannot provide professional counseling or answer general questions reliably.';
 res.json({reply,actions,mode:'offline-assistant'});
}));
export default router;
