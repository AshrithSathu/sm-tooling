export function getCookieUrlFromDomain(domain: string) {
  return new URL(domain).hostname;
}
