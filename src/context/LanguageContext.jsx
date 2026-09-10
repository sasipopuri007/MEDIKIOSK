import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, translate } from '../locales/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('medikiosk_lang') || sessionStorage.getItem('preferredLanguageCode') || 'en';
  });

  const setLanguage = (code) => {
    setLanguageState(code);
    localStorage.setItem('medikiosk_lang', code);
    sessionStorage.setItem('preferredLanguageCode', code);
    
    // Find matching language object to save full name
    const langObj = LANGUAGES.find(l => l.code === code);
    if (langObj) {
      sessionStorage.setItem('preferredLanguage', langObj.name);
    }
  };

  const t = (key, params) => translate(language, key, params);

  const currentLanguageObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageObj, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
