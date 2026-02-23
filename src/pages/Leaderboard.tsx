import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion } from "motion/react";

export default function Leaderboard() {
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    // In a real app, this would query the leaderboard_entries table
    // For now, we'll simulate it or query users directly if we had data
    const { data } = await supabase
      .from("users")
      .select("id, email, credits")
      .order("credits", { ascending: false })
      .limit(10);

    if (data) setLeaders(data);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-zinc-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="font-bold text-zinc-400 w-6 text-center">
            {index + 1}
          </span>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
        >
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 drop-shadow-md" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight">
          {t("leaderboard.title")}
        </h1>
        <p className="text-xl text-zinc-600">Top referrers this month</p>
      </div>

      <Card className="overflow-hidden shadow-xl shadow-zinc-200/50 border-zinc-200">
        <div className="bg-indigo-600 text-white p-4 text-center text-sm font-medium shadow-inner">
          Current TOP 1 has {leaders[0]?.credits || 0} credits — climb now to
          win unlimited generations!
        </div>
        <CardContent className="p-0">
          <motion.div
            className="divide-y divide-zinc-100"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {leaders.map((leader, index) => (
              <motion.div
                variants={itemVariants}
                key={leader.id}
                className={`flex items-center justify-between p-6 transition-colors ${index === 0 ? "bg-yellow-50/30 hover:bg-yellow-50/50" : "hover:bg-zinc-50"}`}
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {leader.email.split("@")[0]}***
                    </p>
                    <p className="text-sm text-zinc-500">
                      {index < 3
                        ? "Logo Legend Badge"
                        : index < 7
                          ? "Pro Discount"
                          : "Special Badge"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">
                    {leader.credits}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    Score
                  </p>
                </div>
              </motion.div>
            ))}
            {leaders.length === 0 && (
              <div className="p-12 text-center text-zinc-500">
                No leaders yet. Be the first!
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
