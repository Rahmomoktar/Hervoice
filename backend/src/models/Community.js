import mongoose from 'mongoose';
const {Schema}=mongoose;
// Private linkage and consent are never serialized by the library endpoints.
const publicationSchema=new Schema({
 report:{type:Schema.Types.ObjectId,required:true,unique:true,ref:'Report'},
 summary:{type:String,required:true}, situation:{type:String,required:true},
 lessons:{type:String,required:true}, recommendations:{type:String,required:true},
 category:{type:String,required:true}, revision:{type:Number,default:1},
 consentRevision:Number, consentAt:Date, privacyRevision:Number, privacyAt:Date,
 approvedBy:Schema.Types.ObjectId, published:{type:Boolean,default:false}
},{timestamps:true});
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
