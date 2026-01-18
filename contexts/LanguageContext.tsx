// This feature has been reverted.
// This file is kept as a placeholder to ensure no breakages if cached, 
// but it should not be used in the application.

import React, { createContext, useContext } from 'react';

const LanguageContext = createContext<any>(null);

export const useLanguage = () => {
  return { t: (key: string) => key, language: 'en', setLanguage: () => {} };
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
