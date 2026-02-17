import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * AppLayout - Main authenticated layout wrapper
 *
 * Unified layout for all authenticated users:
 * - Top navbar (Header)
 * - Sidebar on the left with navigation links
 * - Main content area rendering child routes via Outlet
 */
export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--base-surface-1,#141414)]">
      {/* Top Navbar - Always visible */}
      <Header />

      {/* Main content area with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Always visible for authenticated users */}
        <Sidebar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[var(--base-surface-1,#141414)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
