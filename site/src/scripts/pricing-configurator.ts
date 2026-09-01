import {
  accountTypes,
  billingOptions,
  formatCents,
  getDueTodayCents,
  getPartnerDueTodayCents,
  getPartnerPromotion,
  getPartnerRateCents,
  getPlan,
  getPlanRate,
  getPlanSummaryNote,
  getSetupFeeCents,
  getTier,
  type AccountType,
  type BillingKey,
  type PartnerKey,
  type PricingAudience,
  type TierKey,
} from "../data/pricing";

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => any;
  }
}

type SelectionState = { accountType?: AccountType; tier?: TierKey; billing?: BillingKey };
type CouponPreview = {
  code: string;
  planKey: string;
  originalRate: string;
  discountedRate: string;
  discountedDueToday: string;
  note: string;
};
type RegistrationContext = { accountId: number; token: string };
type CheckoutStage = "plan" | "details" | "payment";

function initializePricing(root: HTMLElement) {
  if (root.dataset.pricingInitialized === "true") return;
  root.dataset.pricingInitialized = "true";

  const audience = (root.dataset.audience ?? "all") as PricingAudience;
  const partner = (root.dataset.partner || undefined) as PartnerKey | undefined;
  const state: SelectionState = { accountType: audience === "all" ? undefined : audience };
  let stage: CheckoutStage = "plan";
  let appliedCoupon: CouponPreview | null = null;
  let couponLoading = false;
  let checkoutLoading = false;
  let registration: RegistrationContext | null = null;
  let stripe: any = null;
  let stripeElements: any = null;

  const accountInputs = [...root.querySelectorAll<HTMLInputElement>("[data-account-type-input]")];
  const tierInputs = [...root.querySelectorAll<HTMLInputElement>("[data-tier-input]")];
  const billingInputs = [...root.querySelectorAll<HTMLInputElement>("[data-billing-input]")];
  const registrationFields = [...root.querySelectorAll<HTMLInputElement>("[data-registration-field]")];
  const couponInput = root.querySelector<HTMLInputElement>("[data-coupon-input]");
  const couponButton = root.querySelector<HTMLButtonElement>("[data-coupon-apply]");
  const couponStatus = root.querySelector<HTMLElement>("[data-coupon-status]");
  const continueButton = root.querySelector<HTMLButtonElement>("[data-continue-btn]");
  const errorBox = root.querySelector<HTMLElement>("[data-checkout-error]");

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

  function showError(message = "") {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.classList.toggle("hidden", !message);
  }

  function setCouponStatus(message: string, tone: "neutral" | "success" | "error" = "neutral") {
    if (!couponStatus) return;
    couponStatus.textContent = message;
    couponStatus.classList.remove("text-[#56586a]", "text-[#087f65]", "text-[#b42318]");
    couponStatus.classList.add(tone === "success" ? "text-[#087f65]" : tone === "error" ? "text-[#b42318]" : "text-[#56586a]");
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
    root.querySelector<HTMLElement>("[data-plan-form]")?.classList.toggle("hidden", stage !== "plan");
    root.querySelector<HTMLElement>("[data-account-details]")?.classList.toggle("hidden", stage !== "details");
    root.querySelector<HTMLElement>("[data-payment-details]")?.classList.toggle("hidden", stage !== "payment");
    if (stage !== "plan") return;
    root.querySelector<HTMLElement>("[data-billing-wrapper]")?.classList.toggle("hidden", !state.accountType);
    root.querySelector<HTMLElement>('[data-tier-section="franchisor"]')?.classList.toggle("hidden", state.accountType !== "franchisor");
    setText("[data-billing-step]", state.accountType === "broker" ? (audience === "all" ? "2" : "1") : (audience === "all" ? "3" : "2"));
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
      const price = label.querySelector<HTMLElement>("[data-billing-price]");
      const description = label.querySelector<HTMLElement>("[data-billing-description]");
      const badge = label.querySelector<HTMLElement>("[data-billing-badge]");
      if (price) price.textContent = plan ? getPlanRate(plan) : "Select an account";
      if (description) description.textContent = plan?.description ?? "Choose an account to see this option.";
      if (badge) {
        badge.textContent = plan?.badge ?? "";
        badge.classList.toggle("hidden", !plan?.badge);
      }
      setText(`[data-billing-name="${billing}"]`, billingOptions.find((item) => item.key === billing)?.name ?? billing);
    });
  }

  function renderSummary() {
    const plan = selectedPlan();
    const tier = getTier(state.tier);
    const setupFeeCents = plan ? getSetupFeeCents(plan) : 0;
    const promotion = getPartnerPromotion(partner, state.accountType);
    const originalRate = root.querySelector<HTMLElement>("[data-summary-rate-original]");
    const partnerRow = root.querySelector<HTMLElement>("[data-summary-partner-row]");
    const setupRow = root.querySelector<HTMLElement>("[data-summary-setup-row]");

    setText("[data-summary-rate-label]", state.billing === "paygo" ? "Assessment rate" : "Subscription");
    setText("[data-summary-rate]", plan ? getPlanRate(plan) : "Not selected");
    setupRow?.classList.toggle("hidden", setupFeeCents === 0);
    setText("[data-summary-setup]", setupFeeCents > 0 ? formatCents(setupFeeCents) : "");
    setText("[data-summary-price]", plan ? formatCents(getDueTodayCents(plan)) : "—");
    partnerRow?.classList.toggle("hidden", !promotion);
    setText("[data-summary-partner]", promotion?.label ?? "");
    originalRate?.classList.add("hidden");

    if (!state.accountType) {
      setText("[data-summary-title]", "Build your plan");
      setText("[data-summary-note]", "Make your selections to continue.");
    } else if (state.accountType === "franchisor" && !tier) {
      setText("[data-summary-title]", "Choose a franchisor account");
      setText("[data-summary-note]", "Select an account before choosing billing.");
    } else {
      setText("[data-summary-title]", state.accountType === "broker" ? accountTypes.broker.summaryName : tier?.name ?? "Your plan");
      setText("[data-summary-note]", plan ? getPlanSummaryNote(plan) : "Choose a billing option to continue.");
    }

    setText("[data-summary-footnote]", state.tier === "match-only"
      ? "Match Only profiles must be referred by a broker; organic lead assessment links are not included."
      : "Your payment details are securely handled by Stripe.");

    if (promotion && plan) {
      const partnerName = partner === "ifpg" ? "IFPG" : "FranServe";
      if (promotion.kind === "discount") {
        const discountedCents = getPartnerRateCents(plan, promotion);
        if (originalRate) {
          originalRate.textContent = getPlanRate(plan);
          originalRate.classList.remove("hidden");
        }
        setText("[data-summary-rate]", `${formatCents(discountedCents)}${plan.rateUnit}`);
        setText("[data-summary-price]", formatCents(getPartnerDueTodayCents(plan, promotion)));
        setText("[data-summary-note]", setupFeeCents
          ? `${partnerName} member pricing applies 20% off subscription billing after research. The ${formatCents(setupFeeCents)} research fee is not discounted and is due today.`
          : `${partnerName} member pricing applies 20% off ${plan.billing === "paygo" ? "each assessment" : "the subscription"}.`);
      } else {
        setText("[data-summary-rate]", `Free for ${promotion.trialDays} days, then ${getPlanRate(plan)}`);
        setText("[data-summary-price]", formatCents(getPartnerDueTodayCents(plan, promotion)));
        setText("[data-summary-note]", `IFPG broker offer: no charge today. Billing begins after the ${promotion.trialDays}-day free trial.`);
      }
    } else if (couponIsCurrent() && appliedCoupon && plan) {
      if (originalRate) {
        originalRate.textContent = appliedCoupon.originalRate;
        originalRate.classList.toggle("hidden", appliedCoupon.originalRate === appliedCoupon.discountedRate);
      }
      setText("[data-summary-rate]", appliedCoupon.discountedRate);
      if (getSetupFeeCents(plan) === 0 && plan.billing !== "paygo") setText("[data-summary-price]", appliedCoupon.discountedDueToday);
      setText("[data-summary-note]", appliedCoupon.note);
    }

    root.querySelector<HTMLElement>("[data-coupon-section]")?.classList.toggle("hidden", Boolean(promotion));
    const codeNeedsValidation = Boolean(plan && couponCode() && !couponIsCurrent() && !promotion);
    if (couponButton) {
      couponButton.disabled = couponLoading || !plan || !couponCode() || couponIsCurrent();
      couponButton.textContent = couponLoading ? "Checking…" : couponIsCurrent() ? "Applied" : "Apply";
    }
    if (continueButton) {
      continueButton.disabled = checkoutLoading || (stage === "plan" && (!plan || codeNeedsValidation || couponLoading));
      continueButton.textContent = checkoutLoading
        ? "Please wait…"
        : stage === "plan"
          ? "Continue to your details →"
          : stage === "details"
            ? "Continue to secure payment →"
            : "Complete registration";
    }
  }

  function render() {
    renderVisibility();
    renderBillingCards();
    renderSelections();
    renderSummary();
  }

  function resetAfterPlanChange(message: string) {
    registration = null;
    clearCoupon(couponCode() ? message : "Enter a coupon code, if you have one.");
    showError();
    render();
  }

  accountInputs.forEach((input) => input.addEventListener("change", () => {
    state.accountType = input.value as AccountType;
    state.tier = undefined;
    state.billing = undefined;
    tierInputs.forEach((item) => { item.checked = false; });
    billingInputs.forEach((item) => { item.checked = false; });
    resetAfterPlanChange("Your plan changed. Apply the coupon again.");
  }));

  tierInputs.forEach((input) => input.addEventListener("change", () => {
    state.tier = input.value as TierKey;
    state.billing = undefined;
    billingInputs.forEach((item) => { item.checked = false; });
    resetAfterPlanChange("Your plan changed. Apply the coupon again.");
  }));

  billingInputs.forEach((input) => input.addEventListener("change", () => {
    state.billing = input.value as BillingKey;
    resetAfterPlanChange("Your plan changed. Apply the coupon again.");
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
    if (!plan || !code || !previewBaseUrl || getPartnerPromotion(partner, state.accountType)) return;
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
      if (!Number.isFinite(percentOff) || percentOff <= 0 || percentOff > 100) throw new Error("This plan requires a percentage-based coupon.");
      const discountedCents = plan.billing === "paygo"
        ? Math.round(plan.amountCents * (1 - percentOff / 100))
        : Math.round(Number(result.subscription?.discounted ?? result.total) * 100);
      if (!Number.isFinite(discountedCents)) throw new Error("The coupon response did not include a discounted subscription price.");
      const label = `${percentOff}% off${result.coupon?.duration === "repeating" && result.coupon?.duration_in_months ? ` for ${result.coupon.duration_in_months} months` : result.coupon?.duration === "once" ? " once" : ""}`;
      const setupFee = getSetupFeeCents(plan);
      appliedCoupon = {
        code,
        planKey: plan.key,
        originalRate: getPlanRate(plan),
        discountedRate: `${formatCents(discountedCents)}${plan.rateUnit}`,
        discountedDueToday: formatCents(discountedCents),
        note: setupFee
          ? `${label} applies to subscription billing after research. The ${formatCents(setupFee)} research fee is unchanged.`
          : `${label} applied to your ${plan.billing === "paygo" ? "assessment rate" : "subscription"}.`,
      };
      setCouponStatus(`${label} applied.`, "success");
    } catch (error) {
      appliedCoupon = null;
      setCouponStatus(error instanceof Error ? error.message : "Unable to validate this coupon right now.", "error");
    } finally {
      couponLoading = false;
      renderSummary();
    }
  });

  function detailsPayload() {
    return Object.fromEntries(registrationFields.map((field) => [field.name, field.value.trim()])) as Record<string, string>;
  }

  function validateDetails() {
    showError();
    for (const field of registrationFields) {
      field.removeAttribute("aria-invalid");
      if (!field.checkValidity()) {
        field.setAttribute("aria-invalid", "true");
        field.reportValidity();
        return false;
      }
    }
    const values = detailsPayload();
    if (values.password !== values.password_confirmation) {
      showError("The password confirmation does not match.");
      return false;
    }
    return true;
  }

  async function loadStripeScript() {
    if (window.Stripe) return;
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Unable to load Stripe.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load Stripe."));
      document.head.append(script);
    });
  }

  async function startRegistration() {
    const plan = selectedPlan();
    const apiUrl = root.dataset.registrationApiUrl;
    if (!plan || !state.accountType || !apiUrl || !validateDetails()) return;
    checkoutLoading = true;
    renderSummary();
    showError();
    try {
      const response = await fetch(`${apiUrl}/start`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ ...detailsPayload(), account_type: state.accountType, plan: plan.key, partner }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const firstError = Object.values(result.errors ?? {}).flat()[0];
        throw new Error(typeof firstError === "string" ? firstError : result.message || "Unable to create your account.");
      }
      registration = { accountId: result.account_id, token: result.registration_token };
      await loadStripeScript();
      if (!window.Stripe) throw new Error("Unable to initialize Stripe.");
      stripe = window.Stripe(result.stripe_publishable_key);
      stripeElements = stripe.elements({ clientSecret: result.setup_intent_client_secret, appearance: { theme: "stripe" } });
      stage = "payment";
      render();
      const paymentElement = stripeElements.create("payment");
      paymentElement.mount(root.querySelector<HTMLElement>("[data-payment-element]"));
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      showError(error instanceof Error ? error.message : "Unable to start checkout.");
    } finally {
      checkoutLoading = false;
      renderSummary();
    }
  }

  async function completeRegistration() {
    const apiUrl = root.dataset.registrationApiUrl;
    if (!registration || !stripe || !stripeElements || !apiUrl) return;
    checkoutLoading = true;
    showError();
    renderSummary();
    try {
      const setup = await stripe.confirmSetup({ elements: stripeElements, redirect: "if_required" });
      if (setup.error) throw setup.error;
      if (!setup.setupIntent?.payment_method) throw new Error("Stripe did not return a payment method. Please try again.");
      const response = await fetch(`${apiUrl}/${registration.accountId}/checkout`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_token: registration.token,
          payment_method: setup.setupIntent.payment_method,
          coupon_code: couponIsCurrent() ? couponCode() : null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 202 && result.requires_action) {
        const payment = await stripe.confirmPayment({ clientSecret: result.payment_intent_client_secret, redirect: "if_required" });
        if (payment.error) throw payment.error;
        const completedResponse = await fetch(`${apiUrl}/${registration.accountId}/complete`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ completion_token: result.completion_token }),
        });
        const completed = await completedResponse.json().catch(() => ({}));
        if (!completedResponse.ok) throw new Error(completed.message || "Unable to confirm the completed payment.");
        window.location.assign(completed.redirect);
        return;
      }
      if (!response.ok) {
        const firstError = Object.values(result.errors ?? {}).flat()[0];
        throw new Error(typeof firstError === "string" ? firstError : result.message || "Unable to complete registration.");
      }
      window.location.assign(result.redirect);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Unable to complete registration.");
      checkoutLoading = false;
      renderSummary();
    }
  }

  continueButton?.addEventListener("click", async () => {
    if (stage === "plan") {
      stage = "details";
      showError();
      render();
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (stage === "details") {
      await startRegistration();
    } else {
      await completeRegistration();
    }
  });

  root.querySelector<HTMLButtonElement>("[data-checkout-back]")?.addEventListener("click", () => {
    stage = "plan";
    showError();
    render();
  });
  root.querySelector<HTMLButtonElement>("[data-payment-back]")?.addEventListener("click", () => window.location.reload());

  render();
}

document.querySelectorAll<HTMLElement>("[data-pricing-configurator]").forEach(initializePricing);
