import {
  accountTypes,
  billingOptions,
  buildRegistrationUrl,
  formatCents,
  getDueTodayCents,
  getPlan,
  getPlanRate,
  getPlanSummaryNote,
  getSetupFeeCents,
  getTier,
  plans,
  type AccountType,
  type BillingKey,
  type PricingAudience,
  type PricingPlan,
  type TierKey,
} from "../data/pricing";

type SelectionState = {
  accountType?: AccountType;
  tier?: TierKey;
  billing?: BillingKey;
};

type CouponPreview = {
  code: string;
  planKey: string;
  discountLabel: string;
  originalRate: string;
  discountedRate: string;
  discountedDueToday: string;
  note: string;
};

function initializePricing(root: HTMLElement) {
  if (root.dataset.pricingInitialized === "true") return;
  root.dataset.pricingInitialized = "true";

  const audience = (root.dataset.audience ?? "all") as PricingAudience;
  const state: SelectionState = {
    accountType: audience === "all" ? undefined : audience,
  };
  let appliedCoupon: CouponPreview | null = null;
  let couponLoading = false;

  const accountInputs = [...root.querySelectorAll<HTMLInputElement>("[data-account-type-input]")];
  const tierInputs = [...root.querySelectorAll<HTMLInputElement>("[data-tier-input]")];
  const billingInputs = [...root.querySelectorAll<HTMLInputElement>("[data-billing-input]")];
  const couponInput = root.querySelector<HTMLInputElement>("[data-coupon-input]");
  const couponButton = root.querySelector<HTMLButtonElement>("[data-coupon-apply]");
  const couponStatus = root.querySelector<HTMLElement>("[data-coupon-status]");
  const continueButton = root.querySelector<HTMLButtonElement>("[data-continue-btn]");

  const setText = (selector: string, value: string) => {
    const element = root.querySelector<HTMLElement>(selector);
    if (element) element.textContent = value;
  };

  const selectedPlan = () => getPlan(state.accountType, state.tier, state.billing);
  const couponCode = () => couponInput?.value.trim().toUpperCase() ?? "";
  const couponIsCurrent = () => {
    const plan = selectedPlan();
    return Boolean(appliedCoupon && plan && appliedCoupon.planKey === plan.key && appliedCoupon.code === couponCode());
  };

  function setCouponStatus(message: string, tone: "neutral" | "success" | "error" = "neutral") {
    if (!couponStatus) return;
    couponStatus.textContent = message;
    couponStatus.classList.remove("text-[#72767e]", "text-[#087f65]", "text-[#b42318]");
    couponStatus.classList.add(tone === "success" ? "text-[#087f65]" : tone === "error" ? "text-[#b42318]" : "text-[#72767e]");
  }

  function clearCoupon(message: string) {
    appliedCoupon = null;
    setCouponStatus(message);
  }

  function setSelectedStyle(option: Element, selected: boolean) {
    option.classList.toggle("border-[#09cc9c]", selected);
    option.classList.toggle("bg-[#f0fffe]", selected);
    option.classList.toggle("border-[#d1d4dd]", !selected);
    option.classList.toggle("bg-white", !selected);
  }

  function renderVisibility() {
    root.querySelector<HTMLElement>("[data-billing-wrapper]")?.classList.toggle("hidden", !state.accountType);
    root.querySelector<HTMLElement>('[data-tier-section="franchisor"]')?.classList.toggle("hidden", state.accountType !== "franchisor");
    const billingStep = state.accountType === "broker" ? (audience === "all" ? "2" : "1") : (audience === "all" ? "3" : "2");
    setText("[data-billing-step]", billingStep);
  }

  function renderSelections() {
    root.querySelectorAll<HTMLElement>("[data-account-type-option]").forEach((option) => {
      setSelectedStyle(option, option.dataset.accountTypeOption === state.accountType);
    });
    root.querySelectorAll<HTMLElement>("[data-tier-option]").forEach((option) => {
      setSelectedStyle(option, option.dataset.tierOption === state.tier);
    });
    root.querySelectorAll<HTMLElement>("[data-billing-option]").forEach((option) => {
      setSelectedStyle(option, option.dataset.billingOption === state.billing);
    });
  }

  function renderBillingCards() {
    billingInputs.forEach((input) => {
      const billing = input.value as BillingKey;
      const plan = getPlan(state.accountType, state.tier, billing);
      const label = input.closest<HTMLElement>("[data-billing-card]");
      input.disabled = !plan;
      label?.classList.toggle("hidden", Boolean(state.accountType === "franchisor" && state.tier && !plan));
      if (!label) return;
      const option = billingOptions.find((item) => item.key === billing);
      const price = label.querySelector<HTMLElement>("[data-billing-price]");
      const description = label.querySelector<HTMLElement>("[data-billing-description]");
      const badge = label.querySelector<HTMLElement>("[data-billing-badge]");
      if (price) price.textContent = plan ? getPlanRate(plan) : "Select an account";
      if (description) description.textContent = plan?.description ?? "Choose an account to see this option.";
      if (badge) {
        badge.textContent = plan?.badge ?? "";
        badge.classList.toggle("hidden", !plan?.badge);
      }
      setText(`[data-billing-name="${billing}"]`, option?.name ?? billing);
    });
  }

  function renderSummary() {
    const plan = selectedPlan();
    const tier = getTier(state.tier);
    const originalRate = root.querySelector<HTMLElement>("[data-summary-rate-original]");

    setText("[data-summary-rate-label]", state.billing === "paygo" ? "Assessment rate" : "Subscription");
    setText("[data-summary-account]", state.accountType === "broker" ? accountTypes.broker.summaryName : tier?.name ?? "Not selected");
    setText("[data-summary-billing]", billingOptions.find((item) => item.key === state.billing)?.name ?? "Not selected");
    setText("[data-summary-rate]", plan ? getPlanRate(plan) : "Not selected");
    setText("[data-summary-setup]", plan && getSetupFeeCents(plan) > 0 ? formatCents(getSetupFeeCents(plan)) : "None");
    setText("[data-summary-price]", plan ? formatCents(getDueTodayCents(plan)) : "—");

    if (!state.accountType) {
      setText("[data-summary-title]", "Build your plan");
      setText("[data-summary-subtitle]", "Choose whether you are a broker or franchisor.");
      setText("[data-summary-note]", "Make your selections to continue.");
    } else if (state.accountType === "franchisor" && !tier) {
      setText("[data-summary-title]", "Choose a franchisor account");
      setText("[data-summary-subtitle]", "Your system size determines the right account.");
      setText("[data-summary-note]", "Select an account before choosing billing.");
    } else {
      setText("[data-summary-title]", state.accountType === "broker" ? accountTypes.broker.summaryName : tier?.name ?? "Your plan");
      setText("[data-summary-subtitle]", state.accountType === "broker" ? "Broker pricing" : "Franchisor pricing");
      setText("[data-summary-note]", plan ? getPlanSummaryNote(plan) : "Choose a billing option to continue.");
    }

    setText("[data-summary-footnote]", state.tier === "match-only"
      ? "Match Only profiles must be referred by a broker; organic lead assessment links are not included."
      : "Your final plan and billing details will be confirmed before checkout.");

    if (couponIsCurrent() && appliedCoupon && plan) {
      if (originalRate) {
        originalRate.textContent = appliedCoupon.originalRate;
        originalRate.classList.toggle("hidden", appliedCoupon.originalRate === appliedCoupon.discountedRate);
      }
      setText("[data-summary-rate]", appliedCoupon.discountedRate);
      if (getSetupFeeCents(plan) === 0 && plan.billing !== "paygo") {
        setText("[data-summary-price]", appliedCoupon.discountedDueToday);
      }
      setText("[data-summary-note]", appliedCoupon.note);
    } else if (originalRate) {
      originalRate.textContent = "";
      originalRate.classList.add("hidden");
    }

    const codeNeedsValidation = Boolean(plan && couponCode() && !couponIsCurrent());
    if (couponButton) {
      couponButton.disabled = couponLoading || !plan || !couponCode() || couponIsCurrent();
      couponButton.textContent = couponLoading ? "Checking…" : couponIsCurrent() ? "Applied" : "Apply";
    }
    if (continueButton) {
      continueButton.disabled = !plan || codeNeedsValidation || couponLoading;
      continueButton.setAttribute("aria-disabled", String(continueButton.disabled));
    }
  }

  function render() {
    renderVisibility();
    renderBillingCards();
    renderSelections();
    renderSummary();
  }

  accountInputs.forEach((input) => input.addEventListener("change", () => {
    state.accountType = input.value as AccountType;
    state.tier = undefined;
    state.billing = undefined;
    tierInputs.forEach((item) => { item.checked = false; });
    billingInputs.forEach((item) => { item.checked = false; });
    clearCoupon(couponCode() ? "Your plan changed. Apply the coupon again." : "Choose a plan, then apply your code.");
    render();
  }));

  tierInputs.forEach((input) => input.addEventListener("change", () => {
    state.tier = input.value as TierKey;
    state.billing = undefined;
    billingInputs.forEach((item) => { item.checked = false; });
    clearCoupon(couponCode() ? "Your plan changed. Apply the coupon again." : "Choose a billing option, then apply your code.");
    render();
  }));

  billingInputs.forEach((input) => input.addEventListener("change", () => {
    state.billing = input.value as BillingKey;
    clearCoupon(couponCode() ? "Your plan changed. Apply the coupon again." : "Enter a coupon code, if you have one.");
    render();
  }));

  couponInput?.addEventListener("input", () => {
    couponInput.value = couponInput.value.toUpperCase();
    clearCoupon(couponCode() ? "Apply the code to preview your discount." : "Enter a coupon code, if you have one.");
    renderSummary();
  });

  couponButton?.addEventListener("click", async () => {
    const plan = selectedPlan();
    const code = couponCode();
    const previewBaseUrl = root.dataset.couponPreviewUrl;
    if (!plan || !code || !previewBaseUrl) return;

    couponLoading = true;
    setCouponStatus("Checking coupon…");
    renderSummary();

    try {
      const response = await fetch(`${previewBaseUrl}/${encodeURIComponent(code)}/${encodeURIComponent(plan.key)}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.error) throw new Error(result.message || result.error || "This coupon is not valid for the selected plan.");

      const percentOff = Number(result.coupon?.percent_off);
      if (!Number.isFinite(percentOff) || percentOff <= 0 || percentOff > 100) {
        throw new Error("This plan requires a percentage-based coupon.");
      }
      const discountedCents = plan.billing === "paygo"
        ? Math.round(plan.amountCents * (1 - percentOff / 100))
        : Math.round(Number(result.subscription?.discounted ?? result.total) * 100);
      if (!Number.isFinite(discountedCents)) throw new Error("The coupon response did not include a discounted subscription price.");

      const discountLabel = `${percentOff}% off${result.coupon?.duration === "repeating" && result.coupon?.duration_in_months ? ` for ${result.coupon.duration_in_months} months` : result.coupon?.duration === "once" ? " once" : ""}`;
      const setupFee = getSetupFeeCents(plan);
      appliedCoupon = {
        code,
        planKey: plan.key,
        discountLabel,
        originalRate: getPlanRate(plan),
        discountedRate: `${formatCents(discountedCents)}${plan.rateUnit}`,
        discountedDueToday: formatCents(discountedCents),
        note: plan.billing === "paygo"
          ? `${discountLabel} applies to each assessment and the resulting monthly usage total.${setupFee ? ` The ${formatCents(setupFee)} setup fee is unchanged and due today.` : ""}`
          : setupFee
            ? `${discountLabel} applies to the subscription only. The ${formatCents(setupFee)} setup fee is unchanged and due today.`
            : `${discountLabel} applied to your subscription.`,
      };
      setCouponStatus(`${discountLabel} applied.`, "success");
    } catch (error) {
      appliedCoupon = null;
      const detail = error instanceof Error ? error.message : "";
      setCouponStatus(detail && !/failed to fetch|unexpected token|json/i.test(detail)
        ? detail
        : "Unable to validate this coupon right now. Please try again.", "error");
    } finally {
      couponLoading = false;
      renderSummary();
    }
  });

  continueButton?.addEventListener("click", () => {
    const plan = selectedPlan();
    const registrationUrl = root.dataset.portalRegistrationUrl;
    if (!plan || !registrationUrl) return;
    const coupon = couponIsCurrent() && appliedCoupon ? appliedCoupon.code : undefined;
    window.location.assign(buildRegistrationUrl(registrationUrl, plan.key, coupon));
  });

  render();
}

document.querySelectorAll<HTMLElement>("[data-pricing-configurator]").forEach(initializePricing);
