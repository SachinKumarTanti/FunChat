import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true,
        },
        fullName:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:true,
            minlength:6,
        },
        profilePic:{
            type:String,
            default:"",
        },
        //new updates
        friends:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }],
        recievedRequests:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }],
        sentRequests:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }],
        userName:{
            type:String,
            required:true,
            unique:true,
        },

    },
    {timestamps:true,}
);
const User = mongoose.model("User",userSchema);


export default User;