import { useSearchStore } from "../store/useSearchStore";
import { Link } from "react-router-dom";

const UserSearchResults = () => {
  const { results, open, clearSearch } = useSearchStore();

  if (!open || !results.length) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-72 bg-base-100 shadow-xl rounded-xl z-50 overflow-hidden">
      {results.map((user) => (
        <Link
          key={user._id}
          to={`/userProfile/${user._id}`}
          onClick={clearSearch}
          className="flex items-center gap-3 px-4 py-3 hover:bg-base-200"
        >
          <img
            src={user.profilePic || "/avatar.png"}
            className="size-8 rounded-full"
          />
          <span className="font-medium">@{user.userName}</span>
        </Link>
      ))}
    </div>
  );
};

export default UserSearchResults;
