import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '@hooks/useAuth';
import { performWebAuthnRegister } from '@lib/virto-sdk';

/**
 * Developer Registration Page
 *
 * Figma design: Clean form with email and name inputs and submit button.
 * Collects email + name, performs WebAuthn registration via Virto SDK,
 * then sends preparedData to the backend API for account creation.
 */
export default function DeveloperRegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setIsRegistering(true);

    try {
      // Step 1: Perform WebAuthn registration (get preparedData from SDK)
      const preparedData = await performWebAuthnRegister(email, name, (progressStatus) => {
        setStatus(progressStatus);
      });

      // Step 2: Send to backend API to create the account
      setStatus('Creating your account...');
      await registerMutation.mutateAsync({
        email,
        name,
        role: 'developer',
        preparedData,
      });

      // Success! Redirect to login
      setStatus('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login/developer');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus('Registration failed');
      console.error('Developer registration error:', errorMessage);
    } finally {
      setIsRegistering(false);
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
          Create Developer Account
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))',
          }}
        >
          Enter your email below to create your account
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
            disabled={isRegistering}
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
        </div>

        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block mb-2"
            style={{
              fontSize: '16px',
              color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))',
            }}
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isRegistering}
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
        </div>

        {error && (
          <div
            className="p-3"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
            }}
          >
            <p style={{ fontSize: '14px', color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isRegistering}
          className="w-full font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            height: '44px',
            fontSize: '16px',
            backgroundColor: 'var(--state-brand-active, #36d399)',
            color: 'var(--text-light-primary, #141414)',
            borderRadius: '12px',
            border: 'none',
            cursor: isRegistering ? 'not-allowed' : 'pointer',
          }}
        >
          {isRegistering ? 'Registering...' : 'Register'}
        </button>

        {status && !error && (
          <p
            className="text-center"
            style={{
              fontSize: '14px',
              color: 'var(--text-dark-secondary, rgba(255,255,255,0.7))',
            }}
          >
            {status}
          </p>
        )}
      </form>

      <div className="mt-8 space-y-4">
        <div className="text-center">
          <Link
            to="/register"
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
            Already have an account?{' '}
          </span>
          <Link
            to="/login/developer"
            className="font-medium hover:underline"
            style={{
              fontSize: '14px',
              color: 'var(--state-brand-active, #36d399)',
            }}
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
