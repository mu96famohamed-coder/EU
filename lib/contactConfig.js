// Public contact details: safe to include in both server and browser bundles.
// Keep the default in source so a new deployment works without private env files.
export const DEFAULT_WHATSAPP_NUMBER = '971541303166';
const configuredNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
export const WHATSAPP_NUMBER = configuredNumber || DEFAULT_WHATSAPP_NUMBER;
