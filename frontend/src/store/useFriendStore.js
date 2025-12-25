import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";
import { useChatStore } from "./useChatStore.js";

export const useFriendStore = create((set,get) => ({
    users: [],
    isUsersLoading: false,
    friendRequests: [],
    isRequestsLoading: false,

    getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friend/get-friends");
      set({ users: res.data.friends });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

    getFriendRequests: async () => {
        set({ isRequestsLoading: true });
        try {
            const res = await axiosInstance.get("/friend/get-friend-requests");
            set({ friendRequests: res.data.users });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            set({ isRequestsLoading: false });
        }
    },

    acceptFriendRequest: async (id) => {
        try {
            await axiosInstance.post(`/friend/accept-friend-request/${id}`);
              set({
                friendRequests: get().friendRequests.filter(req => req._id !== id),
                });
            toast.success("Friend request accepted");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    },


    declineFriendRequest: async (id) => {
        try {
            await axiosInstance.post(`/friend/decline-friend-request/${id}`);
            set({
                friendRequests: get().friendRequests.filter(req => req._id !== id),
            });
            toast.success("Friend request declined");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    },
    sendFriendRequest: async (id) => {
        try {
            await axiosInstance.post(`/friend/send-friend-request/${id}`);
            toast.success("Friend request sent");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    },
    removeFriend: async (id) => {
        try {
            await axiosInstance.post(`/friend/remove-friend/${id}`);
            toast.success("Friend removed");
            set({
                users: get().users.filter(user => user._id !== id),
            });
            const { selectedUser, setSelectedUser } = useChatStore.getState();
            if (selectedUser && selectedUser._id === id) {
                setSelectedUser(null);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    },
    subscribeToFriendEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.on("friendRequestReceived", (newFriendRequest) => {
        set({
        friendRequests: [...get().friendRequests || [], newFriendRequest],
        });
    });

    socket.on("friendRequestAccepted", (friend) => {
        set({
        users: [...get().users || [], friend],
        });
        set({
        friendRequests: get().friendRequests.filter(req => req._id !== friend._id),
        });
    });

    socket.on("friendRemoved", (friendId) => {
        set({
        users: get().users.filter(user => user._id !== friendId),
        });

        const { selectedUser, setSelectedUser } = useChatStore.getState();
        if (selectedUser && selectedUser._id === friendId) {
        setSelectedUser(null);
        }

    });

    socket.on("friendRequestDeclined", (userId) => {
        // Optionally handle declined friend request notification
    });
    },
    

    unsubscribeFromFriendEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("friendRequestReceived");
    socket.off("friendRequestAccepted");
    socket.off("friendRemoved");
    socket.off("friendRequestDeclined");
    },
    setUsersnull: () => {
        set({users: []});
    },
    setFriendRequestsnull: () => {
        set({friendRequests: []}); 
    },

    }));