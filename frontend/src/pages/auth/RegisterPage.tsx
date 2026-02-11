import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';

/**
 * Registration Role Selection Page
 *
 * Mirrors backend/views/areas/register.ejs
 * Allows users to choose whether to register as a Developer or Client.
 */
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            What kind of account do you want to create?
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Developer Card */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>Developer</CardTitle>
              <CardDescription>
                I'm looking to work in Web3 projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/register/developer">
                <Button className="w-full" size="lg">
                  Sign up
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Client Card */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>Company/Organization</CardTitle>
              <CardDescription>
                I'm looking for Web3 development talent. I need an integral Web3
                solution - consultants, project leads, and developers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/register/client">
                <Button className="w-full" size="lg">
                  Sign up
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
