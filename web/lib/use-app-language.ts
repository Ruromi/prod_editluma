"use client";

import { useEffect, useState } from "react";
import {
  LANDING_LANGUAGE_EVENT,
  normalizeLandingLanguage,
  readBrowserLandingLanguage,
  type HeaderLanguage,
} from "@/lib/landing-language";

export function useAppLanguage(initialLanguage: HeaderLanguage = "en") {
  const [language, setLanguage] = useState<HeaderLanguage>(initialLanguage);

  useEffect(() => {
    setLanguage(readBrowserLandingLanguage());

    function handleLanguageChange(event: Event) {
      const nextLanguage = (event as CustomEvent<{ language?: string }>).detail?.language;
      setLanguage(normalizeLandingLanguage(nextLanguage));
    }

    window.addEventListener(LANDING_LANGUAGE_EVENT, handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener(LANDING_LANGUAGE_EVENT, handleLanguageChange as EventListener);
    };
  }, []);

  return language;
}
