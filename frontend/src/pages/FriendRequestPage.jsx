import { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import FriendRequestSkeleton from "../components/skeletons/FriendRequestSkeleton";
import { Users ,UserPlus} from "lucide-react";
import { useNavigate } from "react-router-dom";
const FriendRequestPage = () => {

  const navigate = useNavigate();

  const { friendRequests,isRequestsLoading,getFriendRequests,acceptFriendRequest,declineFriendRequest,subscribeToFriendEvents,unsubscribeFromFriendEvents } = useFriendStore();

    useEffect(() => {
        getFriendRequests();
        subscribeToFriendEvents();
        return () => {
            unsubscribeFromFriendEvents();
        }
    }, [subscribeToFriendEvents,unsubscribeFromFriendEvents,getFriendRequests]);
    const accept = (id) => {
        acceptFriendRequest(id);
    };

    const reject = (id) => {
        declineFriendRequest(id);
    };

    if (isRequestsLoading) return <FriendRequestSkeleton />;



    if (!friendRequests || friendRequests.length === 0) {
      return (
          <div className="max-w-md mx-auto mt-40 p-6 bg-base-100 rounded-xl shadow text-center">
            <Users size={40} className="mx-auto mb-3 text-base-content/60" />
            <h3 className="font-semibold">No Requests Yet</h3>
            <p className="text-sm text-base-content/60 mt-1">
              When someone sends you a friend request, it’ll appear here.
            </p>
          </div>
      );
    }

return (
  <div className="max-w-xl mx-auto mt-6 md:mt-10 space-y-4 px-3 md:px-0">
    <h2 className="text-lg md:text-xl font-bold mb-4">
      Friend Requests
    </h2>

    {friendRequests.map((user) => (
      <div
        key={user._id}
        className="flex flex-col md:flex-row md:items-center md:justify-between
                   bg-base-100 p-4 rounded-lg shadow gap-4"
      >
        {/* User Info */}
        <div
          className="hover:cursor-pointer"
          onClick={() => navigate(`/userProfile/${user._id}`)}
        >
          <div className="flex items-center gap-3">
            <img
              src={user.profilePic || "/avatar.png"}
              className="size-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-medium text-lg md:text-xl">
                {user.fullName}
              </span>
              <span className="text-sm text-base-content/70">
                @{user.userName}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => accept(user._id)}
            className="btn btn-sm btn-success w-full sm:w-auto"
          >
            Accept
          </button>
          <button
            onClick={() => reject(user._id)}
            className="btn btn-sm btn-error w-full sm:w-auto"
          >
            Decline
          </button>
        </div>
      </div>
    ))}
  </div>
);

};

export default FriendRequestPage;
