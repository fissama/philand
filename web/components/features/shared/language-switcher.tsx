'use client';

import { useLocale } from 'next-intl';
import { usePathname } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';

const languages = [
  { code: 'en', name: 'ENG', flag: '🇺🇸' },
  { code: 'vi', name: 'VIE', flag: '🇻🇳' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    console.log('=== LANGUAGE CHANGE TRIGGERED ===');
    console.log('Current locale:', locale);
    console.log('New locale:', newLocale);
    console.log('Pathname:', pathname);
    
    if (newLocale === locale) {
      console.log('Same locale, skipping');
      return;
    }

    // The pathname from next-intl already excludes the locale prefix
    const currentPath = pathname;
    
    // Build the new URL with the selected locale
    const newUrl = newLocale === 'en' 
      ? currentPath 
      : `/${newLocale}${currentPath}`;
    
    console.log('Navigating to:', newUrl);
    console.log('Current URL:', window.location.href);
    
    // Create a temporary anchor and click it (most reliable method)
    const link = document.createElement('a');
    link.href = newUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Navigation triggered via anchor click');
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px] h-9">
        <Languages className="h-4 w-4 mr-2" />
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{currentLanguage?.flag}</span>
            <span>{currentLanguage?.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
