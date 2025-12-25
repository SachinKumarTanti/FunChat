import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {axiosInstance} from "../lib/axios.js";
import { useFriendStore } from "../store/useFriendStore.js";
import { UserCheck, MessageCircle, UserX, Loader } from "lucide-react";
import { useChatStore } from "../store/useChatStore.js";

const UserProfilePage = () => {

  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); 

  const navigate = useNavigate();
  const {sendFriendRequest, removeFriend,users,subscribeToFriendEvents,unsubscribeFromFriendEvents,acceptFriendRequest,declineFriendRequest} = useFriendStore();
  const { setSelectedUser } = useChatStore();

  const fetchUser = async () => {
      const res = await axiosInstance.get(`/friend/userProfile/${id}`);
      setUser(res.data.user);
      setStatus(res.data.friendStatus);
    };

    useEffect(() => {
        fetchUser();
        subscribeToFriendEvents();
        return () => {
          unsubscribeFromFriendEvents();
        };
  }, [id, subscribeToFriendEvents, unsubscribeFromFriendEvents,fetchUser]);

  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest(id);
      setStatus("sent");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleUnfriend = async () => {
    removeFriend(id);
    setStatus("idle");
  }

  const handlechat = () => {
    try{
        const existingUser = users.find(u => u._id === id);
        if (existingUser) {
          setSelectedUser(existingUser);
        } else if (user) {
          setSelectedUser(user);
        }
        navigate('/');
    }catch(err){
        console.error("Error selecting user for chat:", err);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptFriendRequest(id);
      setStatus("friends");
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };
  const handleDecline = async () => {
    try {
      await declineFriendRequest(id);
      setStatus("idle");
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };
  if (!user) {
    return (
      <div className='flex justify-center items-center h-screen'> 
      <Loader className='animate-spin size-10'/>
      </div>
    )
  }

  return (
  <div className="max-w-md mx-auto mt-24 md:mt-32 md:mt-40 bg-base-100 p-6 rounded-xl shadow">
    <img
      src={user.profilePic || "/avatar.png"}
      className="size-20 md:size-24 rounded-full mx-auto"
    />

    <div className="flex flex-col">
      <h2 className="text-2xl md:text-3xl font-bold text-center mt-4">
        {user.fullName}
      </h2>
      <h2 className="text-lg md:text-xl font-medium text-center mt-1 md:mt-2">
        @{user.userName}
      </h2>
    </div>

    <p className="text-center text-base-content/70 mt-2">
      {user.bio || "No bio available"}
    </p>

    {status === "idle" && (
      <button
        onClick={handleSendFriendRequest}
        className="btn btn-primary w-full mt-4"
      >
        Send Friend Request
      </button>
    )}

    {status === "sent" && (
      <button className="btn btn-disabled w-full mt-4">
        Request Sent
      </button>
    )}

    {status === "friends" && (
      <div className="flex flex-col md:flex-row gap-3 mt-4 w-full">
        <button className="btn btn-outline btn-success flex items-center gap-2 w-full md:w-auto">
          <UserCheck size={16} />
          Friends
        </button>

        <button
          onClick={handlechat}
          className="btn btn-primary flex items-center gap-2 w-full md:w-auto"
        >
          <MessageCircle size={16} />
          Chat
        </button>

        <button
          onClick={handleUnfriend}
          className="btn btn-outline btn-error flex items-center gap-2 w-full md:w-auto"
        >
          <UserX size={16} />
          Unfriend
        </button>
      </div>
    )}

    {status === "received" && (
      <div className="flex flex-col md:flex-row md:justify-center gap-3 mt-4 w-full">
        <button
          className="btn btn-primary flex items-center gap-2 w-full md:w-auto"
          onClick={handleAccept}
        >
          <UserCheck size={16} />
          Accept
        </button>

        <button
          onClick={handleDecline}
          className="btn btn-outline btn-error flex items-center gap-2 w-full md:w-auto"
        >
          <UserX size={16} />
          Decline
        </button>
      </div>
    )}
  </div>
);
};

export default UserProfilePage;
