export type PricingAudience = "all" | AccountType;
export type AccountType = "broker" | "franchisor";
export type TierKey = "match-only" | "emerging" | "established";
export type BillingKey = "monthly" | "annual" | "paygo";
export type PartnerOrganizationKey = "franserve" | "ifpg" | "entrepreneur-authority";

export type PartnerPromotion =
  | { key: "partner_20_percent"; kind: "discount"; percentOff: 20; label: string }
  | { key: "partner_90_day_trial"; kind: "trial"; trialDays: 90; label: string };

export interface PricingPlan {
  key: string;
  accountType: AccountType;
  tier?: TierKey;
  billing: BillingKey;
  amountCents: number;
  ratePrefix?: string;
  rateUnit: string;
  description: string;
  badge?: string;
}

export const accountTypes = {
  franchisor: {
    name: "A Franchisor",
    summaryName: "Franchisor",
    description: "You award franchises. We model your system.",
  },
  broker: {
    name: "A Broker",
    summaryName: "The Broker Account",
    description: "You place candidates. We match them to brands.",
  },
} as const;

export const tiers: ReadonlyArray<{
  key: TierKey;
  name: string;
  segment: string;
  description: string;
  features: ReadonlyArray<string>;
  setupFeeCents: number;
}> = [
  {
    key: "match-only",
    name: "SpotOn! Match Only",
    segment: "ANY SYSTEM SIZE",
    description: "For systems that only need matching for broker- or consultant-referred candidates. We audit your brand and build your blueprint and matching algorithm.",
    features: [
      "Access SpotOn! referrals sent by brokers and consultants",
      "No assessment links or reports",
      "No setup fee or commitment",
    ],
    setupFeeCents: 0,
  },
  {
    key: "emerging",
    name: "Emerging Franchisor",
    segment: "UNDER 30 FRANCHISEES",
    description: "For systems with fewer than 30 franchisees. We audit your brand and use those findings to create your blueprint and matching algorithm. This process does not include a separate franchisee research phase.",
    features: [
      "Assessment links for prospective franchisees",
      "SpotOn!, Business Builder, and Eclipse reports",
      "Custom blueprint and matching algorithm",
    ],
    setupFeeCents: 250000,
  },
  {
    key: "established",
    name: "Established Franchisor",
    segment: "30+ FRANCHISEES",
    description: "For systems with 30 or more franchisees. Our research phase combines a full brand audit with assessments of your existing franchisees to build a data-backed blueprint and matching algorithm.",
    features: [
      "Everything included with an Emerging account",
      "Dedicated research phase and franchisee assessments",
      "Existing-franchisee benchmarking",
    ],
    setupFeeCents: 350000,
  },
];

export const billingOptions: ReadonlyArray<{ key: BillingKey; name: string }> = [
  { key: "monthly", name: "Monthly" },
  { key: "annual", name: "Annual" },
  { key: "paygo", name: "Pay as you go" },
];

export const partnerOrganizations: ReadonlyArray<{
  key: PartnerOrganizationKey;
  name: string;
}> = [
  { key: "franserve", name: "Franserve" },
  { key: "ifpg", name: "IFPG" },
  { key: "entrepreneur-authority", name: "The Entrepreneur Authority" },
];

export const plans: ReadonlyArray<PricingPlan> = [
  {
    key: "broker_monthly",
    accountType: "broker",
    billing: "monthly",
    amountCents: 14900,
    rateUnit: "/mo",
    description: "Cancel any month. Billed on the same day each month.",
  },
  {
    key: "broker_annually",
    accountType: "broker",
    billing: "annual",
    amountCents: 161000,
    rateUnit: "/yr",
    description: "One year of service, billed once.",
    badge: "BEST VALUE",
  },
  {
    key: "broker_payg_monthly",
    accountType: "broker",
    billing: "paygo",
    amountCents: 4900,
    rateUnit: " per assessment",
    description: "No base subscription. Pay monthly for the assessments you run.",
  },
  {
    key: "spoton_match_only_monthly",
    accountType: "franchisor",
    tier: "match-only",
    billing: "monthly",
    amountCents: 24900,
    rateUnit: "/mo",
    description: "Cancel any month. Billed on the same day each month.",
  },
  {
    key: "spoton_match_only_annually",
    accountType: "franchisor",
    tier: "match-only",
    billing: "annual",
    amountCents: 268920,
    rateUnit: "/yr",
    description: "One year of service, billed once.",
    badge: "BEST VALUE",
  },
  {
    key: "emerging_monthly",
    accountType: "franchisor",
    tier: "emerging",
    billing: "monthly",
    amountCents: 39500,
    rateUnit: "/mo",
    description: "Subscription billing begins after research.",
  },
  {
    key: "emerging_annually",
    accountType: "franchisor",
    tier: "emerging",
    billing: "annual",
    amountCents: 426600,
    rateUnit: "/yr",
    description: "Annual subscription billing begins after research is completed.",
    badge: "BEST VALUE",
  },
  {
    key: "emerging_pay_as_you_go",
    accountType: "franchisor",
    tier: "emerging",
    billing: "paygo",
    amountCents: 7900,
    rateUnit: " per assessment",
    description: "Pay monthly for the assessments you run after research is completed.",
  },
  {
    key: "established_monthly",
    accountType: "franchisor",
    tier: "established",
    billing: "monthly",
    amountCents: 69500,
    rateUnit: "/mo",
    description: "Subscription billing begins after research is completed.",
  },
  {
    key: "established_annually",
    accountType: "franchisor",
    tier: "established",
    billing: "annual",
    amountCents: 750600,
    rateUnit: "/yr",
    description: "Annual subscription billing begins after research is completed.",
    badge: "BEST VALUE",
  },
  {
    key: "established_pay_as_you_go",
    accountType: "franchisor",
    tier: "established",
    billing: "paygo",
    amountCents: 7900,
    rateUnit: " per assessment",
    description: "Pay monthly for the assessments you run after research is completed.",
  },
];

