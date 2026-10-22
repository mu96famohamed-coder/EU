'use client';

import WhatsAppIcon from './WhatsAppIcon';

export default function FloatingActions({ whatsappLabel = 'WhatsApp' }) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const waHref = number ? `https://wa.me/${number.replace(/\D/g, '')}` : null;

  return (
    <div className="floating-actions" aria-label="Quick actions">
      <button className="float-action top-action" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" title="Back to top">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.7 14.7 12 9.4l5.3 5.3 1.4-1.4L12 6.6l-6.7 6.7 1.4 1.4Z"/></svg>
      </button>
      {waHref ? <a className="float-action whatsapp-action" href={waHref} target="_blank" rel="noopener noreferrer" aria-label={whatsappLabel} title={whatsappLabel}><WhatsAppIcon/></a> : <span className="float-action whatsapp-action whatsapp-disabled" aria-disabled="true"><WhatsAppIcon/></span>}
    </div>
  );
}
