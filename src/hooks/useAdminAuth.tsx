import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session and set up listener
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        
        console.log('Admin auth initial session:', { currentUser: currentUser?.email });
        
        if (mounted) {
          setUser(currentUser);
          
          if (currentUser) {
            await checkAdminStatus(currentUser.id);
          } else {
            setIsAdmin(false);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Admin auth state change:', event, session?.user?.email);
        
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await checkAdminStatus(currentUser.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);
      
      // Use the database function to check admin status
      const { data, error } = await supabase
        .rpc('is_admin', { user_id: userId });

      console.log('Admin check result:', { data, error });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        const adminStatus = Boolean(data);
        console.log('User admin status:', adminStatus);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAdmin,
    loading,
    checkAdminStatus: () => user ? checkAdminStatus(user.id) : Promise.resolve()
  };
};