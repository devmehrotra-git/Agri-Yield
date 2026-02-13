import React from 'react';
import { Language } from '../types';

interface Props {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSelector: React.FC<Props> = ({ currentLang, onLanguageChange }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
      {Object.values(Language).map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`px-4 py-1.5 rounded-full text-sm font-black whitespace-nowrap transition-all ${
            currentLang === lang
              ? 'bg-agri-600 text-white shadow-md shadow-agri-200 dark:shadow-agri-950'
              : 'bg-white dark:bg-agri-800 text-agri-800 dark:text-agri-300 border border-agri-200 dark:border-agri-700 hover:bg-agri-50 dark:hover:bg-agri-700'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;