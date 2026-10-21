import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { User, Report, Message } from '../models.js';
import { auth } from '../middleware/authMiddleware.js';
import { wrap, validId, loginToken, publicUser, reportJson, allowedReport, categories } from '../utils/helpers.js';
import {consultantProfile} from '../utils/specialists.js';
const router = Router();
router.post('/api/reports', auth('reporter'), wrap(async (req, res) => {
  const {
    category,
    description
  } = req.body || {};
  if (!categories.includes(category) || typeof description !== 'string' || description.trim().length < 20 || description.length > 2000) return res.status(400).json({
    error: 'Select a category and enter 20–2000 characters'
  });
  const report = await Report.create({
    owner: req.user._id,
    code: 'HV-R-' + randomBytes(6).toString('hex').toUpperCase(),
    category,
    description: description.trim()
  });
  res.status(201).json({
    report: reportJson(report)
  });
}));
router.get('/api/reports/mine', auth('reporter'), wrap(async (req, res) => res.json({
  reports: (await Report.find({
    owner: req.user._id
  }).sort({
    createdAt: -1
  }).limit(100)).map(r => {
    r.$locals.hideNotes = true;
    return reportJson(r);
  })
})));
router.get('/api/reports/all',auth('reviewer'),wrap(async(req,res)=>res.json({reports:(await Report.find().sort({createdAt:-1})).map(r=>{r.$locals.hideNotes=String(r.reviewer)!==req.user.id;return reportJson(r)})})));
router.get('/api/reports/accepted',auth('consultant'),wrap(async(req,res)=>res.json({reports:(await Report.find({accepted:true,consultant:req.user._id}).sort({acceptedAt:-1,createdAt:-1})).map(reportJson)})));
router.get('/api/reports/assigned', auth('reviewer', 'consultant'), wrap(async (req, res) => {
  const key = req.user.role === 'reviewer' ? 'reviewer' : 'consultant';
  res.json({
    reports: (await Report.find({
      [key]: req.user._id,
      ...(req.user.role==='consultant'?{accepted:true}:{})
    }).sort({
      createdAt: -1
    }).limit(100)).map(reportJson)
  });
}));
router.get('/api/reports/unassigned', auth('reviewer'), wrap(async (req, res) => res.json({
  reports: (await Report.find({
    reviewer: null
  }).sort({
    createdAt: 1
  }).limit(100)).map(r => ({
    id: r.id,
    code: r.code,
    category: r.category,
    status: r.status,
    createdAt: r.createdAt
  }))
})));
router.post('/api/reports/:id/claim', auth('reviewer'), wrap(async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({
    error: 'Not found'
  });
  const r = await Report.findOneAndUpdate({
    _id: req.params.id,
    reviewer: null
  }, {
    $set: {
      reviewer: req.user._id,
      status: 'Under Review'
    }
  }, {
    new: true
  });
  if (!r) return res.status(409).json({
    error: 'Report already assigned or missing'
  });
  res.json({
    report: reportJson(r)
  });
}));
router.post('/api/reports/:id/accept',auth('reviewer'),wrap(async(req,res)=>{
 if(!validId(req.params.id))return res.status(404).json({error:'Not found'});
 const report=await Report.findOneAndUpdate({_id:req.params.id,$or:[{reviewer:null},{reviewer:req.user._id}],accepted:{$ne:true}},{$set:{reviewer:req.user._id,accepted:true,acceptedAt:new Date(),status:'Under Review'}},{new:true});
 if(!report)return res.status(409).json({error:'Case already accepted, assigned to another reviewer, or missing'});
 res.json({report:reportJson(report)});
}));
router.get('/api/reports/:id', auth('reporter', 'reviewer', 'consultant'), wrap(async (req, res) => {
  const r = await allowedReport(req, res, true);
  if (!r) return;
  const data = reportJson(r);
  if(r.consultant){const consultant=await User.findById(r.consultant).select('name consultantTitle organization specialties');if(consultant)data.consultantProfile=consultantProfile(consultant);}
  if (req.user.role === 'reporter'||req.user.role==='reviewer'&&String(r.reviewer)!==req.user.id||req.user.role==='consultant'&&String(r.consultant)!==req.user.id) delete data.notes;
  res.json({
    report: data
  });
}));
router.patch('/api/reports/:id', auth('reviewer', 'consultant'), wrap(async (req, res) => {
  const r = await allowedReport(req, res);
  if (!r) return;
  const keys = Object.keys(req.body || {});
  if (keys.length !== 1) return res.status(400).json({
    error: 'Change one field at a time'
  });
  if (['reviewer', 'consultant'].includes(req.user.role) && keys[0] === 'status' && ['Under Review', 'Awaiting Clarification', 'In Progress', 'Closed'].includes(req.body.status)) {
    r.status = req.body.status;
  } else if (r.accepted && req.user.role === 'reviewer' && keys[0] === 'consultant' && validId(req.body.consultant)) {
    const consultant=await User.findOne({_id:req.body.consultant,role:'consultant',active:{$ne:false}});
    if(!consultant||!consultantProfile(consultant).specialties.includes(r.category))return res.status(400).json({error:'Choose an active consultant whose supported categories include this report category'});
    r.consultant = consultant._id;
  } else if (req.user.role === 'consultant' && keys[0] === 'note' && typeof req.body.note === 'string' && req.body.note.trim().length >= 3 && req.body.note.length <= 1000) {
    r.notes.push({
      author: req.user._id,
      text: req.body.note.trim()
    });
  } else {
    return res.status(400).json({
      error: 'Invalid change for your role'
    });
  }
  await r.save();
  res.json({
    report: reportJson(r)
  });
}));
export default router;
