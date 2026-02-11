import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { useState } from 'react';

/**
 * Sidebar - Main navigation sidebar
 *
 * Displays navigation links based on user role:
 * - Client: Dashboard, My Projects, Profile
 * - Developer: Dashboard, Projects, Profile
 *
 * Matches the styling from components/_mainSidebar.sass
 */
export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  const isClient = !!user?.clientId;
  const isDeveloper = !!user?.developerId;

  const navLinks = isClient
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
        { to: '/projects', label: 'My Projects', icon: 'ri-folder-line' },
        { to: '/payments', label: 'Payments', icon: 'ri-money-dollar-circle-line' },
        { to: '/profile', label: 'Profile', icon: 'ri-user-line' },
      ]
    : isDeveloper
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
        { to: '/projects', label: 'Projects', icon: 'ri-folder-line' },
        { to: '/payments', label: 'Payments', icon: 'ri-money-dollar-circle-line' },
        { to: '/profile', label: 'Profile', icon: 'ri-user-line' },
      ]
    : [];

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#231F1F] border border-[#3D3D3D] text-[#F5F5F5]"
        aria-label="Toggle menu"
      >
        <i className={isOpen ? 'ri-close-line text-xl' : 'ri-menu-line text-xl'}></i>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-[200px] min-w-[200px]
          p-4 flex flex-col gap-4
          bg-[#231F1F] border-r border-[#3D3D3D]
          transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between">
          <div className="h-8 flex items-center gap-2">
            <span className="text-[#F5F5F5] font-bold text-lg">W3S</span>
          </div>
          {/* Notification dot placeholder */}
          <div className="relative">
            <i className="ri-notification-line text-[#F5F5F5] text-xl"></i>
            {/* Uncomment when notifications are implemented
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#36D399] rounded-full border-2 border-[#141414]"></span>
            */}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-[#333333] text-[#36D399]'
                        : 'text-[#F5F5F5] hover:bg-[#333333]'
                    }`
                  }
                >
                  <i className={`${link.icon} text-xl`}></i>
                  <span className="font-medium">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-[#3D3D3D] pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#3D3D3D] flex items-center justify-center">
                <i className="ri-user-line text-[#F5F5F5]"></i>
              </div>
              {/* Online status dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#36D399] rounded-full border-2 border-[#231F1F]"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F5F5F5] truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-[#9B9B9B] truncate">
                {isClient ? 'Client' : isDeveloper ? 'Developer' : 'User'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
