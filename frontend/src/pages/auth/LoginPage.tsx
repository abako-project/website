import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';

/**
 * Role Selection Page
 *
 * This page allows users to choose whether they want to log in
 * as a Client (Company/Organization) or as a Developer.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to Abako</h1>
          <p className="mt-2 text-muted-foreground">Select your account type to continue</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Client Card */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>Company/Organization</CardTitle>
              <CardDescription>Login as a client to manage your projects and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login/client">
                <Button className="w-full" size="lg">
                  Login as Client
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Developer Card */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>Developer</CardTitle>
              <CardDescription>Login as a developer to work on assigned tasks and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login/developer">
                <Button className="w-full" size="lg">
                  Login as Developer
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
