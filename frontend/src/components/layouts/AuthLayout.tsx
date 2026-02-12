import { Outlet } from 'react-router-dom';

/**
 * AuthLayout - Layout for authentication pages (login, register)
 *
 * Figma design: Split screen layout with brand content on left, auth form on right.
 * Uses CSS custom properties matching Figma design tokens.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Left side - Brand/visual (hidden on mobile, visible lg+) */}
      <div
        className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-between relative"
        style={{
          backgroundColor: 'var(--base-surface-2, #231f1f)',
          backgroundImage: "url('/images/polkatalent_onboardingBg.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Logo at top */}
        <div className="h-8 flex items-center">
          <span style={{ color: 'var(--text-dark-primary, #f5f5f5)' }} className="font-bold text-2xl">
            PolkaTalent
          </span>
        </div>

        {/* Centered brand content */}
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--text-dark-primary, #f5f5f5)' }}
            >
              Welcome to PolkaTalent
            </h1>
            <p
              className="text-lg max-w-md"
              style={{ color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))' }}
            >
              Connect with developers and clients in the Web3 ecosystem
            </p>
          </div>
        </div>

        {/* Message at bottom */}
        <div className="max-w-lg">
          <p style={{ color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))' }}>
            Powered by Polkadot and the Virto Network
          </p>
        </div>
      </div>

      {/* Right side - Auth content */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ backgroundColor: 'var(--base-surface-1, #141414)' }}
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