export function formatCents(cents: number) {
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function getTier(tier?: TierKey) {
  return tiers.find((item) => item.key === tier);
}

export function getPlan(accountType?: AccountType, tier?: TierKey, billing?: BillingKey) {
  return plans.find((plan) =>
    plan.accountType === accountType &&
    plan.billing === billing &&
    (accountType === "broker" || plan.tier === tier)
  );
}

export function getPlanRate(plan: PricingPlan) {
  return `${plan.ratePrefix ?? ""}${formatCents(plan.amountCents)}${plan.rateUnit}`;
}

export function getSetupFeeCents(plan?: PricingPlan) {
  return plan?.tier ? getTier(plan.tier)?.setupFeeCents ?? 0 : 0;
}

export function getDueTodayCents(plan: PricingPlan) {
  const setupFee = getSetupFeeCents(plan);
  if (setupFee > 0) return setupFee;
  return plan.billing === "paygo" ? 0 : plan.amountCents;
}

export function getPlanSummaryNote(plan: PricingPlan) {
  const setupFee = getSetupFeeCents(plan);
  if (plan.billing === "paygo") {
    return setupFee > 0
      ? `Setup is due today; assessments are ${formatCents(plan.amountCents)} each after research is completed.`
      : `${formatCents(plan.amountCents)} is charged for each assessment and billed monthly.`;
  }
  if (setupFee > 0) {
    return `Setup is due today; subscription billing begins after research is completed at ${getPlanRate(plan)}.`;
  }
  return plan.billing === "monthly"
    ? `First month due today, then ${getPlanRate(plan)}.`
    : "One year of service, billed today.";
}

export function getPartnerPromotion(organizationKeys: ReadonlyArray<PartnerOrganizationKey>): PartnerPromotion | undefined {
  if (organizationKeys.includes("ifpg") || organizationKeys.includes("entrepreneur-authority")) {
    return {
      key: "partner_90_day_trial",
      kind: "trial",
      trialDays: 90,
      label: "90-day free trial",
    };
  }
  if (organizationKeys.includes("franserve")) {
    return {
      key: "partner_20_percent",
      kind: "discount",
      percentOff: 20,
      label: "20% off",
    };
  }
}

export function getPartnerRateCents(plan: PricingPlan, promotion: PartnerPromotion) {
  return promotion.kind === "trial"
    ? 0
    : Math.round(plan.amountCents * (1 - promotion.percentOff / 100));
}

export function getPartnerDueTodayCents(plan: PricingPlan, promotion: PartnerPromotion) {
  const setupFee = getSetupFeeCents(plan);
  if (setupFee > 0) return setupFee;
  if (plan.billing === "paygo") return 0;
  return getPartnerRateCents(plan, promotion);
}

export function buildRegistrationUrl(
  baseUrl: string,
  planKey: string,
  couponCode?: string,
  organizationKeys: ReadonlyArray<PartnerOrganizationKey> = [],
) {
  const url = new URL(baseUrl);
  url.searchParams.set("plan", planKey);
  if (couponCode) url.searchParams.set("coupon", couponCode);
  organizationKeys.forEach((organization) => url.searchParams.append("organization", organization));
  const promotion = getPartnerPromotion(organizationKeys);
  if (promotion) url.searchParams.set("partner_promotion", promotion.key);
  return url.href;
}
