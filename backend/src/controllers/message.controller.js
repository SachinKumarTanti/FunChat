import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const getMessages = async (req, res) => {
    try{
        const {id:userToChatId} = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:currentUserId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:currentUserId}
            ]
        }).sort({createdAt:1});
        res.status(200).json(messages);
    }catch(error){
        console.log("Error in getMessages:", error);
        res.status(500).json({message:"Server error"});
    }
};

export const sendMessage = async (req, res) => {
    try{
        const {id:receiverId} = req.params;
        const currentUserId = req.user._id;
        let {text,image} = req.body;
        if (!text && !image){
            return res.status(400).json({message:"Message text or image is required"});
        }
        if(!text)text=" ";
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat-app",
                public_id: `message_${currentUserId}_${Date.now()}`
            });
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({ 
            senderId: currentUserId,
            receiverId: receiverId,
            text: text,
            image: imageUrl
        });
        await newMessage.save();
        res.status(200).json(newMessage);

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
        }
    }catch(error){
        console.log("Error in sendMessage:", error);
        res.status(500).json({message:"Server error"});
    }
};