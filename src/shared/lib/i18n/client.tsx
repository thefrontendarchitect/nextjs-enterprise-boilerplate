'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { i18nConfig, type Locale } from './config';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale: Locale;
  initialMessages: Record<string, any>;
}

export function I18nProvider({ 
  children, 
  initialLocale,
  initialMessages 
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Record<string, any>>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loadTranslations = useCallback(async (newLocale: Locale) => {
    try {
      const response = await fetch(`/translations/${newLocale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${newLocale}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Try dynamic import as fallback
      try {
        const module = await import(`@/translations/${newLocale}.json`);
        return module.default || module;
      } catch {
        return {};
      }
    }
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    if (newLocale === locale) return;
    
    setIsLoading(true);
    try {
      // Update cookie with js-cookie compatible options
      Cookies.set(i18nConfig.cookieName, newLocale, {
        expires: 365, // days
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      // Load new translations
      const newMessages = await loadTranslations(newLocale);
      
      // Update state
      setMessages(newMessages);
      setLocaleState(newLocale);
      
      // Refresh the page to update server components
      router.refresh();
    } catch (error) {
      console.error('Failed to change locale:', error);
    } finally {
      setIsLoading(false);
    }
  }, [locale, loadTranslations, router]);

  const t = useCallback((key: string, params?: Record<string, any>): string => {
    // Support dot notation for nested keys
    const keys = key.split('.');
    let value: any = messages;
    
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
  }, [messages]);

  // Sync with cookie changes (e.g., from other tabs)
  useEffect(() => {
    const checkCookie = () => {
      const cookieLocale = Cookies.get(i18nConfig.cookieName) as Locale | undefined;
      if (cookieLocale && cookieLocale !== locale && i18nConfig.locales.includes(cookieLocale)) {
        setLocale(cookieLocale);
      }
    };

    // Check on focus
    window.addEventListener('focus', checkCookie);
    
    return () => {
      window.removeEventListener('focus', checkCookie);
    };
  }, [locale, setLocale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}