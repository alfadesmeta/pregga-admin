import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./components/auth";
import { PreggaAdminDashboard } from "./PreggaAdminDashboard";
import { supabase } from "./lib/supabase";
import { disconnectStreamClient } from "./lib/streamChat";
import { friendlyError } from "./lib/errors";
import { PreggaColors } from "./theme/colors";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "./types/database";

const toasterConfig = {
  position: "bottom-right" as const,
  toastOptions: {
    duration: 3000,
    style: {
      background: "#1a2e1a",
      color: "#fff",
      fontSize: 14,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      borderRadius: 10,
      padding: "12px 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    },
    success: { iconTheme: { primary: PreggaColors.sage500, secondary: "#fff" } },
    error: { iconTheme: { primary: "#E55B50", secondary: "#fff" } },
  },
};

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (!session?.user) {
          setAuthState({ user: null, profile: null, isLoading: false });
          return;
        }
        
        const profile = await fetchProfile(session.user.id);
        
        if (!mounted) return;
        
        if (profile?.user_role === 'admin') {
          setAuthState({ user: session.user, profile, isLoading: false });
        } else {
          await supabase.auth.signOut();
          setAuthState({ user: null, profile: null, isLoading: false });
        }
      } catch (err) {
        console.error('Session check error:', err);
        if (mounted) setAuthState({ user: null, profile: null, isLoading: false });
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string) => {
        if (event === 'SIGNED_OUT') {
          if (mounted) setAuthState({ user: null, profile: null, isLoading: false });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  }

  async function handleLogin(email: string, password: string): Promise<{ error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return { error: friendlyError(error) };
      if (!data.user) return { error: 'Authentication failed. Please try again.' };

      const profile = await fetchProfile(data.user.id);

      if (!profile || profile.user_role !== 'admin') {
        await supabase.auth.signOut();
        return { error: 'Admin access required. Please contact your administrator.' };
      }

      setAuthState({ user: data.user, profile, isLoading: false });
      return {};
    } catch (error) {
      return { error: friendlyError(error) };
    }
  }

  async function handleSignOut() {
    await disconnectStreamClient();
    await supabase.auth.signOut();
    setAuthState({ user: null, profile: null, isLoading: false });
    window.location.hash = "";
  }

  if (authState.isLoading) {
    return (
      <div style={{ height: "100%", width: "100%", background: "#F8F6F3" }}>
        <Toaster {...toasterConfig} />
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #E8DFD2",
              borderTopColor: "#6B7B5F",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      </div>
    );
  }

  if (!authState.user || !authState.profile) {
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <Toaster {...toasterConfig} />
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Toaster {...toasterConfig} />
      <PreggaAdminDashboard 
        onSignOut={handleSignOut} 
        user={authState.user}
        profile={authState.profile}
      />
    </div>
  );
}

export default App;
