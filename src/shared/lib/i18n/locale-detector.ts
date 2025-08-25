import { i18nConfig, isValidLocale, type Locale } from './config';

// Parse Accept-Language header
function parseAcceptLanguage(acceptLanguage: string): string[] {
  return acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale] = lang.trim().split(';');
      return locale.split('-')[0].toLowerCase();
    })
    .filter(Boolean);
}

// Negotiate locale from Accept-Language header
function negotiateLocale(
  acceptLanguage: string,
  availableLocales: readonly string[]
): Locale | null {
  const requestedLocales = parseAcceptLanguage(acceptLanguage);
  
  for (const requested of requestedLocales) {
    if (availableLocales.includes(requested)) {
      return requested as Locale;
    }
  }
  
  return null;
}

// Map country codes to locales (optional, can be expanded)
function countryToLocale(country: string | null): string | null {
  if (!country) return null;
  
  const countryMap: Record<string, Locale> = {
    US: 'en',
    GB: 'en',
    CA: 'en',
    AU: 'en',
    ES: 'es',
    MX: 'es',
    AR: 'es',
    IN: 'hi',
  };
  
  return countryMap[country.toUpperCase()] || null;
}

export function detectLocale(request: Request): Locale {
  // 1. Check explicit query parameter (for language switcher)
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get('locale');
  if (queryLocale && isValidLocale(queryLocale)) {
    return queryLocale;
  }

  // 2. Check cookie preference (will be handled by middleware)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, value] = c.trim().split('=');
        return [key, value];
      })
    );
    const cookieLocale = cookies[i18nConfig.cookieName];
    if (cookieLocale && isValidLocale(cookieLocale)) {
      return cookieLocale;
    }
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const detectedLocale = negotiateLocale(acceptLanguage, i18nConfig.locales);
    if (detectedLocale) {
      return detectedLocale;
    }
  }

  // 4. Check geo-location (optional - Vercel/Cloudflare specific)
  const country = request.headers.get('x-vercel-ip-country') || 
                  request.headers.get('cf-ipcountry');
  const geoLocale = countryToLocale(country);
  if (geoLocale && isValidLocale(geoLocale)) {
    return geoLocale;
  }

  // 5. Default fallback
  return i18nConfig.defaultLocale;
}