import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '@hooks/useAuth';
import { performWebAuthnLogin } from '@lib/virto-sdk';

/**
 * Client Login Page
 *
 * Figma design: Clean form with email input and submit button.
 * Handles authentication for clients using the Virto Network WebAuthn flow.
 */
export default function ClientLoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setIsAuthenticating(true);

    try {
      // Perform WebAuthn authentication flow
      const token = await performWebAuthnLogin(email, (progressStatus) => {
        setStatus(progressStatus);
      });

      // Call the backend login API
      setStatus('Verifying credentials...');
      await loginMutation.mutateAsync({
        email,
        token,
        role: 'client',
      });

      // Success! Redirect to dashboard
      setStatus('Login successful');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus('Login failed');
      console.error('Client login error:', errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1
          className="font-bold mb-2"
          style={{
            fontSize: '24px',
            color: 'var(--text-dark-primary, #f5f5f5)',
          }}
        >
          Client Login
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))',
          }}
        >
          Enter your email to authenticate with WebAuthn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block mb-2"
            style={{
              fontSize: '16px',
              color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))',
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isAuthenticating}
            className="w-full font-medium"
            style={{
              height: '44px',
              padding: '0 16px',
              fontSize: '16px',
              backgroundColor: 'var(--base-surface-1, #141414)',
              border: '1px solid var(--base-border, #3d3d3d)',
              borderRadius: '12px',
              color: 'var(--text-dark-primary, #f5f5f5)',
              outline: 'none',
            }}
          />
          {error && (
            <p
              className="mt-2"
              style={{
                fontSize: '14px',
                color: '#ef4444',
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isAuthenticating}
          className="w-full font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            height: '44px',
            fontSize: '16px',
            backgroundColor: 'var(--state-brand-active, #36d399)',
            color: 'var(--text-light-primary, #141414)',
            borderRadius: '12px',
            border: 'none',
            cursor: isAuthenticating ? 'not-allowed' : 'pointer',
          }}
        >
          {isAuthenticating ? 'Authenticating...' : 'Login'}
        </button>

        {status && (
          <p
            className="text-center"
            style={{
              fontSize: '14px',
              color:
                status.includes('failed') || status.includes('error')
                  ? '#ef4444'
                  : 'var(--text-dark-secondary, rgba(255,255,255,0.7))',
            }}
          >
            {status}
          </p>
        )}
      </form>

      <div className="mt-8 space-y-4">
        <div className="text-center">
          <Link
            to="/login"
            className="hover:underline"
            style={{
              fontSize: '14px',
              color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))',
            }}
          >
            Back to role selection
          </Link>
        </div>

        <div className="text-center">
          <span style={{ fontSize: '14px', color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))' }}>
            Don't have an account?{' '}
          </span>
          <Link
            to="/register/client"
            className="font-medium hover:underline"
            style={{
              fontSize: '14px',
              color: 'var(--state-brand-active, #36d399)',
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
