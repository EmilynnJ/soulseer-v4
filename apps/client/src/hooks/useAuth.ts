import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { apiClient } from '../lib/api';

interface InternalUser {
  id: number;
  supabaseId: string;
  email: string;
  role: 'client' | 'reader' | 'admin';
  username: string;
  fullName: string;
  accountBalance: number;
  profileImage?: string;
}

interface AuthState {
  supabaseUser: User | null;
  user: InternalUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<InternalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInternalUser = async () => {
    try {
      const data = await apiClient.get<{ user: InternalUser }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) fetchInternalUser();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        await fetchInternalUser();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  const refreshUser = async () => {
    await fetchInternalUser();
  };

  return { supabaseUser, user, session, loading, signIn, signInWithGoogle, signInWithApple, signOut, refreshUser };
}
