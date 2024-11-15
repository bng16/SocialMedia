import mongoose from "mongoose";

const commentSchema=new mongoose.Schema({
  text:{type:String,required:true},
  author:{type:mongoose.Types.ObjectId,ref:'User'},
  post:{type:mongoose.Types.ObjectId,ref:'Post'},


  likes:[{type:mongoose.Types.ObjectId,ref:'User'}],
  comments:[{type:mongoose.Types.ObjectId,ref:'Comment'}],

},{timestamps:true});

export default Comment = mongoose.model("Comment", commentSchema);