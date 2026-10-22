import mongoose from 'mongoose';
const {Schema}=mongoose;
// Private linkage and consent are never serialized by the library endpoints.
const publicationSchema=new Schema({
 report:{type:Schema.Types.ObjectId,ref:'Report'},
 author:{type:Schema.Types.ObjectId,ref:'User',index:true},
 kind:{type:String,enum:['case-summary','member-post'],default:'case-summary',index:true},
 alias:{type:String,default:'Anonymous'},
 summary:{type:String,required:true}, situation:{type:String,required:true},
 lessons:{type:String,default:''}, recommendations:{type:String,default:''},
 category:{type:String,required:true}, revision:{type:Number,default:1},
 consentRevision:Number, consentAt:Date, privacyRevision:Number, privacyAt:Date,
 approvedBy:Schema.Types.ObjectId, published:{type:Boolean,default:false},
 state:{type:String,enum:['pending','approved','rejected','removed'],default:'pending',index:true},
 flags:[{by:Schema.Types.ObjectId,reason:String}], moderatedBy:Schema.Types.ObjectId
},{timestamps:true});
publicationSchema.index({report:1},{name:'report_unique_when_present',unique:true,partialFilterExpression:{report:{$type:'objectId'}}});
const commentSchema=new Schema({
 publication:{type:Schema.Types.ObjectId,required:true,index:true,ref:'CommunityPublication'},
 revision:{type:Number,required:true},
 author:{type:Schema.Types.ObjectId,required:true,ref:'User'},
 alias:{type:String,default:'Anonymous'},text:{type:String,required:true},
 state:{type:String,enum:['pending','approved','removed'],default:'pending'},
 flags:[{by:Schema.Types.ObjectId,reason:String}], moderatedBy:Schema.Types.ObjectId
},{timestamps:true});
export const CommunityPublication=mongoose.model('CommunityPublication',publicationSchema);
export const CommunityComment=mongoose.model('CommunityComment',commentSchema);
