import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, Route, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      // Redirect based on role
      const userEmail = email.toLowerCase();
      if (userEmail === 'driver@demo.com') {
        navigate('/driver');
      } else if (userEmail === 'admin@demo.com') {
        navigate('/admin/users');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <Card className="w-full max-w-md glass-panel">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Package className="h-8 w-8 text-primary" />
          <Route className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome to CargoOpt & Planner</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-left">
          <p className="text-xs font-medium mb-2">Demo accounts:</p>
          <p className="text-xs text-muted-foreground">admin@demo.com / admin123</p>
          <p className="text-xs text-muted-foreground">driver@demo.com / driver123</p>
          <p className="text-xs text-muted-foreground">Or use any email/password</p>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
