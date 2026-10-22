import { SERVICES, SERVICE_SLUGS } from './serviceCatalog';
// Central availability controls for all 32 languages.
// Set a service or group to false to remove it from navigation, search, sitemap,
// direct service routes and internal links. Content text is never deleted.

export const SERVICE_GROUPS_ENABLED = {
  poa: true,
  property: true,
  company: true,
  vehicle: true,
  notary: true,
  notices: true,
  rental: true,
  apostille: false,
};

export const SERVICES_ENABLED = {
  'general-power-of-attorney': true,
  'special-power-of-attorney': true,
  'power-of-attorney-from-abroad': true,
  'poa-online-notarisation': true,
  'poa-revocation-cancellation': true,
  'court-representation-poa': true,
  'inheritance-power-of-attorney': true,
  'child-travel-consent-poa': true,
  'bank-account-power-of-attorney': true,
  'property-sale-poa': true,
  'property-purchase-poa': true,
  'property-management-poa': true,
  'property-handover-poa': true,
  'property-gift-transfer': true,
  'corporate-power-of-attorney': true,
  'company-incorporation-poa': true,
  'company-management-poa': true,
  'company-shares-poa': true,
  'vat-tax-poa': true,
  'moa-drafting-notarisation': true,
  'moa-amendment': true,
  'board-resolution-notarisation': true,
  'share-sale-assignment': true,
  'company-liquidation-documents': true,
  'vehicle-power-of-attorney': true,
  'vehicle-sale-poa': true,
  'vehicle-purchase-poa': true,
  'vehicle-export-poa': true,
  'contract-notarisation': true,
  'affidavits-declarations': true,
  'debt-acknowledgement': true,
  'signature-approval': true,
  'legal-notices': true,
  'non-muslim-wills': true,
  'fast-track-notary': true,
  'apostille': true,
  'certified-true-copy': true,
  'certified-translation': true,
  'eviction-notice-property-sale': true,
  'eviction-notice-personal-use': true,
  'eviction-notice-demolition': true,
  'rent-nonpayment-notice': true,
  'poa-cancellation-notice': true,
  'rental-dispute-resolution': true,
  'rental-eviction-case': true,
  'rental-claim': true,
  'bounced-rent-cheque': true,
  'rental-judgment-enforcement': true,
  'mohre-power-of-attorney': true,
  'company-bank-account-poa': true,
  'vehicle-management-poa': true,
  'shareholder-agreement': true,
  'mofa-attestation': true,
  'embassy-attestation': true,
  'education-certificate-attestation': true,
  'marriage-certificate-attestation': true,
  'mobile-notary-dubai': true,
  'court-document-translation': true,
  'rdc-offer-and-deposit': true,
  'rdc-tenancy-renewal': true,
  'rdc-case-defence': true,
  'rdc-urgent-orders': true,
  'rdc-execution-e-requests': true,
};

export function isGroupEnabled(category) {
  return SERVICE_GROUPS_ENABLED[category] !== false;
}

export function isServiceEnabled(slug) {
  const row = SERVICES.find(([serviceSlug]) => serviceSlug === slug);
  if (!row) return false;
  return SERVICES_ENABLED[slug] !== false && isGroupEnabled(row[1]);
}

export function getEnabledServiceSlugs() {
  return SERVICE_SLUGS.filter(isServiceEnabled);
}
