"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "bn";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (en: string, bn: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "bunon_language";

const formatText = (template: string, vars?: Record<string, string | number>) => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "en" || saved === "bn") {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "bn" : "en");
  }, [language, setLanguage]);

  const t = useCallback(
    (en: string, bn: string, vars?: Record<string, string | number>) => {
      const base = language === "bn" ? bn : en;
      return formatText(base, vars);
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
