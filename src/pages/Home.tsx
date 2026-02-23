import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Wand2, Sparkles, Zap, Trophy } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-6 max-w-3xl">
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span>Next-Gen AI Logo Generation</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 leading-tight"
        >
          Create stunning logos in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            seconds
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl text-zinc-600 max-w-2xl mx-auto"
        >
          Describe your vision and let our advanced AI generate professional,
          unique logos for your brand. Start with 10 free credits.
        </motion.p>
      </div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link to="/dashboard">
          <Button
            size="lg"
            className="gap-2 text-lg px-8 h-14 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            <Wand2 className="w-5 h-5" />
            Start Generating
          </Button>
        </Link>
        <Link to="/leaderboard">
          <Button
            size="lg"
            variant="outline"
            className="gap-2 text-lg px-8 h-14"
          >
            <Trophy className="w-5 h-5" />
            View Leaderboard
          </Button>
        </Link>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-5xl w-full text-left"
      >
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
          <p className="text-zinc-600">
            Generate multiple logo variations in under 10 seconds using
            state-of-the-art AI models.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Refer & Earn</h3>
          <p className="text-zinc-600">
            Invite friends using your unique link. Earn free credits for every
            active user who signs up.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Commercial Rights</h3>
          <p className="text-zinc-600">
            Full ownership and commercial usage rights for all logos generated
            with paid credits.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
