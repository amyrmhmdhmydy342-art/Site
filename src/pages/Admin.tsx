import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Users,
  Image as ImageIcon,
  CreditCard,
  ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";

export default function Admin() {
  const [stats, setStats] = useState({
    users: 0,
    logos: 0,
    revenue: 0,
    suspiciousReferrals: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // In a real app, these would be aggregated queries or RPC calls
    const [{ count: usersCount }, { count: logosCount }] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("logos").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      users: usersCount || 0,
      logos: logosCount || 0,
      revenue: 0, // Placeholder
      suspiciousReferrals: 0, // Placeholder
    });
  };

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
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-zinc-500">Overview and management</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="shadow-sm border-zinc-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Logos Generated
              </p>
              <p className="text-2xl font-bold">{stats.logos}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Revenue</p>
              <p className="text-2xl font-bold">${stats.revenue}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Suspicious Referrals
              </p>
              <p className="text-2xl font-bold">{stats.suspiciousReferrals}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-500">
              Audit logs and recent generations will appear here.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
