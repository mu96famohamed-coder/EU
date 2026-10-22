import { CODES } from './i18n';
// All published languages are eligible for indexing. Do not conflate editorial QA with indexability.
export const SEARCH_READY_LOCALES = CODES;
export const isSearchReady = (lang) => CODES.includes(lang);
