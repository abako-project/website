import { Outlet } from 'react-router-dom';

/**
 * AuthLayout - Layout for authentication pages (login, register)
 *
 * Provides a centered, minimal layout for auth flows.
 * Matches the onboarding layout structure from pages/_onboarding.sass
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand/visual */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-[#231F1F] p-8 flex-col justify-between relative"
        style={{
          backgroundImage: "url('/images/polkatalent_onboardingBg.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {/* Logo at top */}
        <div className="h-8 flex items-center">
          <span className="text-[#F5F5F5] font-bold text-2xl">Work3Spaces</span>
        </div>

        {/* Centered brand content */}
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#F5F5F5] mb-4">
              Welcome to Abako
            </h1>
            <p className="text-lg text-[#9B9B9B] max-w-md">
              Connect with developers and clients in the Web3 ecosystem
            </p>
          </div>
        </div>

        {/* Message at bottom */}
        <div className="max-w-lg">
          <p className="text-[#9B9B9B]">
            Powered by Polkadot and the Virto Network
          </p>
        </div>
      </div>

      {/* Right side - Auth content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#141414]">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
