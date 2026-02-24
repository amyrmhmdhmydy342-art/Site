import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../store/useAuth";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Wand2, Download, Share2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function LogoCanvas() {
  const { t } = useTranslation();
  const { user, profile, setProfile } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!user || !profile) {
      toast.error("Please login to generate logos");
      return;
    }

    if (profile.credits < 1) {
      toast.error("Not enough credits. Please buy more or refer friends!");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedLogo(null);

    try {
      // 1. Deduct credit optimistically
      const newCredits = profile.credits - 1;
      setProfile({ ...profile, credits: newCredits });

      // 2. Call AI API (Placeholder - using dicebear shapes for cool vector logos)
      await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate AI generation delay

      const seed = encodeURIComponent(prompt + Math.random().toString());
      const fakeLogoUrl = `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}&backgroundColor=0a0a0a,1a1a1a,ffffff&shape1Color=0a0a0a,1a1a1a,ffffff,4f46e5,06b6d4,f43f5e`;

      if (!useAuth.getState().isDemo) {
        // 3. Save to Supabase
        const { data: logo, error } = await supabase
          .from("logos")
          .insert({
            user_id: user.id,
            prompt,
            image_url: fakeLogoUrl,
          })
          .select()
          .single();

        if (error) throw error;

        // 4. Record transaction
        await supabase.from("credit_transactions").insert({
          user_id: user.id,
          amount: -1,
          type: "spent",
          reason: "Generated logo",
        });

        // 5. Update user credits in DB
        await supabase
          .from("users")
          .update({ credits: newCredits })
          .eq("id", user.id);
      }

      setGeneratedLogo(fakeLogoUrl);
      toast.success("Logo generated successfully!");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate logo");
      // Revert credit deduction on failure
      setProfile({ ...profile, credits: profile.credits });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!generatedLogo || !profile) return;

    const shareUrl = `${window.location.origin}/signup?ref=${profile.referral_code}`;
    const text = `Check out this logo I made with Loguvo! Create yours and get free credits: ${shareUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: "My AI Logo",
          text: text,
          url: shareUrl,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Share link copied to clipboard!");
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden border-zinc-200/50 shadow-xl shadow-zinc-200/20">
      <div className="p-6 border-b border-zinc-100 bg-white">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              placeholder={t("generator.prompt_placeholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full text-lg py-6 pl-10 bg-zinc-50/50 border-zinc-200 focus-visible:ring-indigo-500"
              disabled={isGenerating}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="py-6 px-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isGenerating
                ? t("generator.generating")
                : t("generator.generate_btn")}
            </span>
          </Button>
        </div>
      </div>

      <div className="aspect-square sm:aspect-video bg-zinc-50 relative flex items-center justify-center p-8 overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="relative z-10 flex flex-col items-center text-indigo-600"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <Wand2 className="absolute inset-0 m-auto w-8 h-8 animate-pulse" />
              </div>
              <p className="font-medium animate-pulse">
                Crafting your vision...
              </p>
            </motion.div>
          ) : generatedLogo ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative z-10 group w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white border border-zinc-100"
            >
              <img
                src={generatedLogo}
                alt="Generated Logo"
                className="w-full h-full object-contain p-8"
                referrerPolicy="no-referrer"
              />
              {/* Watermark overlay */}
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white/90 text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide">
                Made with Loguvo
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-12 h-12 rounded-full hover:scale-110 transition-transform"
                  onClick={handleShare}
                  title={t("generator.share")}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-12 h-12 rounded-full hover:scale-110 transition-transform"
                  asChild
                  title={t("generator.download")}
                >
                  <a
                    href={generatedLogo}
                    download="ai-logo.svg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10 text-center text-zinc-400"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="font-medium text-zinc-500">
                Your generated logo will appear here
              </p>
              <p className="text-sm mt-2">
                Enter a prompt above to get started
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
