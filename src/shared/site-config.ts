const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://gemoirejewels.example";

export const SITE_ORIGIN = configuredOrigin.replace(/\/+$/, "");

export function siteUrl(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${path}`;
}

export function normalizeSiteCanonical(canonical: string | undefined, pathname: string) {
  if (!canonical) return siteUrl(pathname);
  try {
    const parsed = new URL(canonical);
    return parsed.hostname.endsWith(".example")
      ? siteUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`)
      : canonical;
  } catch {
    return siteUrl(pathname);
  }
}
