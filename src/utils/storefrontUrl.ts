const configuredStorefrontUrl = import.meta.env.VITE_STOREFRONT_URL?.trim();

export function storefrontHomeUrl(): string {
  if (configuredStorefrontUrl) {
    return `${configuredStorefrontUrl.replace(/\/+$/, "")}/`;
  }

  const storefront = new URL(window.location.origin);
  if (["localhost", "127.0.0.1"].includes(storefront.hostname)) {
    storefront.port = "5173";
  } else {
    storefront.hostname = storefront.hostname.replace(/^admin\./i, "");
  }

  return `${storefront.origin}/`;
}
