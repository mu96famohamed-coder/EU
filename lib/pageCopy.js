
import uiData from './uiCopy.json';
import contactCopy from './contactCopy.json';
export function pageCopy(lang,m={}){
 const u=uiData[lang]||uiData.en, f=u.form;
 return {
  contactTitle:u.contactBrand,
  contactLead:contactCopy[lang]?.lead||m.sub||u.directoryIntro,
  email:m.mail||'Email', phone:m.wa||u.contact,
  formTitle:u.contact,
  name:f[0],emailField:f[1],phoneField:f[2],location:f[3],service:f[4],message:f[5],send:f[6],privacy:f[7],back:f[8],
  faqTitle:m.faqLabel||u.faq, faqLead:m.sub||u.directoryIntro
 };
}
