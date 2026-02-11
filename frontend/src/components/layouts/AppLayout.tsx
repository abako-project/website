import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * AppLayout - Main authenticated layout wrapper
 *
 * This layout wraps all authenticated routes and provides:
 * - Sidebar navigation on the left
 * - Header bar at the top
 * - Main content area that renders child routes via Outlet
 *
 * The layout uses a two-column grid similar to the EJS #appTwoColumns structure.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#141414]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
