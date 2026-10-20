// Shopify Storefront API cart for the made-to-order ring deposit.
// The deposit product is a fixed-price variant; the ring configuration travels
// as line item attributes, and the balance is invoiced in store after confirmation.
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_DOMAIN = "burrows-jewellers.myshopify.com";
const STOREFRONT_URL = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const STOREFRONT_TOKEN = "6bdfc446c2bd3ef183e1fedafdda6aa2"; // public storefront token

export const DEPOSIT_VARIANT_ID = "gid://shopify/ProductVariant/56711642382641";
export const DEPOSIT_AUD = 200;

const CART_CREATE = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

function formatCheckoutUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("channel", "online_store");
    return u.toString();
  } catch {
    return url;
  }
}

/** Creates a Shopify cart holding the deposit with the ring configuration attached,
 *  and returns the checkout URL to open in a new tab. */
export async function createDepositCart(attributes: { key: string; value: string }[]): Promise<string> {
  const res = await fetch(STOREFRONT_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN },
    body: JSON.stringify({
      query: CART_CREATE,
      variables: { input: { lines: [{ quantity: 1, merchandiseId: DEPOSIT_VARIANT_ID, attributes }] } },
    }),
  });
  if (!res.ok) throw new Error(`Shopify checkout unavailable (${res.status})`);
  const data = await res.json();
  const errs = data?.data?.cartCreate?.userErrors;
  if (data?.errors || (Array.isArray(errs) && errs.length)) {
    throw new Error(errs?.[0]?.message ?? data?.errors?.[0]?.message ?? "Shopify checkout unavailable");
  }
  const url = data?.data?.cartCreate?.cart?.checkoutUrl;
  if (typeof url !== "string" || !url) throw new Error("Shopify checkout unavailable");
  return formatCheckoutUrl(url);
}
