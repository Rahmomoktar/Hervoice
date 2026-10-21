import {Router} from 'express';
import {CommunityPublication as Publication,CommunityComment as Comment} from '../models/Community.js';
import {Report} from '../models/Report.js';
import {User} from '../models/User.js';
import {auth} from '../middleware/authMiddleware.js';
import {wrap,validId} from '../utils/helpers.js';
const router=Router();
const fields=['summary','situation','lessons','recommendations'];
// Defense in depth only: indirect identification always requires human review.
const unsafe=/@|https?:|www\.|\b(?:\d[\s()+.-]*){7,}\b|\b[a-f\d]{24}\b|HV-[UR]-|\b(?:kill yourself|your fault|deserved it|idiot|bitch|fuck|stupid victim)\b/i;
const clean=(v,min=10,max=1200)=>typeof v==='string'&&v.trim().length>=min&&v.length<=max&&!unsafe.test(v);
const publicPublication=p=>({id:p.id,category:p.category,...Object.fromEntries(fields.map(k=>[k,p[k]]))});
const publicComment=c=>({id:c.id,alias:c.alias,text:c.text});
const moderator=u=>u.role==='admin'||u.role==='reviewer'&&u.communityModerator===true;
async function publication(id){return validId(id)?Publication.findById(id):null;}
async function published(id){return validId(id)?Publication.findOne({_id:id,published:true,$expr:{$and:[{$eq:['$revision','$consentRevision']},{$eq:['$revision','$privacyRevision']}]}}):null;}
router.get('/api/community',auth(),wrap(async(req,res)=>{
 const all=await Publication.find({published:true,$expr:{$and:[{$eq:['$revision','$consentRevision']},{$eq:['$revision','$privacyRevision']}]}}).sort({_id:-1});
 const q=String(req.query.q||'').toLowerCase().slice(0,100),category=String(req.query.category||'');
 res.json({publications:all.filter(p=>(!category||p.category===category)&&(!q||fields.some(k=>p[k].toLowerCase().includes(q)))).map(publicPublication)});
}));
router.get('/api/community/:id/comments',auth(),wrap(async(req,res)=>{
 const p=await published(req.params.id);
 if(!p)return res.status(404).json({error:'Community report not found'});
 res.json({comments:(await Comment.find({publication:req.params.id,revision:p.revision,state:'approved'}).sort({_id:1}).limit(200)).map(publicComment)});
}));
router.post('/api/community/:id/comments',auth('reporter'),wrap(async(req,res)=>{
 const p=await published(req.params.id);
 if(!p)return res.status(404).json({error:'Community report not found'});
 const {text,alias}=req.body||{};
 if(!clean(text,3,1000)||alias!==undefined&&alias!==''&&(!clean(alias,2,30)||! /^[a-zA-Z][a-zA-Z -]*$/.test(alias)))return res.status(400).json({error:'Use constructive advice and an optional invented alias. Remove contact details, links, identifiers and abusive language.'});
 if(await Comment.countDocuments({author:req.user._id,createdAt:{$gt:new Date(Date.now()-3600000)}})>=10)return res.status(429).json({error:'Please wait before submitting more advice.'});
 await Comment.create({publication:req.params.id,revision:p.revision,author:req.user._id,text:text.trim(),alias:alias?.trim()||'Anonymous'});
 res.status(201).json({state:'pending',message:'Advice submitted for moderation. It is not public yet.'});
}));
router.get('/api/community-comments/mine',auth('reporter'),wrap(async(req,res)=>res.json({comments:(await Comment.find({author:req.user._id}).sort({_id:-1}).limit(100)).map(c=>({...publicComment(c),state:c.state}))})));
router.post('/api/community-comments/:id/flag',auth(),wrap(async(req,res)=>{
 const c=validId(req.params.id)?await Comment.findOne({_id:req.params.id,state:'approved'}):null;
 if(!c||!await published(c.publication))return res.status(404).json({error:'Comment not found'});
 if(!clean(req.body?.reason,3,300))return res.status(400).json({error:'Give a brief reason without personal information'});
 // A reported comment is hidden immediately and requires a new moderation decision.
 c.flags.push({by:req.user._id,reason:req.body.reason.trim()});c.state='pending';await c.save();res.json({message:'Comment hidden pending moderation'});
}));
router.get('/api/community-moderation',auth('admin','reviewer'),wrap(async(req,res)=>{
 if(!moderator(req.user))return res.status(403).json({error:'Community moderation permission required'});
 const comments=await Comment.find({state:{$ne:'removed'}}).sort({_id:-1}).limit(200);
 res.json({comments:comments.map(c=>({...publicComment(c),state:c.state,flags:c.flags.map(f=>({reason:f.reason}))}))});
}));
router.patch('/api/community-comments/:id/moderate',auth('admin','reviewer'),wrap(async(req,res)=>{
 if(!moderator(req.user))return res.status(403).json({error:'Community moderation permission required'});
 if(!['approved','removed'].includes(req.body?.state))return res.status(400).json({error:'Choose approve or remove'});
 const c=validId(req.params.id)?await Comment.findById(req.params.id):null;
 if(!c)return res.status(404).json({error:'Comment not found'});
 const p=await published(c.publication);
 if(req.body.state==='approved'&&(!p||p.revision!==c.revision||!clean(c.text,3,1000)||!clean(c.alias,2,30)||req.body.privacyChecked!==true||req.body.conductChecked!==true))return res.status(400).json({error:'Review privacy and constructive conduct for the current published version before approval'});
 c.state=req.body.state;c.moderatedBy=req.user._id;await c.save();res.json({state:c.state});
}));
router.get('/api/community-moderators',auth('admin'),wrap(async(req,res)=>res.json({users:(await User.find({role:'reviewer',active:{$ne:false}})).map(u=>({id:u.id,name:u.name,communityModerator:u.communityModerator===true}))})));
router.patch('/api/community-moderators/:id',auth('admin'),wrap(async(req,res)=>{
 if(typeof req.body?.enabled!=='boolean'||!validId(req.params.id))return res.status(400).json({error:'Invalid permission change'});
 const u=await User.findOneAndUpdate({_id:req.params.id,role:'reviewer',active:{$ne:false}},{$set:{communityModerator:req.body.enabled}},{new:true});
 if(!u)return res.status(404).json({error:'Reviewer not found'});res.json({enabled:u.communityModerator});
}));
// Private workflow uses private report IDs; no public response contains these IDs.
router.get('/api/reports/:id/community-draft',auth('reporter','reviewer'),wrap(async(req,res)=>{
 const r=validId(req.params.id)?await Report.findById(req.params.id):null;
 if(!r||String(req.user.role==='reporter'?r.owner:r.reviewer)!==req.user.id)return res.status(404).json({error:'Draft not found'});
 const p=await Publication.findOne({report:r._id});
 res.json({draft:p?{...publicPublication(p),revision:p.revision,consented:p.consentRevision===p.revision,published:p.published}:null});
}));
router.put('/api/reports/:id/community-draft',auth('reviewer'),wrap(async(req,res)=>{
 const r=validId(req.params.id)?await Report.findById(req.params.id):null;
 if(!r||String(r.reviewer)!==req.user.id||!r.accepted)return res.status(403).json({error:'Only the assigned reviewer of an accepted case may prepare a summary'});
 if(!fields.every(k=>clean(req.body?.[k])))return res.status(400).json({error:'Each field needs 10–1200 characters without contact details, links or identifiers. Manually generalize names, locations and identifying circumstances.'});
 const values=Object.fromEntries(fields.map(k=>[k,req.body[k].trim()]));
 // Atomic revision bump invalidates consent and publication even during concurrent edits.
 const p=await Publication.findOneAndUpdate({report:r._id},{$set:{...values,category:r.category,published:false},$inc:{revision:1},$unset:{consentRevision:1,consentAt:1,privacyRevision:1,privacyAt:1,approvedBy:1}},{new:true});
 if(!p)await Publication.create({report:r._id,...values,category:r.category});
 res.json({message:'Draft saved privately. Reporter consent and a fresh privacy review are required.'});
}));
router.post('/api/reports/:id/community-consent',auth('reporter'),wrap(async(req,res)=>{
 const r=validId(req.params.id)?await Report.findOne({_id:req.params.id,owner:req.user._id}):null;
 if(!r)return res.status(404).json({error:'Report not found'});
 if(typeof req.body?.consent!=='boolean')return res.status(400).json({error:'Choose consent or withdraw'});
 const revision=req.body.revision;
 if(!Number.isSafeInteger(revision)||revision<1)return res.status(400).json({error:'A valid summary version is required'});
 const p=await Publication.findOneAndUpdate({report:r._id,revision},req.body.consent?{$set:{consentRevision:revision,consentAt:new Date()}}:{$set:{published:false},$unset:{consentRevision:1,consentAt:1,privacyRevision:1,privacyAt:1}},{new:true});
 if(!p)return res.status(409).json({error:'Draft changed. Reload and read the current version.'});
 res.json({message:req.body.consent?'Consent recorded for this exact version. Publication still requires reviewer privacy approval.':'Consent withdrawn. Summary is no longer shared.'});
}));
router.post('/api/reports/:id/community-publish',auth('reviewer'),wrap(async(req,res)=>{
 const r=validId(req.params.id)?await Report.findById(req.params.id):null;
 if(!r||String(r.reviewer)!==req.user.id||!r.accepted)return res.status(403).json({error:'Only the assigned reviewer of an accepted case can publish'});
 if(req.body?.privacyChecked!==true||req.body?.indirectIdentifiersChecked!==true)return res.status(400).json({error:'Separate privacy and indirect identification checks are required'});
 const revision=req.body.revision;
 if(!Number.isSafeInteger(revision)||revision<1)return res.status(400).json({error:'A valid summary version is required'});
 const p=await Publication.findOneAndUpdate({report:r._id,revision,consentRevision:revision,consentAt:{$exists:true}},{$set:{privacyRevision:revision,privacyAt:new Date(),approvedBy:req.user._id,published:true}},{new:true});
 if(!p)return res.status(409).json({error:'Current-version reporter consent is required'});
 res.json({message:'Sanitized community summary published'});
}));
export default router;
