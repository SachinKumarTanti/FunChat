import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

import {
    searchUsers,
    getUserProfile,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    getFriendsForSidebar,
    removeFriend
} from '../controllers/friend.controller.js';

router.get("/search", protectRoute, searchUsers);
router.get("/userProfile/:id", protectRoute,getUserProfile);
router.get("/get-friends", protectRoute, getFriendsForSidebar);
router.get("/get-friend-requests", protectRoute, getFriendRequests);
router.post("/send-friend-request/:id", protectRoute, sendFriendRequest);
router.post("/accept-friend-request/:id", protectRoute, acceptFriendRequest);
router.post("/decline-friend-request/:id", protectRoute, declineFriendRequest);
router.post("/remove-friend/:id", protectRoute, removeFriend); 
export default router;