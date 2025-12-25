import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Search ,UserPen} from "lucide-react";
import { useSearchStore } from "../store/useSearchStore";
import { useEffect,useState } from "react";



const Navbar = () => {

  const { logout, authUser } = useAuthStore();
  const { query, searchUsers, loading ,clearSearch} = useSearchStore();

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && clearSearch();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">FunChat</h1>
            </Link>
          </div>

          {authUser && (
            <>
          {/* for mobile view */}
          <button
              className="md:hidden btn btn-ghost btn-circle"
              onClick={() => setShowMobileSearch(true)}
            >
              <Search className="size-5" />
          </button>

            {showMobileSearch && (
            <div className="fixed inset-0 z-50 bg-base-100 p-4">
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={() => setShowMobileSearch(false)}
                >
                  ✕
                </button>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/60" />

                  <input
                    autoFocus
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => searchUsers(e.target.value)}
                    className="input input-sm w-full pl-9 bg-base-200"
                  />

                  {loading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-xs" />
                  )}
                </div>
              </div>

            </div>
          )}

          <div className="relative hidden md:block w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/60" />

            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => searchUsers(e.target.value)}
              className="input input-sm w-full pl-9 bg-base-200"
            />

            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-xs" />
            )}
          </div>
          </>
        )}
        
          <div className="flex items-center gap-2">
            {authUser && (
              <>
            <Link
              to={"/friend-requests"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <UserPen className="w-4 h-4" />
              <span className="hidden sm:inline">Requests</span>
            </Link>
            </>
            )}
            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
