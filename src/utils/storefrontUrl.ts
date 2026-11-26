const configuredStorefrontUrl = import.meta.env.VITE_STOREFRONT_URL?.trim();

export function storefrontUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (configuredStorefrontUrl) {
    return `${configuredStorefrontUrl.replace(/\/+$/, "")}${normalizedPath}`;
  }

  const storefront = new URL(window.location.origin);
  if (["localhost", "127.0.0.1"].includes(storefront.hostname)) {
    storefront.hostname = "127.0.0.1";
    storefront.port = "5173";
  } else {
    storefront.hostname = storefront.hostname.replace(/^admin\./i, "");
  }

  return `${storefront.origin}${normalizedPath}`;
}

export function storefrontHomeUrl(): string {
  return storefrontUrl("/");
}
