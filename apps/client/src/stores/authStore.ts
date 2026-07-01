import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  role: 'client' | 'reader' | 'admin';
  balance: number;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),

      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        if (!token) return;
        try {
          const res = await fetch('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            set({ profile: data.profile });
          }
        } catch {}
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
      },
    }),
    {
      name: 'soulseer-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Listen to Supabase auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState();
  if (session?.user) {
    store.setUser(session.user);
    store.fetchProfile();
  } else {
    store.setUser(null);
    store.setProfile(null);
  }
});
