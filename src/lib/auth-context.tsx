import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, profiles, type Profile } from '@/lib/db';
import type { Session } from '@supabase/supabase-js';

interface AuthCtx {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen first, then get session
    const sub = auth.onAuthStateChange(async (s) => {
      setSession(s);
      if (s?.user) {
        try {
          const p = await profiles.get(s.user.id);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        profiles.get(s.user.id).then(p => setProfile(p)).catch(() => {});
      }
      setLoading(false);
    });

    return () => sub.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut: auth.signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
