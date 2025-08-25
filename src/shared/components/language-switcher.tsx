'use client';

import { useI18n } from '@/shared/lib/i18n/client';
import { localeNames, localeFlags, type Locale } from '@/shared/lib/i18n/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export function LanguageSwitcher() {
  const { locale, setLocale, isLoading } = useI18n();

  return (
    <Select 
      value={locale} 
      onValueChange={(value) => setLocale(value as Locale)}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(localeNames).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span>{localeFlags[code as Locale]}</span>
              <span>{name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}