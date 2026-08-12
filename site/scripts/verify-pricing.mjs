import assert from "node:assert/strict";
import {
  buildRegistrationUrl,
  getDueTodayCents,
  getPlan,
  getSetupFeeCents,
  plans,
} from "../src/data/pricing.ts";

assert.equal(new Set(plans.map((plan) => plan.key)).size, plans.length, "Plan keys must be unique");

for (const plan of plans) {
  assert.equal(getPlan(plan.accountType, plan.tier, plan.billing)?.key, plan.key, `Plan lookup failed for ${plan.key}`);
  const setupFee = getSetupFeeCents(plan);
  const expectedDueToday = setupFee || (plan.billing === "paygo" ? 0 : plan.amountCents);
  assert.equal(getDueTodayCents(plan), expectedDueToday, `Due-today calculation failed for ${plan.key}`);
}

assert.equal(getPlan("franchisor", "match-only", "paygo"), undefined, "Match Only must not offer pay as you go");

const registrationUrl = new URL(buildRegistrationUrl(
  "https://portal.zorakle.net/register",
  "broker_payg_monthly",
  "SAVE 20%",
));
assert.equal(registrationUrl.searchParams.get("plan"), "broker_payg_monthly");
assert.equal(registrationUrl.searchParams.get("coupon"), "SAVE 20%");

console.log(`Pricing catalog verified: ${plans.length} plans`);
