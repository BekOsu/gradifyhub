type SearchParamsLike = Pick<URLSearchParams, "get">;

export function normalizeRelativeRedirect(target: string | null | undefined, fallback = "/dashboard") {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }

  return target;
}

export function buildPricingUpgradeRedirect(plan: string | null | undefined, coupon?: string | null) {
  if (plan !== "pro") return null;

  const params = new URLSearchParams({ plan });
  if (coupon) params.set("coupon", coupon);

  return `/pricing?${params.toString()}`;
}

export function resolveAuthCallbackURL(searchParams: SearchParamsLike, fallback = "/dashboard") {
  const explicit = searchParams.get("from") ?? searchParams.get("next");
  const pricingIntent = buildPricingUpgradeRedirect(searchParams.get("plan"), searchParams.get("coupon"));

  return normalizeRelativeRedirect(explicit ?? pricingIntent, fallback);
}
