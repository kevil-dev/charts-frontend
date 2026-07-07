export function resolveTier(user) {
  if (!user) return "guest";
  const paid = ["trialing", "active", "past_due"];
  if (paid.includes(user.plan_status) && user.selected_tier === "pro") return "pro";
  if (paid.includes(user.plan_status) && user.selected_tier === "elite") return "elite";
  return "free";
}
