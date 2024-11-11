// imports
import { User } from "./../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
const logout= (_,res)=>{
  try {
    return res.cookie("token",'',{maxAge:0}).json({
      message:`logout successfully`,
      success:true,
    });
  } catch (error) {
    console.error(error);
  }
}


