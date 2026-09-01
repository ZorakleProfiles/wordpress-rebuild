import assert from "node:assert/strict";
import {
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

assert.deepEqual(getPartnerPromotion("franserve", "broker"), {
  key: "coupon",
  kind: "discount",
  percentOff: 20,
  label: "20% off",
});
const franservePromotion = getPartnerPromotion("franserve", "broker");
const brokerMonthly = getPlan("broker", undefined, "monthly");
assert.equal(getPartnerRateCents(brokerMonthly, franservePromotion), 11920);
assert.equal(getPartnerDueTodayCents(brokerMonthly, franservePromotion), 11920);

const ifpgPromotion = getPartnerPromotion("ifpg", "broker");
assert.equal(getPartnerRateCents(brokerMonthly, ifpgPromotion), 0);
assert.equal(getPartnerDueTodayCents(brokerMonthly, ifpgPromotion), 0);
assert.equal(getPartnerPromotion("ifpg", "broker")?.trialDays, 90);
assert.equal(getPartnerPromotion("ifpg", "franchisor"), undefined);
assert.equal(getPartnerPromotion("franserve", "franchisor")?.key, "coupon");
assert.equal(getPlan("broker", undefined, "paygo")?.key, "broker_pay_as_you_go");
assert.equal(getPlan("franchisor", "emerging", "paygo")?.amountCents, 6900);
assert.equal(getPlan("franchisor", "established", "paygo")?.amountCents, 6900);

console.log(`Pricing catalog verified: ${plans.length} plans`);
