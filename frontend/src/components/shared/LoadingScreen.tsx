/**
 * LoadingScreen - Full-page loading indicator
 *
 * Used when checking initial auth state or loading critical data.
 */
export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#3D3D3D] border-t-[#36D399] rounded-full animate-spin"></div>
        <p className="text-[#9B9B9B] text-lg">Loading...</p>
      </div>
    </div>
  );
}
