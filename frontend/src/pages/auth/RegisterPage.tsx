import { Link } from 'react-router-dom';

/**
 * Registration Role Selection Page
 *
 * Figma design: Role selector with two styled cards for Developer and Client.
 * Allows users to choose whether to register as a Developer or Client.
 */
export default function RegisterPage() {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1
          className="font-bold mb-2"
          style={{
            fontSize: '30px',
            lineHeight: '1.2',
            color: 'var(--text-dark-primary, #f5f5f5)',
          }}
        >
          What kind of account do you want to create?
        </h1>
      </div>

      <div className="space-y-4">
        {/* Developer Card */}
        <Link to="/register/developer" className="block">
          <div
            className="p-6 transition-all hover:opacity-90 cursor-pointer"
            style={{
              backgroundColor: 'var(--base-surface-2, #231f1f)',
              border: '1px solid var(--base-border, #3d3d3d)',
              borderRadius: '12px',
            }}
          >
            <h2
              className="font-semibold mb-2"
              style={{
                fontSize: '20px',
                color: 'var(--text-dark-primary, #f5f5f5)',
              }}
            >
              Developer
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))',
              }}
            >
              I'm looking to work in Web3 projects
            </p>
          </div>
        </Link>

        {/* Client Card */}
        <Link to="/register/client" className="block">
          <div
            className="p-6 transition-all hover:opacity-90 cursor-pointer"
            style={{
              backgroundColor: 'var(--base-surface-2, #231f1f)',
              border: '1px solid var(--base-border, #3d3d3d)',
              borderRadius: '12px',
            }}
          >
            <h2
              className="font-semibold mb-2"
              style={{
                fontSize: '20px',
                color: 'var(--text-dark-primary, #f5f5f5)',
              }}
            >
              Client
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))',
              }}
            >
              I'm looking for Web3 development talent. I need an integral Web3 solution - consultants, project leads, and developers.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <p style={{ fontSize: '14px', color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: 'var(--state-brand-active, #36d399)' }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
