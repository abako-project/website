# UI Components Reference

This directory contains reusable UI components following shadcn/ui patterns.

## Quick Import

```typescript
import { Button, Input, Card, CardHeader, CardContent, Label, Spinner } from '@components/ui';
```

## Components

### Button

Versatile button with variants and loading states.

```typescript
import { Button } from '@components/ui/Button';

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button isLoading>Submitting...</Button>

// Disabled
<Button disabled>Disabled</Button>
```

### Input

Form input with label, error, and helper text support.

```typescript
import { Input } from '@components/ui/Input';

// Basic usage
<Input
  name="email"
  type="email"
  placeholder="Enter your email"
/>

// With label
<Input
  name="email"
  label="Email Address"
  type="email"
/>

// With error
<Input
  name="email"
  label="Email Address"
  error="Invalid email address"
/>

// With helper text
<Input
  name="username"
  label="Username"
  helperText="Choose a unique username"
/>

// In a form
const [email, setEmail] = useState('');
<Input
  name="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>
```

### Card

Container components for content organization.

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Label

Form label component.

```typescript
import { Label } from '@components/ui/Label';

<div>
  <Label htmlFor="email">Email Address</Label>
  <input id="email" type="email" />
</div>
```

### Spinner

Loading spinner with size variants.

```typescript
import { Spinner } from '@components/ui/Spinner';

// Sizes
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// Custom styling
<Spinner className="text-blue-500" />

// In a button
<button disabled>
  <Spinner size="sm" className="mr-2" />
  Loading...
</button>
```

## Styling

All components use Tailwind CSS with the design system CSS variables from `index.css`:

- `bg-primary` / `text-primary-foreground`
- `bg-secondary` / `text-secondary-foreground`
- `bg-destructive` / `text-destructive-foreground`
- `bg-muted` / `text-muted-foreground`
- `bg-accent` / `text-accent-foreground`
- `border-border`
- `border-input`

## Customization

All components accept a `className` prop for custom styling:

```typescript
<Button className="w-full mt-4">Full Width Button</Button>
<Input className="max-w-md" />
<Card className="shadow-lg hover:shadow-xl transition-shadow" />
```

Use the `cn()` utility to merge classes safely:

```typescript
import { cn } from '@lib/cn';

<Button className={cn('w-full', isError && 'border-red-500')}>
  Submit
</Button>
```

## Accessibility

All components are built with accessibility in mind:

- Semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation support
- Focus visible styles
- Screen reader friendly

## TypeScript

All components have full TypeScript support with exported types:

```typescript
import type { ButtonProps, InputProps, SpinnerProps } from '@components/ui';
```

## Examples

### Login Form

```typescript
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@components/ui';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full mt-4"
            isLoading={isLoading}
          >
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Dashboard Card

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui';

function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
```

### Loading State

```typescript
import { Spinner } from '@components/ui';

function DataView({ isLoading, data }: DataViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return <div>{/* render data */}</div>;
}
```
