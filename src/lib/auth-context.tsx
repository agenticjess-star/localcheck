import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, profiles, type Profile } from '@/lib/db';
import type { Session } from '@supabase/supabase-js';

interface AuthCtx {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const getFallbackName = (sessionValue: Session | null) => {
    const metaName = sessionValue?.user?.user_metadata?.name;
    if (typeof metaName === 'string' && metaName.trim().length > 0) return metaName.trim();

    const emailName = sessionValue?.user?.email?.split('@')[0];
    if (emailName && emailName.trim().length > 0) return emailName;

    return 'Player';
  };

  const loadProfile = async (userId: string, fallbackName: string) => {
    try {
      let p = await profiles.get(userId);
      if (!p) {
        p = await profiles.ensure(userId, fallbackName);
      }
      setProfile(p);
    } catch (e) {
      console.error('Failed to load profile:', e);
      setProfile(null);
    }
  };

  useEffect(() => {
    const loadingTimeout = window.setTimeout(() => {
      setLoading((current) => {
        if (current) {
          console.warn('Auth bootstrap timed out; continuing without blocking UI.');
          return false;
        }
        return current;
      });
    }, 6000);

    // Get initial session first
    auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user.id, getFallbackName(s)).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch((e) => {
      console.error('Failed to get session:', e);
      setLoading(false);
    });

    // Then listen for changes
    const sub = auth.onAuthStateChange(async (s) => {
      setSession(s);
      if (s?.user) {
        await loadProfile(s.user.id, getFallbackName(s));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      window.clearTimeout(loadingTimeout);
      sub.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user.id, getFallbackName(session));
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setProfile(null);
      setSession(null);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut: handleSignOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
