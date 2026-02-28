import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import AppShell from '@/components/AppShell';

const Index = () => {
  const { session, profile, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gradient-court font-display text-2xl font-bold animate-pulse">CourtCheck</div>
      </div>
    );
  }

  // Logged in with real account
  if (session) {
    return <AppShell onLogout={signOut} />;
  }

  // Demo mode (uses mock data, no auth)
  if (demoMode) {
    return <AppShell onLogout={() => setDemoMode(false)} />;
  }

  // Auth page
  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  // Landing
  return (
    <LandingPage
      onEnter={() => setDemoMode(true)}
      onSignIn={() => setShowAuth(true)}
    />
  );
};

export default Index;
