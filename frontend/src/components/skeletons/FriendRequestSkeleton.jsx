const FriendRequestSkeleton = () => {
  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4 animate-pulse">
      <div className="h-6 w-40 bg-base-300 rounded mb-6" />

      {[1, 2, 3].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-base-100 p-4 rounded-lg shadow"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-base-300" />
            <div className="h-4 w-32 bg-base-300 rounded" />
          </div>

          <div className="flex gap-2">
            <div className="h-8 w-20 bg-base-300 rounded" />
            <div className="h-8 w-20 bg-base-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequestSkeleton;
