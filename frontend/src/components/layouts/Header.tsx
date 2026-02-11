import { useAuthStore } from '@stores/authStore';
import { useLogout } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Header - Top header bar for authenticated pages
 *
 * Displays:
 * - User name and role badge
 * - Logout button
 *
 * Matches styling from components/_headers.sass (.appHeader)
 */
export function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const isClient = !!user?.clientId;
  const isDeveloper = !!user?.developerId;
  const role = isClient ? 'Client' : isDeveloper ? 'Developer' : 'User';

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 px-8 lg:px-14 py-6 bg-[#231F1F] border-b border-[#3D3D3D]">
      <div className="flex items-center justify-between">
        {/* Left side - User info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#3D3D3D] flex items-center justify-center">
              <i className="ri-user-line text-[#F5F5F5] text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F5F5F5]">
                {user?.name || 'User'}
              </h2>
              <p className="text-sm text-[#9B9B9B]">{user?.email}</p>
            </div>
          </div>

          {/* Role badge */}
          <div className="px-3 py-1 rounded-xl border border-[#36D399] text-[#36D399] text-sm font-medium">
            {role}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#3D3D3D] text-[#F5F5F5] hover:border-[#36D399] hover:shadow-lg transition-all disabled:opacity-50"
          >
            {logout.isPending ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <i className="ri-logout-box-line"></i>
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
