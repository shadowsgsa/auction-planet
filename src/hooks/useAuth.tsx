import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import WelcomeDialog from '@/components/WelcomeDialog';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const cleanupAuthState = () => {
  console.log('Cleaning up auth state...');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    console.log('Setting up auth state listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user && event === 'SIGNED_IN') {
          setIsNewUser(justSignedUp);
          setShowWelcome(true);
          setJustSignedUp(false);
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('Signing up:', email);
    cleanupAuthState();
    setJustSignedUp(true);

    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Signing in:', email);
    cleanupAuthState();

    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.log('Sign out before sign in failed (expected):', err);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign in error:', error);
      return { error };
    }

    console.log('Sign in successful:', data.user?.email);
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    try {
      setUser(null);
      setSession(null);
      setLoading(true);
      cleanupAuthState();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) console.error('Sign out error:', error);
      setLoading(false);
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      cleanupAuthState();
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signInWithGoogle, signOut, loading }}>
      {children}
      <WelcomeDialog
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        isNewUser={isNewUser}
        userName={user?.user_metadata?.display_name || user?.email?.split('@')[0]}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
