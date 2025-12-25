import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {generateToken} from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
    const {fullName, email, password, userName} = req.body;
    try{
        if(!fullName || !email || !password ||!userName){
            return res.status(400).json({message:"Please provide all required fields"});
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }
        if(email.indexOf('@')===-1){
            return res.status(400).json({message:"Please provide a valid email"});
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message:"User already exists with this email"});
        }
        const existingUser = await User.findOne({userName});
        if(existingUser){
            return res.status(400).json({message:"Username already taken"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword,
            userName:userName,
        });

        if(newUser){
            const token = generateToken(newUser._id,res);
            await newUser.save();
            return  res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                userName: newUser.userName,
                token,
            });
        }
        else{
                res.status(400).json({message:"Invalid user data"});
        }

    } catch(error){
        console.log("Error in signup:", error);
        res.status(500).json({message:"Server error"});
    }
};

export const login = async (req, res) => {

    const {emailOrUsername,password} = req.body;

    try{
        if(!emailOrUsername || !password){
            return res.status(400).json({message:"Please provide all required fields"});
        }
        let user;
        if(emailOrUsername.indexOf('@')===-1){
            user = await User.findOne({userName:emailOrUsername});
            if(!user){
                return res.status(400).json({message:"Invalid username or password"});
            }
        }
        else{
            user = await User.findOne({email: emailOrUsername});
            if(!user){
                return res.status(400).json({message:"Invalid email or password"});
        }
        }
        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const token = generateToken(user._id,res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            userName: user.userName,
            token,
        });
    }catch(error){
        console.log("Error in login:", error);
        res.status(500).json({message:"Server error"});
    }
};

export const logout = (req, res) => {
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:'strict',
        });
        res.status(200).json({message:"Logged out successfully"});
    }catch(error){
        console.log("Error in logout:", error);
        res.status(500).json({message:"Server error"});
    }
};

export const updateProfile = async (req, res) => {

    try{
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({message:"Please provide profile picture URL"});
        }

        const uploadResposnse = await cloudinary.uploader.upload(profilePic, {
            folder: 'profile_pics_chat_app',
            public_id: `user_${userId}`,
        });
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResposnse.secure_url }, { new: true }).select("-password");
        res.status(200).json({
                                message:"Profile updated successfully",
                                user: updatedUser
                            });
    }catch(error){
        console.log("Error in updateProfile:", error);
        res.status(500).json({message:"Server error"});
    }

}

export const checkAuth = async (req, res) => {
    try{
        res.status(200).json({
            user: req.user,
        });
    }catch(error){
        console.log("Error in checkAuth:", error);
        res.status(500).json({message:"Server error"});
    }
};



