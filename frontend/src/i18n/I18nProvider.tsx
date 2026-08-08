import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import en from "./en.json";
import es from "./es.json";

export type Language = "en" | "es";
export type DataDragonLocale = "en_US" | "es_ES";
export type TranslationKey = keyof typeof en;
type TranslationValues = Record<string, string | number>;

interface I18nValue {
  language: Language;
  dataDragonLocale: DataDragonLocale;
  locale: "en-US" | "es-ES";
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
}

const STORAGE_KEY = "wikilol-language";
const catalogs: Record<Language, Record<TranslationKey, string>> = { en, es };
const I18nContext = createContext<I18nValue | null>(null);

export function resolveLanguage(
  storedLanguage: string | null,
  browserLanguages: readonly string[],
): Language {
  if (storedLanguage === "en" || storedLanguage === "es") {
    return storedLanguage;
  }

  return browserLanguages.some((language) =>
    language.toLocaleLowerCase().startsWith("es"),
  )
    ? "es"
    : "en";
}

function initialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  return resolveLanguage(
    window.localStorage.getItem(STORAGE_KEY),
    window.navigator.languages,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nValue>(() => {
    const locale = language === "es" ? "es-ES" : "en-US";
    const dataDragonLocale = language === "es" ? "es_ES" : "en_US";

    return {
      language,
      locale,
      dataDragonLocale,
      setLanguage,
      t: (key, values) => {
        const translation = catalogs[language][key] ?? catalogs.en[key];
        if (!values) return translation;
        return Object.entries(values).reduce(
          (result, [name, replacement]) =>
            result.replaceAll(`{${name}}`, String(replacement)),
          translation,
        );
      },
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
