import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useAuth } from "../store/useAuth";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setDemoMode } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) toast.error(error.message);
  };

  const handleDemoLogin = () => {
    setDemoMode();
    toast.success("Welcome to the Loguvo Demo!");
    navigate("/dashboard");
  };

  return (
    <motion.div
      className="max-w-md mx-auto mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-xl shadow-zinc-200/50 border-zinc-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t("common.login")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-50"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
              disabled={loading}
            >
              {loading ? "..." : t("common.login")}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-4">
            <div className="h-px bg-zinc-200 flex-1"></div>
            <span className="text-sm text-zinc-500">or</span>
            <div className="h-px bg-zinc-200 flex-1"></div>
          </div>

          <div className="space-y-3 mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              {t("auth.continue_with_google")}
            </Button>
            
            <Button
              variant="secondary"
              className="w-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none"
              onClick={handleDemoLogin}
            >
              Try Demo Mode
            </Button>
          </div>

          <p className="text-center mt-6 text-sm text-zinc-600">
            {t("auth.no_account")}{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:underline font-medium"
            >
              {t("common.signup")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
