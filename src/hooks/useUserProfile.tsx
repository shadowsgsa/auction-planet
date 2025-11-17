import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  user_type: 'buyer' | 'seller' | 'both';
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const canBuy = () => {
    return profile?.user_type === 'buyer' || profile?.user_type === 'both';
  };

  const canSell = () => {
    return profile?.user_type === 'seller' || profile?.user_type === 'both';
  };

  const canViewAuctions = () => {
    // Buyers cannot see auction pages, only sellers and both can
    return profile?.user_type === 'seller' || profile?.user_type === 'both';
  };

  return {
    profile,
    loading,
    canBuy,
    canSell,
    canViewAuctions,
    refetch: fetchProfile
  };
};