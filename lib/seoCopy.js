import copy from './seoCopy.json';
export function getSeoCopy(lang) {
  const [contactDescription,faqDescription,blogDescription,searchLoading,addressLabel]=copy[lang]||copy.en;
  return {contactDescription,faqDescription,blogDescription,searchLoading,addressLabel};
}
