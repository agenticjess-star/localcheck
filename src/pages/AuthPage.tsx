import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage({ onBack }: { onBack?: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          toast.error('Name is required');
          setLoading(false);
          return;
        }
        await auth.signUp(email, password, name.trim());
        toast.success('Welcome to CourtCheck! 🏀');
      } else {
        await auth.signIn(email, password);
        toast.success('Welcome back!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">
            <span className="text-gradient-court">Court</span>Check
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === 'login' ? 'Sign in to your court' : 'Join your court'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="What do they call you?"
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6+ characters"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-court text-primary-foreground hover:opacity-90 shadow-glow h-11"
          >
            {loading ? 'Hold on...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
