import { useState } from 'react';
import LandingPage from './LandingPage';
import AppShell from '@/components/AppShell';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LandingPage onEnter={() => setIsLoggedIn(true)} />;
  }

  return <AppShell onLogout={() => setIsLoggedIn(false)} />;
};

export default Index;
