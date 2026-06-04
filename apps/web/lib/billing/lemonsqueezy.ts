export async function createCheckout(
  userId: string,
  userEmail: string,
  variantId: string,
  couponCode?: string,
): Promise<string> {
  // Development mode: return mock checkout URL when LemonSqueezy credentials are missing
  if (!process.env.LEMONSQUEEZY_API_KEY || !process.env.LEMONSQUEEZY_STORE_ID) {
    return "__coming_soon__";
  }

  const checkoutData: Record<string, unknown> = {
    email: userEmail,
    custom: { user_id: userId, ...(couponCode ? { coupon_code: couponCode } : {}) },
    ...(couponCode ? { discount_code: couponCode } : {}),
  };

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: checkoutData,
          product_options: {
            redirect_url: "https://gradifyhub.com/dashboard?payment=success",
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: process.env.LEMONSQUEEZY_STORE_ID },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LemonSqueezy checkout creation failed: ${response.status} ${text}`);
  }

  const json = await response.json();
  const url: string = json?.data?.attributes?.url;
  if (!url) {
    throw new Error("LemonSqueezy response missing checkout URL");
  }
  return url;
}

export function getPlanFromVariantId(variantId: string): "pro" {
  if (variantId === process.env.LEMONSQUEEZY_VARIANT_PRO) return "pro";
  // Fallback: unknown variants map to pro
  return "pro";
}
