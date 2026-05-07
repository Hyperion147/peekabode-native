import { supabase } from '@/lib/supabase';
import type { AppUser } from '@/lib/types';
import { useEffect, useState } from 'react';

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        setProfile(data);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase.from('users').select('*').eq('id', u.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
}

export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (fullName: string, email: string, password: string, role = 'USER') => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });
      if (signUpError) throw signUpError;
      if (data.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          full_name: fullName,
          email,
          role,
        });
        if (insertError) throw insertError;
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signUp, loading, error };
}

export function useSignOut() {
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  return { signOut };
}
