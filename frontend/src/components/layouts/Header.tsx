import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { useLogout } from '@hooks/useAuth';
import { cn } from '@lib/cn';
import { W3SLogo } from '@components/ui/W3SLogo';

/**
 * Header - Top navbar component matching Figma design
 *
 * Figma specs:
 * - Full width, height: 68px
 * - bg-[var(--base-surface-1,#141414)]
 * - border-bottom: 1px solid var(--base-border,#3d3d3d)
 * - Horizontal padding: var(--spacing-22, 112px) on desktop
 * - LEFT: Logo + Menu items (Projects, Payments, Profile)
 * - RIGHT: Notification bell + Avatar dropdown
 *
 * Matches Figma components: "Navbar / Client" and "Navbar / Dev"
 */
export function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  // Navigation items based on role
  const navItems = isClient
    ? [
        { to: '/projects', label: 'Projects' },
        { to: '/payments', label: 'Payments' },
        { to: '/profile', label: 'Profile' },
      ]
    : isDeveloper
    ? [
        { to: '/projects', label: 'Projects' },
        { to: '/payments', label: 'Payments' },
        { to: '/profile', label: 'Profile' },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 h-[68px] bg-[var(--base-surface-1,#141414)] border-b border-[var(--base-border,#3d3d3d)]">
      <div className="h-full flex items-center justify-between px-4 md:px-8 lg:px-[var(--spacing-22,112px)]">
        {/* LEFT SECTION - Logo + Menu */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <W3SLogo size={20} />
            <span className="text-[var(--text-dark-primary,#f5f5f5)] font-semibold text-base">work3spaces</span>
          </NavLink>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'h-11 px-[var(--spacing-6,10px)] rounded-[var(--radi-6,12px)] flex items-center gap-2',
                    'text-base font-medium transition-colors',
                    isActive
                      ? 'text-[var(--state-brand-active,#36d399)] bg-[var(--base-fill-1,#333)]'
                      : 'text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] hover:bg-[var(--base-fill-1,#333)]'
                  )
                }
              >
                <span>{item.label}</span>
                <i className="ri-arrow-down-s-line text-2xl"></i>
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[var(--text-dark-primary,#f5f5f5)]"
            aria-label="Toggle menu"
          >
            <i className={isMenuOpen ? 'ri-close-line text-2xl' : 'ri-menu-line text-2xl'}></i>
          </button>
        </div>

        {/* RIGHT SECTION - Notification + Avatar */}
        <div className="flex items-center gap-4">
          {/* Notification bell with indicator */}
          <button
            className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--base-fill-1,#333)] transition-colors"
            aria-label="Notifications"
          >
            <i className="ri-notification-2-line text-2xl text-[var(--text-dark-primary,#f5f5f5)]"></i>
            {/* Green indicator dot */}
            <span className="absolute top-1 right-1 w-[14px] h-[14px] bg-[var(--state-success-active,#85efac)] rounded-full border-2 border-[var(--base-surface-1,#141414)]"></span>
          </button>

          {/* User avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 group"
              aria-label="User menu"
            >
              <div className="w-10 h-10 rounded-full border border-[var(--base-border,#3d3d3d)] bg-[var(--base-fill-1,#333)] flex items-center justify-center overflow-hidden group-hover:border-[var(--state-brand-active,#36d399)] transition-colors">
                <i className="ri-user-smile-line text-xl text-[var(--text-dark-primary,#f5f5f5)]"></i>
              </div>
              <i className="ri-arrow-down-s-line text-xl text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]"></i>
            </button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--base-surface-2,#231f1f)] border border-[var(--base-border,#3d3d3d)] rounded-[var(--radi-6,12px)] shadow-lg z-20 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-[var(--base-border,#3d3d3d)]">
                    <p className="text-sm font-medium text-[var(--text-dark-primary,#f5f5f5)]">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-md bg-[var(--state-brand-active,#36d399)]/10 text-[var(--state-brand-active,#36d399)] border border-[var(--state-brand-active,#36d399)]/20">
                      {role}
                    </span>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="w-full px-4 py-3 flex items-center gap-3 text-[var(--text-dark-primary,#f5f5f5)] hover:bg-[var(--base-fill-1,#333)] transition-colors disabled:opacity-50"
                  >
                    {logout.isPending ? (
                      <>
                        <i className="ri-loader-4-line text-xl animate-spin"></i>
                        <span className="text-sm">Logging out...</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-logout-box-line text-xl"></i>
                        <span className="text-sm">Logout</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <nav className="md:hidden fixed top-[68px] left-0 right-0 bg-[var(--base-surface-2,#231f1f)] border-b border-[var(--base-border,#3d3d3d)] z-40 shadow-lg">
            <ul className="py-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'block px-6 py-3 text-base font-medium transition-colors',
                        isActive
                          ? 'text-[var(--state-brand-active,#36d399)] bg-[var(--base-fill-1,#333)]'
                          : 'text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] hover:bg-[var(--base-fill-1,#333)]'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}
