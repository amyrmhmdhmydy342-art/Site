import { useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../store/useAuth";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { LogOut, LayoutDashboard, Settings, Wand2, Globe } from "lucide-react";

export default function Layout() {
  const { t, i18n } = useTranslation();
  const { user, profile, setUser, setProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "fa" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "fa" ? "rtl" : "ltr";
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-zinc-50/20 to-zinc-50 pointer-events-none" />

      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm shadow-indigo-200">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600">
              AI Logo Studio
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              title="Toggle Language"
            >
              <Globe className="w-5 h-5" />
            </Button>

            {user ? (
              <>
                <div className="hidden md:flex items-center gap-4 text-sm font-medium text-zinc-600 mr-4">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                    {profile?.credits ?? 0} {t("common.credits")}
                  </span>
                </div>
                <Link to="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t("common.dashboard")}
                    </span>
                  </Button>
                </Link>
                {profile?.role === "admin" && (
                  <Link to="/admin">
                    <Button variant="ghost" className="gap-2">
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {t("common.admin")}
                      </span>
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("common.logout")}</span>
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button>{t("common.login")}</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
