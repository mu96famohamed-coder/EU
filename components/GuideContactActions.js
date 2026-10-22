import Link from 'next/link';
import WhatsAppIcon from './WhatsAppIcon';
const emailLabels = {"ar": "إرسال بريد إلكتروني", "en": "Send an email", "sv": "Skicka e-post", "de": "E-Mail senden", "fr": "Envoyer un e-mail", "es": "Enviar correo", "it": "Invia un’e-mail", "nl": "E-mail sturen", "da": "Send e-mail", "no": "Send e-post", "fi": "Lähetä sähköposti", "pt": "Enviar e-mail", "pl": "Wyślij e-mail", "cs": "Poslat e-mail", "sk": "Poslať e-mail", "ro": "Trimite e-mail", "hu": "E-mail küldése", "bg": "Изпратете имейл", "el": "Αποστολή email", "et": "Saada e-kiri", "hr": "Pošaljite e-poštu", "ru": "Написать письмо", "lt": "Siųsti el. laišką", "lv": "Sūtīt e-pastu", "is": "Senda tölvupóst", "mt": "Ibgħat email", "sl": "Pošlji e-pošto", "tr": "E-posta gönder", "ga": "Seol ríomhphost", "sr": "Пошаљите имејл", "uk": "Надіслати лист", "sq": "Dërgo email"};
export default function GuideContactActions({lang}) {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const url = number ? `https://wa.me/${number}` : null;
  return <div className="guide-contact-actions">
    {url ? <a className="btn whatsapp-site-cta guide-whatsapp" href={url} target="_blank" rel="noopener noreferrer"><WhatsAppIcon/><span>WhatsApp</span></a> : <span className="btn whatsapp-site-cta guide-whatsapp whatsapp-disabled" aria-disabled="true"><WhatsAppIcon/><span>WhatsApp</span></span>}
    <Link className="btn guide-email" href={`/${lang}/contact`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg><span>{emailLabels[lang] || emailLabels.en}</span></Link>
  </div>;
}
