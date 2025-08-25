import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18nConfig } from '@/shared/lib/i18n/config';
import { detectLocale } from '@/shared/lib/i18n/locale-detector';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Detect locale
  const locale = detectLocale(request);
  
  // Set locale cookie if not present or different
  const currentCookie = request.cookies.get(i18nConfig.cookieName);
  if (!currentCookie || currentCookie.value !== locale) {
    response.cookies.set(
      i18nConfig.cookieName,
      locale,
      i18nConfig.cookieOptions
    );
  }
  
  // Add locale to headers for server components
  response.headers.set('x-locale', locale);
  
  return response;
}

export const config = {
  matcher: [
    // Skip static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/|translations/).*)',
  ],
};