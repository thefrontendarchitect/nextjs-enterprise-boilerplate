export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'hi'] as const,
  cookieName: 'app-locale',
  cookieOptions: {
    httpOnly: false, // Allow client-side reading
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: '/',
  },
} as const;

export type Locale = (typeof i18nConfig.locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  hi: 'हिन्दी',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  hi: '🇮🇳',
};

export function isValidLocale(locale: string): locale is Locale {
  return i18nConfig.locales.includes(locale as Locale);
}