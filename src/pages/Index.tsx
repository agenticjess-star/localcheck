import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import AppShell from '@/components/AppShell';

const Index = () => {
  const { session, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gradient-court font-display text-2xl font-bold animate-pulse">CourtCheck</div>
      </div>
    );
  }

  if (session) {
    return <AppShell onLogout={signOut} />;
  }

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  return (
    <LandingPage
      onEnter={() => setShowAuth(true)}
      onSignIn={() => setShowAuth(true)}
    />
  );
};

export default Index;
