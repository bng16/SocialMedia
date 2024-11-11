import mongoose from "mongoose";

const postSchema=new mongoose.Schema({
  image:{type:String,required:true},
  caption:{type:String,default:""},
  author:{type:mongoose.Types.ObjectId,ref:'User'},


  like:[{type:mongoose.Types.ObjectId,ref:'User'}],
  comments:[{type:mongoose.Types.ObjectId,ref:'Comment'}],

},{timestamps:true});

export default Post = mongoose.model("Post", postSchema);