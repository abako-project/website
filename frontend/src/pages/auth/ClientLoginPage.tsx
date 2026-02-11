import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useLogin } from '@hooks/useAuth';
import { performWebAuthnLogin } from '@lib/virto-sdk';

/**
 * Client Login Page
 *
 * Handles authentication for clients (companies/organizations) using
 * the Virto Network WebAuthn flow.
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Client Login</CardTitle>
            <CardDescription>Enter your email to authenticate with WebAuthn</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                name="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isAuthenticating}
                error={error}
              />

              <Button type="submit" className="w-full" isLoading={isAuthenticating} disabled={isAuthenticating}>
                {isAuthenticating ? 'Authenticating...' : 'Login'}
              </Button>

              {status && (
                <p
                  className={`text-center text-sm ${
                    status.includes('failed') || status.includes('error') ? 'text-destructive' : 'text-muted-foreground'
                  }`}
                >
                  {status}
                </p>
              )}
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="text-center text-sm">
                <Link to="/login" className="text-muted-foreground hover:text-primary">
                  Back to role selection
                </Link>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/register/client" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
