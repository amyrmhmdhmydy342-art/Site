import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const refCode = searchParams.get("ref");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    // 2. Handle referral if present
    if (refCode && authData.user) {
      try {
        // Find referrer by code
        const { data: referrer } = await supabase
          .from("users")
          .select("id")
          .eq("referral_code", refCode)
          .single();

        if (referrer) {
          // Update new user with referred_by
          await supabase
            .from("users")
            .update({ referred_by: referrer.id })
            .eq("id", authData.user.id);

          // Create pending referral record
          await supabase.from("referrals").insert({
            referrer_id: referrer.id,
            referred_id: authData.user.id,
            valid: false, // Will become true after first generation
          });
        }
      } catch (err) {
        console.error("Referral processing error:", err);
      }
    }

    toast.success("Signed up successfully! Please check your email.");
    navigate("/dashboard");
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: refCode ? { ref: refCode } : undefined,
      },
    });
    if (error) toast.error(error.message);
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
            {t("common.signup")}
          </CardTitle>
          {refCode && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-emerald-700 text-center mt-2 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-100 font-medium"
            >
              🎉 You were invited! Sign up to get your free credits.
            </motion.p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
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
                minLength={6}
                className="bg-zinc-50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
              disabled={loading}
            >
              {loading ? "..." : t("common.signup")}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-4">
            <div className="h-px bg-zinc-200 flex-1"></div>
            <span className="text-sm text-zinc-500">or</span>
            <div className="h-px bg-zinc-200 flex-1"></div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleGoogleSignup}
          >
            {t("auth.continue_with_google")}
          </Button>

          <p className="text-center mt-6 text-sm text-zinc-600">
            {t("auth.have_account")}{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:underline font-medium"
            >
              {t("common.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
