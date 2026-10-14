import { footer } from "../data/site-content";
import {
  accountTypes,
  plans,
  tiers,
  formatCents,
  getSetupFeeCents,
  type PricingAudience,
  type PricingPlan
} from "../data/pricing";

export const SITE_ORIGIN = "https://www.zorakleprofiles.com/";

export const organizationId = (siteHref: string = SITE_ORIGIN) => `${siteHref}#organization`;
export const websiteId = (siteHref: string = SITE_ORIGIN) => `${siteHref}#website`;
export const ceoId = (siteHref: string = SITE_ORIGIN) => `${siteHref}#rebecca-monet`;
export const softwareId = (siteHref: string = SITE_ORIGIN) => `${siteHref}#software`;

/**
 * The single Organization entity for Zorakle Profiles, LLC. Every page emits
 * it (via MainLayout) under the same @id, so search engines see one
 * consistent publisher/brand entity across the whole site. Other JSON-LD
 * nodes should reference it with `{ "@id": organizationId(siteHref) }`
 * instead of redefining it.
 */
export function organizationNode(siteHref: string = SITE_ORIGIN) {
  // sameAs: pulled from footer.social. Add new profile URLs there and they
  // flow into this schema automatically.
  const sameAs = footer.social.map((profile) => profile.href).filter(Boolean);

  return {
    "@type": "Organization",
    "@id": organizationId(siteHref),
    name: "Zorakle",
    legalName: "Zorakle Profiles, LLC",
    alternateName: ["Zorakle Profiles", "Zorakle Profiles LLC"],
    url: siteHref,
    logo: {
      "@type": "ImageObject",
      "@id": `${siteHref}#logo`,
      url: new URL("/zorakle-logo.png", siteHref).href,
      width: 2218,
      height: 600,
      caption: "Zorakle"
    },
    image: { "@id": `${siteHref}#logo` },
    employee: { "@id": ceoId(siteHref) },
    email: footer.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "8782 S. Park Road",
      addressLocality: "Rogers",
      addressRegion: "AR",
      postalCode: "72756",
      addressCountry: "US"
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: footer.email,
        url: new URL("/support/", siteHref).href,
        areaServed: "US",
        availableLanguage: "English"
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        url: new URL("/schedule/", siteHref).href,
        areaServed: "US",
        availableLanguage: "English"
      }
    ],
    knowsAbout: [
      "Franchisee selection",
      "Franchisee assessment",
      "Franchise candidate fit",
      "Franchise development",
      "Franchise broker matching",
      "Behavioral science"
    ],
    ...(sameAs.length ? { sameAs } : {}),
    description:
      "Zorakle Profiles, LLC builds science-backed franchisee assessment and matching software that helps franchisors award better-fitting owners and helps franchise brokers match clients to the right brands."
  };
}

/** Rebecca Monet, CEO and Chief Scientist — the company's named expert. */
export function ceoNode(siteHref: string = SITE_ORIGIN) {
  return {
    "@type": "Person",
    "@id": ceoId(siteHref),
    name: "Rebecca Monet",
    jobTitle: "CEO and Chief Scientist",
    worksFor: { "@id": organizationId(siteHref) },
    knowsAbout: ["Franchisee selection", "Behavioral science", "Franchise development"]
  };
}

export function websiteNode(siteHref: string = SITE_ORIGIN) {
  return {
    "@type": "WebSite",
    "@id": websiteId(siteHref),
    name: "Zorakle",
    alternateName: "Zorakle Profiles",
    url: siteHref,
    inLanguage: "en-US",
    publisher: { "@id": organizationId(siteHref) }
  };
}

/**
 * Plain-text meta description from arbitrary copy: strips bare URLs (left
 * over from the WordPress import), collapses whitespace, and trims to a word
 * boundary so search snippets aren't cut mid-word.
 */
export function toMetaDescription(text: string, maxLength = 158): string {
  const clean = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:\-–—]+$/, "");
  return `${trimmed}…`;
}

const BILLING_SPEC: Record<PricingPlan["billing"], { unitText: string; billingDuration?: string }> = {
  monthly: { unitText: "month", billingDuration: "P1M" },
  annual: { unitText: "year", billingDuration: "P1Y" },
  paygo: { unitText: "assessment" }
};

function planName(plan: PricingPlan): string {
  const account = plan.tier
    ? tiers.find((tier) => tier.key === plan.tier)?.name ?? accountTypes[plan.accountType].summaryName
    : "Broker";
  const billing = { monthly: "Monthly Unlimited", annual: "Annual Unlimited", paygo: "Pay as you go" }[plan.billing];
  return `${account} — ${billing}`;
}

/**
 * SoftwareApplication node for the Zorakle platform with one Offer per plan,
 * generated from src/data/pricing.ts so prices in search results always
 * match the pricing page. `audience` narrows the offers to that account type.
 */
export function softwareApplicationNode(
  siteHref: string = SITE_ORIGIN,
  audience: PricingAudience = "all",
  pageUrl: string = new URL("/pricing/", siteHref).href
) {
  const offers = plans
    .filter((plan) => audience === "all" || plan.accountType === audience)
    .map((plan) => {
      const setupFee = getSetupFeeCents(plan);
      const spec = BILLING_SPEC[plan.billing];
      return {
        "@type": "Offer",
        name: planName(plan),
        url: pageUrl,
        price: (plan.amountCents / 100).toFixed(2),
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: (plan.amountCents / 100).toFixed(2),
          priceCurrency: "USD",
          unitText: spec.unitText,
          ...(spec.billingDuration ? { billingDuration: spec.billingDuration } : {})
        },
        description: setupFee > 0
          ? `${plan.description} One-time setup and research fee of ${formatCents(setupFee)}.`
          : plan.description,
        availability: "https://schema.org/InStock",
        seller: { "@id": organizationId(siteHref) }
      };
    });

  return {
    "@type": "SoftwareApplication",
    "@id": softwareId(siteHref),
    name: "Zorakle",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Franchisee assessment and matching software",
    operatingSystem: "Web",
    url: siteHref,
    description:
      "Science-backed franchisee assessment and matching platform that scores candidate fit against a franchise system's top performers and helps brokers match clients to the right brands.",
    publisher: { "@id": organizationId(siteHref) },
    offers
  };
}

/** Service node for a solutions page, provided by the Organization. */
export function serviceNode(
  siteHref: string,
  options: { url: string; name: string; description: string; audienceType: string; serviceType: string }
) {
  return {
    "@type": "Service",
    "@id": `${options.url}#service`,
    name: options.name,
    serviceType: options.serviceType,
    description: options.description,
    url: options.url,
    provider: { "@id": organizationId(siteHref) },
    areaServed: { "@type": "Country", name: "United States" },
    audience: { "@type": "BusinessAudience", audienceType: options.audienceType },
    isRelatedTo: { "@id": softwareId(siteHref) }
  };
}
