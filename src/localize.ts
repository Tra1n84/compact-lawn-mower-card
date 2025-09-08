import { HomeAssistant } from 'custom-card-helpers';
import type { Translation } from './localize/types';
import en from './localize/en.json';
import de from './localize/de.json';

const languages: Record<string, Translation> = {
  en,
  de,
};

interface LocalizeOptions {
  search?: string;
  replace?: string;
  hass?: HomeAssistant;
}

const getLanguage = (hass?: HomeAssistant): string => {
  const lang = hass?.locale?.language || hass?.language || localStorage.getItem('selectedLanguage') || navigator.language || 'en';
  return lang.split('-')[0].toLowerCase();
}

const getNestedProperty = (obj: Translation, path: string): string | undefined => {
  const value = path.split('.').reduce<string | Translation | undefined>((o, i) => (o && typeof o === 'object' ? (o as Translation)[i] : undefined), obj);

  return typeof value === 'string' ? value : undefined;
};
export const localize = (
  key: string,
  options: LocalizeOptions = {}
): string => {
  const { hass, search, replace } = options;
  const lang = getLanguage(hass);
  const source = languages[lang] ?? languages.en;

  let translated = getNestedProperty(source, key);

  if (translated === undefined && lang !== 'en') {
    translated = getNestedProperty(languages.en, key);
  }

  if (translated === undefined) {
    console.warn(`Translation not found for key: ${key}`);
    return key;
  }

  if (search && replace) {
    translated = translated.replace(new RegExp(search, 'g'), replace);
  }

  return translated;
};