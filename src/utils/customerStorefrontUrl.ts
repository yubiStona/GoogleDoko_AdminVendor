const configuredStorefrontUrl = import.meta.env.VITE_STOREFRONT_URL?.trim();

export function customerStorefrontUrl(path = "/login"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (configuredStorefrontUrl) {
    return `${configuredStorefrontUrl.replace(/\/+$/, "")}${normalizedPath}`;
  }

  const { protocol, hostname } = window.location;
  const local = hostname === "localhost" || hostname === "127.0.0.1";
  const storefrontOrigin = local
    ? `${protocol}//${hostname}:5173`
    : `${protocol}//${hostname.replace(/^admin\./, "")}`;
  return `${storefrontOrigin}${normalizedPath}`;
}
