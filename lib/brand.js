export const BRAND = {
  name: 'POA DUBAI',
  descriptor: 'Worldwide · Dubai · UAE',
  domain: 'https://poadubai.eu',
  email: 'info@poadubai.eu',
  phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  addressText: 'Business Bay, Dubai, United Arab Emirates',
  address: { streetAddress: 'Business Bay', addressLocality: 'Dubai', addressCountry: 'AE' },
};

export { SERVICE_SLUGS } from './serviceCatalog';
export { getEnabledServiceSlugs, isServiceEnabled, isGroupEnabled } from './serviceAvailability';
