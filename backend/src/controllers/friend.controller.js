import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";


export const getFriendsForSidebar = async (req, res) => {
    try{
        const friends = await User.find({_id: {$in: req.user.friends}}).select("-password");
        res.status(200).json({friends:friends});
    }catch(error){
        console.log("Error in getFriendsForSidebar:", error);
        res.status(500).json({message:"Server error"});
    }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const userId = req.user._id;
    const query = q.trim();

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
          userName: { $regex: query, $options: "i" }
        }
      },
      {
        $addFields: {
          priority: {
            $cond: [
              { $eq: [{ $toLower: "$userName" }, query.toLowerCase()] },
              1,
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$userName",
                      regex: `^${query}`,
                      options: "i"
                    }
                  },
                  2,
                  3
                ]
              }
            ]
          }
        }
      },
      { $sort: { priority: 1, userName: 1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          userName: 1,
          profilePic: 1
        }
      }
    ]);

    res.status(200).json({users:users});
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};

export const getUserProfile = async (req, res) => {
    try{
        const targetUserId = req.params.id;

        const user = await User.findById(targetUserId)
            .select("_id fullName userName profilePic");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFriend = req.user.friends.includes(targetUserId);
        const hasSentRequest = req.user.sentRequests.includes(targetUserId);
        const hasReceivedRequest = req.user.recievedRequests.includes(targetUserId);

        let friendStatus = "idle";
        if (isFriend) friendStatus = "friends";
        else if (hasReceivedRequest) friendStatus = "received";
        else if (hasSentRequest) friendStatus = "sent";
        

        res.json({ user, friendStatus });
    }catch(error){
        console.log("Error in getUserProfile:", error);
        res.status(500).json({message:"Server error"});
    }
};

export const getFriendRequests = async (req, res) => {
    try{
        const users = await User.find({_id: {$in: req.user.recievedRequests}}).select("_id fullName userName profilePic");
        if(!users){
            return res.status(404).json({users:[]});
        }
        res.status(200).json({users:users});
    }catch(error){
        console.log("Error in getFriendRequests:", error);
        res.status(500).json({message:"Server error"});
    }
}

export const sendFriendRequest = async (req, res) => {
  try{
    const targetUserId = req.params.id;
  const currentUserId = req.user._id;
    if (targetUserId === currentUserId.toString()) {
        return res.status(400).json({ message: "You cannot send a friend request to yourself." });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        return res.status(404).json({ message: "Target user not found." });
    }

    const isFriend = req.user.friends.includes(targetUserId);
    const hasSentRequest = req.user.sentRequests.includes(targetUserId);

    if (isFriend) {
        return res.status(400).json({ message: "You are already friends." });
    }

    if (hasSentRequest) {
        return res.status(400).json({ message: "You have already sent a friend request to this user." });
    }

    await User.findByIdAndUpdate(currentUserId, { $push: { sentRequests: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $push: { recievedRequests: currentUserId } });
    res.json({ message: "Friend request sent." });
    //tode : socket io integration for real-time notification
    const senderUser = await User.findById(currentUserId)
      .select("_id fullName userName profilePic");
    const getterUser = await User.findById(targetUserId)
      .select("_id fullName userName profilePic");
    
    const receiverSocket=getReceiverSocketId(targetUserId);
    if(receiverSocket)
      io.to(receiverSocket).emit("friendRequestReceived", senderUser);

    const senderSocket=getReceiverSocketId(currentUserId);
    if(senderSocket)
      io.to(senderSocket).emit("friendRequestSent", getterUser);
    
  }catch(error){
    console.log("Error in sendFriendRequest:", error);
    res.status(500).json({message:"Server error"});
  }
};

export const acceptFriendRequest = async (req, res) => {
    try{
        const requesterId = req.params.id;
        const currentUserId = req.user._id;
            const hasRecievedRequest = req.user.recievedRequests.includes(requesterId);

            if (!hasRecievedRequest) {
                return res.status(400).json({ message: "No friend request from this user." });
            }
            await User.findByIdAndUpdate(currentUserId, {
                $push: { friends: requesterId },
                $pull: { recievedRequests: requesterId }
            });
            await User.findByIdAndUpdate(requesterId, {
                $push: { friends: currentUserId },
                $pull: { sentRequests: currentUserId }
            });
            res.json({ message: "Friend request accepted." });

            //mutual request bug handled
            if(req.user.sentRequests.includes(requesterId)){
              await User.findByIdAndUpdate(currentUserId, {
                $pull: { sentRequests: requesterId }
              });
              await User.findByIdAndUpdate(requesterId, {
                $pull: { recievedRequests: currentUserId }
              });
            }
            // socket io integration for real-time notification
            const senderUser = await User.findById(currentUserId)
      .select("_id fullName userName profilePic");
            const acceptorUser = await User.findById(requesterId)
      .select("_id fullName userName profilePic");
            
            const senderSocket=getReceiverSocketId(currentUserId);
            if(senderSocket)
              io.to(senderSocket).emit("friendRequestAccepted", acceptorUser);

            const receiverSocket=getReceiverSocketId(requesterId);
            if(receiverSocket)
              io.to(receiverSocket).emit("friendRequestAccepted", senderUser);
            
    }catch(error){
        console.log("Error in acceptFriendRequest:", error);
        res.status(500).json({message:"Server error"});
    }
};

export const declineFriendRequest = async (req, res) => {
  try{
    const requesterId = req.params.id;
  const currentUserId = req.user._id;
    const hasRecievedRequest = req.user.recievedRequests.includes(requesterId);
    if (!hasRecievedRequest) {
        return res.status(400).json({ message: "No friend request from this user." });
    }
    await User.findByIdAndUpdate(currentUserId, {
        $pull: { recievedRequests: requesterId }
    });
    await User.findByIdAndUpdate(requesterId, {
        $pull: { sentRequests: currentUserId }
    });
    res.json({ message: "Friend request declined." });

    const receiverSocket=getReceiverSocketId(requesterId);
    const senderSocket=getReceiverSocketId(currentUserId);
    if(receiverSocket)
      io.to(receiverSocket).emit("friendRequestDeclined", currentUserId);
    if(senderSocket)
      io.to(senderSocket).emit("friendRequestDeclined", requesterId);
  }catch(error){
    console.log("Error in declineFriendRequest:", error);
    res.status(500).json({message:"Server error"});
  }
};

export const removeFriend = async (req, res) => {
  try{
    const friendId = req.params.id;
  const currentUserId = req.user._id;
    const isFriend = req.user.friends.includes(friendId);
    if (!isFriend) {
        return res.status(400).json({ message: "This user is not in your friends list." });
    }
    await User.findByIdAndUpdate(currentUserId, {
        $pull: { friends: friendId }
    });
    await User.findByIdAndUpdate(friendId, {
        $pull: { friends: currentUserId }
    });
    res.json({ message: "Friend removed successfully." });
    //socket
    const receiverSocket=getReceiverSocketId(friendId);
    const senderSocket=getReceiverSocketId(currentUserId);
    if(receiverSocket)
      io.to(receiverSocket).emit("friendRemoved",  currentUserId );
    if(senderSocket)
      io.to(senderSocket).emit("friendRemoved", friendId );
      
  }catch(error){
    console.log("Error in removeFriend:", error);
    res.status(500).json({message:"Server error"});
  }
};