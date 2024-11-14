// imports
import { User } from "./../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from './../utils/cloudinary.js';

// Function to register user
export const register = async (req, res) => {
  try {
    // Get the username password and email from front-end
    const { username, email, password } = req.body;

    // Checking if the input is empty or not
    if (!username || !email || !password) {
      return res.status(401).json({
        Message: "Something is missing, please check!",
        success: false,
      });
    }

    // Checking if any user with the same email is available
    const emailUser = await User.findOne({ email });
    if (emailUser) {
      return res.status(401).json({
        Message: "try different email.",
        success: false,
      });
    }

    // Checking if any user with the same username is available
    const usernameUser = await User.findOne({ username });
    if (usernameUser) {
      return res.status(401).json({
        Message: "User name already taken!",
        success: false,
      });
    }

    // hashing the password and stored in a variable
    const hashedPassword = await bcrypt.hash(password, 10);

    // creating an new user with username email & password
    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // returning a success code
    return res.status(201).json({
      Message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
  }
};

// Function to login user
export const login = async (req, res) => {
  try {
    // Get the username password and email from front-end
    const { email, password } = req.body;

    // Checking if the input is empty or not
    if (!email || !password) {
      return res.status(401).json({
        Message: "Something is missing, please check!",
        success: false,
      });
    }

    // accessing the user info from User with email
    let user = await User.findOne({ email });

    // checking if the user is available or not
    if (!user) {
      return res.status(401).json({
        Message: "Incorrect email or password",
        success: false,
      });
    }

    // Comparing if the password given and actual passwords same or not if not return error code
    const isPasswordMatched= await bcrypt.compare(password,user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        Message: "Incorrect email or password",
        success: false,
      });
    }

    // creating a new user object to send to front-end for view
    user={
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
    }

    // creating and storing the token to the cookies in the browser
    const token =await jwt.sign({userId:user._id},process.env.SECRET_KEY,{expiresIn:'10d'});
    return res.cookie("token",token,{httpOnly:true,sameSite:'strict',maxAge:10*24*60*60*1000}).json({
      message:`Welcome back ${user.username}`,
      success:true,
      user,
    });


  } catch (error) {
    console.log(error);
  }
};


// Logic for logout
export const logout= (_,res)=>{
  try {
    return res.cookie("token",'',{maxAge:0}).json({
      message:`logout successfully`,
      success:true,
    });
  } catch (error) {
    console.error(error);
  }
}


// to get the user profile with id
export const getProfile = async (req,res)=>{
  try {
    const userId = req.params.id;
    let user= await User.findById(userId).select('-password');
    return res.status(200).json({
      user,
      success:true,
    })
  } catch (error) {
    console.error(error);
  }

}

// edit profile
export const editProfile = async (req,res)=>{
  try {
    const userId=req.id;
    const {bio,gender}=req.body;
    const profilePicture=req.file;
    let cloudResponse;
    
    if(profilePicture){{
      const fileUri=getDataUri(profilePicture);//this is to convert the image into uri (../utils/datauri.js)
      cloudResponse=await cloudinary.uploader.upload(fileUri);//the uri file is being uploaded to cloudinary and cloudinary provide a link (../utils/cloudinary.js)<-cloudinary setup
    }}


    const user=await User.findById(userId);
    if(!user){
      return res.status(401).json({
        message:"user not found!",
        success:false,
      })
    }
    if(bio) user.bio=bio;
    if(gender) user.gender=gender;
    if(profilePicture) user.profilePicture=cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message:"Profile updated.",
        success:true,
        user,
    })

  } catch (error) {
    console.error(error);
  }

}


// for suggesting users
export const getSuggestedUsers=async (req,res)=>{
  try {
    const suggestedUser=await User.findById({_id:{$ne:req.id}}).select("-password");
    if(!suggestedUser){
      return res.status(400).json({
        message:"Currently do not have any users",
      })
    }
    return res.status(200).json({
      success:true,
      users:suggestedUser,
    })
  } catch (error) {
    console.error(error)
  }
}


// logic to follow and unfollow users
export const followOrUnfollow= async (req,res)=>{
  try {
    const firstUser=req.id;   // this is the id of the user who is login and clicked follow or un-follow button!
    const secondUser=req.params.id;   // this is the receiver user who is being followed or un-followed!
    if(firstUser===secondUser){
      return res.status(400).json({
        message: "You can't follow yourself!",
        success:false,
      })
    }
    const user=await User.findById(firstUser);
    const targetUser=await User.findById(secondUser);
    if(!user || !targetUser){
      return res.status(400).json({
        message:"user not found!",
        success:false,
      })
    }
    const isFollowing=user.following.includes(secondUser);
    if(isFollowing){
      //unFollow logic
      await Promise.all([
        User.updateOne({_id:firstUser},{$pull:{following:secondUser}}),
        User.updateOne({_id:secondUser},{$pull:{followers:firstUser}}),
      ])
      return res.status(200).json({message:"unfollowed successfully",success:true})
    }else{
      //follow logic
      await Promise.all([
        User.updateOne({_id:firstUser},{$push:{following:secondUser}}),
        User.updateOne({_id:secondUser},{$push:{followers:firstUser}}),
      ])
      return res.status(200).json({message:"followed successfully",success:true})
    }
  } catch (error) {
    console.error(error)
  }
}