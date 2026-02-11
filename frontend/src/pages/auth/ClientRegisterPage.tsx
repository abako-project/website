import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useRegister } from '@hooks/useAuth';
import { performWebAuthnRegister } from '@lib/virto-sdk';

/**
 * Client Registration Page
 *
 * Mirrors backend/views/clients/register.ejs
 * Collects email + name, performs WebAuthn registration via Virto SDK,
 * then sends preparedData to the backend API for account creation.
 */
export default function ClientRegisterPage() {
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
        role: 'client',
        preparedData,
      });

      // Success! Redirect to login
      setStatus('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login/client');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus('Registration failed');
      console.error('Client registration error:', errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create Client Account</CardTitle>
            <CardDescription>Enter your email below to create your account</CardDescription>
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
                disabled={isRegistering}
              />

              <Input
                type="text"
                label="Username"
                name="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isRegistering}
              />

              {error && (
                <div className="rounded-md bg-red-500/15 border border-red-500/30 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={isRegistering} disabled={isRegistering}>
                {isRegistering ? 'Registering...' : 'Register'}
              </Button>

              {status && !error && (
                <p className="text-center text-sm text-muted-foreground">
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
                <Link to="/register" className="text-muted-foreground hover:text-primary">
                  Back to role selection
                </Link>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login/client" className="font-medium text-primary hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
