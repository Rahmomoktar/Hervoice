import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {randomBytes,createHash} from 'node:crypto';
import nodemailer from 'nodemailer';
import {User} from '../models/User.js';
import {Report} from '../models/Report.js';
import {auth} from '../middleware/authMiddleware.js';
import {wrap,publicUser,validId} from '../utils/helpers.js';
const router=Router();
router.get('/api/staff/consultants',auth('reviewer'),wrap(async(req,res)=>res.json({consultants:(await User.find({role:'consultant',active:{$ne:false}}).select('name')).map(u=>({id:u.id,name:u.name}))})));
router.get('/api/admin/users',auth('admin'),wrap(async(req,res)=>res.json({users:(await User.find({removedAt:null}).select('name email role profileCode active').sort({createdAt:-1}).limit(200)).map(u=>({id:u.id,name:u.name,email:u.email,role:u.role,profileCode:u.profileCode,active:u.active!==false}))})));
router.post('/api/admin/staff',auth('admin'),wrap(async(req,res)=>{
 const {name,email,role,password}=req.body||{};
 if(typeof name!=='string'||name.trim().length<2||name.length>80||typeof email!=='string'||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['reviewer','consultant'].includes(role))return res.status(400).json({error:'Enter a valid name, email, and reviewer or consultant role'});
 // A supplied password creates the account directly; the invitation flow remains supported.
 if(password!==undefined){
  if(typeof password!=='string'||password.length<8||Buffer.byteLength(password,'utf8')>72)return res.status(400).json({error:'Staff password must be at least 8 characters'});
  const address=email.trim().toLowerCase();
  if(await User.exists({email:address}))return res.status(409).json({error:'An account already uses this email'});
  const user=await User.create({name:name.trim(),email:address,role,passwordHash:await bcrypt.hash(password,12),active:true});
  return res.status(201).json({user:publicUser(user),delivery:'direct',message:'Staff account created. The staff member can now log in.'});
 }
 const delivery=process.env.INVITATION_DELIVERY||'local';
 if(!['local','smtp'].includes(delivery)||delivery==='smtp'&&(!process.env.SMTP_HOST||!process.env.SMTP_FROM))return res.status(503).json({error:'Invitation email is not configured. Ask the local administrator to configure SMTP.'});
 const address=email.trim().toLowerCase();
 let user=await User.findOne({email:address});
 if(user&&(user.removedAt||user.active!==false||!['reviewer','consultant'].includes(user.role)))return res.status(409).json({error:'An active account already uses this email'});
 const secret=randomBytes(32).toString('hex');
 const hash=createHash('sha256').update(secret).digest('hex');
 if(!user)user=new User({name:name.trim(),email:address,role,passwordHash:await bcrypt.hash(randomBytes(32).toString('hex'),12),active:false});
 user.name=name.trim();user.role=role;user.invitationHash=hash;user.invitationExpires=new Date(Date.now()+24*60*60*1000);await user.save();
 const origin=process.env.PUBLIC_FRONTEND_URL||'http://localhost:5173';
 const invitationUrl=new URL('/#invite='+secret,origin).toString();
 if(delivery==='smtp'){
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',requireTLS:process.env.SMTP_SECURE!=='true',...(process.env.SMTP_USER?{auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}}:{})});
  try{await transport.sendMail({from:process.env.SMTP_FROM,to:address,subject:'Your HER VOICE staff invitation',text:`You have been invited to HER VOICE as a ${role}. Set your password using this single-use link, valid for 24 hours:\n${invitationUrl}\nIf you did not expect this invitation, ignore this email.`})}catch{return res.status(502).json({error:'Invitation email could not be delivered. The account is pending; submit this staff form again to issue a new invitation.'})}
 }
 res.status(201).json({user:publicUser(user),delivery,...(delivery==='local'?{invitationUrl}:{}),message:delivery==='smtp'?'Invitation email sent':'Local demo invitation created. Email was not sent.'});
}));
router.delete('/api/admin/users/:id',auth('admin'),wrap(async(req,res)=>{
 if(!validId(req.params.id))return res.status(404).json({error:'User not found'});
 if(req.params.id===req.user.id)return res.status(400).json({error:'You cannot remove your own account'});
 const user=await User.findById(req.params.id);
 if(!user||user.removedAt)return res.status(404).json({error:'User not found'});
 if(user.role==='admin')return res.status(403).json({error:'Administrator removal requires the controlled local setup process'});
 user.active=false;user.removedAt=new Date();user.invitationHash=undefined;user.invitationExpires=undefined;await user.save();
 if(user.role==='reviewer')await Report.updateMany({reviewer:user._id},{$set:{reviewer:null,consultant:null,accepted:false},$unset:{acceptedAt:1}});
 if(user.role==='consultant')await Report.updateMany({consultant:user._id},{$set:{consultant:null}});
 res.json({message:'User removed. Access is disabled; case history is preserved.'});
}));
export default router;
