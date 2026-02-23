import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../store/useAuth";
import { supabase } from "../lib/supabase";
import LogoCanvas from "../components/LogoCanvas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Copy, Trophy, History, Coins } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [logos, setLogos] = useState<any[]>([]);
  const [stats, setStats] = useState({ validReferrals: 0, creditsEarned: 0 });

  useEffect(() => {
    if (user) {
      fetchLogos();
      fetchReferralStats();
    }
  }, [user]);

  const fetchLogos = async () => {
    const { data } = await supabase
      .from("logos")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(12);
    if (data) setLogos(data);
  };

  const fetchReferralStats = async () => {
    // In a real app, this would be a custom RPC or aggregated query
    const { count } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", user?.id)
      .eq("valid", true);

    setStats((prev) => ({ ...prev, validReferrals: count || 0 }));
  };

  const copyReferralLink = () => {
    if (!profile?.referral_code) return;
    const link = `${window.location.origin}/signup?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success(t("dashboard.copied"));
  };

  if (!user || !profile) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("dashboard.welcome")}
          </h1>
          <p className="text-zinc-500">{user.email}</p>
        </div>
        <div className="flex gap-4">
          <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-indigo-100 text-sm font-medium">
                  {t("dashboard.available_credits")}
                </p>
                <p className="text-2xl font-bold">{profile.credits}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <LogoCanvas />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="md:col-span-2 shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              {t("common.history")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {logos.map((logo) => (
                  <div
                    key={logo.id}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200"
                  >
                    <img
                      src={logo.image_url}
                      alt={logo.prompt}
                      className="w-full h-full object-contain p-2"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end backdrop-blur-[2px]">
                      <p className="text-white text-xs line-clamp-2 font-medium">
                        {logo.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-500 text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <History className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No logos generated yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {t("dashboard.referral_stats")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-2">
                {t("dashboard.referral_link")}
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/signup?ref=${profile.referral_code || ""}`}
                  className="bg-zinc-50 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyReferralLink}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
              <div>
                <p className="text-sm text-zinc-500">
                  {t("dashboard.total_valid")}
                </p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats.validReferrals}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">
                  {t("dashboard.credits_earned")}
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  +{stats.validReferrals * 5}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
