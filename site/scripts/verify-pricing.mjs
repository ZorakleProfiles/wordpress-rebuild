import assert from "node:assert/strict";
import {
  buildRegistrationUrl,
  getDueTodayCents,
  getPartnerDueTodayCents,
  getPartnerPromotion,
  getPartnerRateCents,
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

const franserveRegistrationUrl = new URL(buildRegistrationUrl(
  "https://portal.zorakle.net/register",
  "broker_monthly",
  undefined,
  ["franserve"],
));
assert.deepEqual(franserveRegistrationUrl.searchParams.getAll("organization"), ["2693"]);
assert.equal(franserveRegistrationUrl.searchParams.get("partner_promotion"), "coupon");

assert.deepEqual(getPartnerPromotion(["franserve"], "broker"), {
  key: "coupon",
  kind: "discount",
  percentOff: 20,
  label: "20% off",
});
const franservePromotion = getPartnerPromotion(["franserve"], "broker");
const brokerMonthly = getPlan("broker", undefined, "monthly");
assert.equal(getPartnerRateCents(brokerMonthly, franservePromotion), 11920);
assert.equal(getPartnerDueTodayCents(brokerMonthly, franservePromotion), 11920);

const ifpgPromotion = getPartnerPromotion(["ifpg"], "broker");
assert.equal(getPartnerRateCents(brokerMonthly, ifpgPromotion), 0);
assert.equal(getPartnerDueTodayCents(brokerMonthly, ifpgPromotion), 0);
assert.equal(getPartnerPromotion(["ifpg"], "broker")?.trialDays, 90);
assert.equal(getPartnerPromotion(["entrepreneur-authority"], "broker")?.trialDays, 90);
assert.equal(getPartnerPromotion(["ifpg"], "franchisor"), undefined);
assert.equal(getPartnerPromotion(["entrepreneur-authority"], "franchisor"), undefined);
assert.equal(getPartnerPromotion(["franserve", "ifpg"], "franchisor")?.key, "coupon");
assert.equal(
  getPartnerPromotion(["franserve", "ifpg"], "broker")?.key,
  "trial",
  "The 90-day trial must take precedence when multiple memberships are selected",
);

const partnerRegistrationUrl = new URL(buildRegistrationUrl(
  "https://portal.zorakle.net/register",
  "broker_monthly",
  undefined,
  ["franserve", "ifpg"],
));
assert.deepEqual(partnerRegistrationUrl.searchParams.getAll("organization"), ["2693", "2727"]);
assert.equal(partnerRegistrationUrl.searchParams.get("partner_promotion"), "trial");
assert.equal(partnerRegistrationUrl.searchParams.has("coupon"), false, "Membership benefits must remain separate from coupons");

const entrepreneurAuthorityUrl = new URL(buildRegistrationUrl(
  "https://portal.zorakle.net/register",
  "broker_monthly",
  undefined,
  ["entrepreneur-authority"],
));
assert.deepEqual(entrepreneurAuthorityUrl.searchParams.getAll("organization"), ["2685"]);

const franchisorTrialUrl = new URL(buildRegistrationUrl(
  "https://portal.zorakle.net/register",
  "emerging_monthly",
  undefined,
  ["ifpg"],
));
assert.equal(franchisorTrialUrl.searchParams.has("partner_promotion"), false);

const franchisorCouponUrl = new URL(buildRegistrationUrl(
  "https://portal.zorakle.net/register",
  "emerging_monthly",
  undefined,
  ["franserve", "ifpg"],
));
assert.equal(franchisorCouponUrl.searchParams.get("partner_promotion"), "coupon");

console.log(`Pricing catalog verified: ${plans.length} plans`);
