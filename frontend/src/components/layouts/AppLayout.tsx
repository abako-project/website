import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@stores/authStore';

/**
 * AppLayout - Main authenticated layout wrapper matching Figma design
 *
 * This layout supports two patterns based on Figma screens:
 *
 * 1. CLIENT LAYOUT (Projects List screen 117:9363):
 *    - Navbar at top only
 *    - No sidebar
 *    - Full-width content
 *
 * 2. DEVELOPER LAYOUT (Team Definition screen 1039:10096):
 *    - Sidebar on left
 *    - Content on right
 *    - Optional header/navbar at top (based on design)
 *
 * For now, we implement a unified layout that shows:
 * - Navbar at top for all users (Header component)
 * - Sidebar on left for developers only
 * - Main content area that renders child routes via Outlet
 *
 * The layout uses Figma design tokens for all colors and spacing:
 * - Background: var(--base-surface-1,#141414)
 * - Surface: var(--base-surface-2,#231f1f)
 * - Border: var(--base-border,#3d3d3d)
 */
export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const isDeveloper = !!user?.developerId;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--base-surface-1,#141414)]">
      {/* Top Navbar - Always visible */}
      <Header />

      {/* Main content area with optional sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Only for developers (can be toggled based on route/design) */}
        {isDeveloper && <Sidebar />}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[var(--base-surface-1,#141414)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
