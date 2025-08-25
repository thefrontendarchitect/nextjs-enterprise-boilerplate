import { headers, cookies } from 'next/headers';
import { cache } from 'react';
import { i18nConfig, isValidLocale, type Locale } from './config';

// Cache for request duration
export const getLocale = cache(async (): Promise<Locale> => {
  // Try headers first (set by middleware)
  const headersList = await headers();
  const headerLocale = headersList.get('x-locale');
  if (headerLocale && isValidLocale(headerLocale)) {
    return headerLocale;
  }
  
  // Fallback to cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(i18nConfig.cookieName)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }
  
  return i18nConfig.defaultLocale;
});

// Load translations for a specific locale
async function loadTranslations(locale: Locale): Promise<Record<string, any>> {
  try {
    const translations = await import(`@/translations/${locale}.json`);
    return translations.default || translations;
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to default locale
    if (locale !== i18nConfig.defaultLocale) {
      const defaultTranslations = await import(`@/translations/${i18nConfig.defaultLocale}.json`);
      return defaultTranslations.default || defaultTranslations;
    }
    return {};
  }
}

// Get translations for current locale
export async function getTranslations(namespace?: string) {
  const locale = await getLocale();
  const messages = await loadTranslations(locale);
  
  if (namespace) {
    return messages[namespace] || {};
  }
  
  return messages;
}

// Translation function for server components
export async function t(key: string, params?: Record<string, any>): Promise<string> {
  const translations = await getTranslations();
  
  // Support dot notation for nested keys
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return key as fallback
    }
  }
  
  // If value is not a string, return the key
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }
  
  // Replace parameters if provided
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param]?.toString() || match;
    });
  }
  
  return value;
}