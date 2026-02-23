import { supabase } from "./supabase";

export async function validateReferralActivity(userId: string) {
  try {
    // 1. Check if user has generated at least 1 logo
    const { count } = await supabase
      .from("logos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (count && count > 0) {
      // 2. Find pending referral for this user
      const { data: referral } = await supabase
        .from("referrals")
        .select("*")
        .eq("referred_id", userId)
        .eq("valid", false)
        .single();

      if (referral) {
        // 3. Mark referral as valid
        await supabase
          .from("referrals")
          .update({ valid: true, activity_confirmed: true })
          .eq("id", referral.id);

        // 4. Grant credits to referrer (e.g., 5 credits)
        const rewardAmount = 5;

        // Get current referrer credits
        const { data: referrer } = await supabase
          .from("users")
          .select("credits")
          .eq("id", referral.referrer_id)
          .single();

        if (referrer) {
          await supabase
            .from("users")
            .update({ credits: referrer.credits + rewardAmount })
            .eq("id", referral.referrer_id);

          // Log transaction
          await supabase.from("credit_transactions").insert({
            user_id: referral.referrer_id,
            amount: rewardAmount,
            type: "earned",
            reason: `Referral reward for user ${userId}`,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error validating referral activity:", error);
  }
}
