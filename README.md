# Poa Dubai (Next.js)

Next.js 15 (App Router), 32 languages, static generation per language.

    npm install
    npm run dev      # http://localhost:3000  (redirects / to the visitor's language)
    npm run build && npm start

- app/[lang]/ : home (services, FAQ), blog list, blog article pages (real URLs)
- messages/xx.json : all texts per language (edit here)
- middleware.js : sends / to the language from the browser's Accept-Language (fallback: en)
- app/sitemap.js, app/robots.js : sitemap with hreflang alternates, robots (domain poadubai.eu)
- lib/art.js : blog illustrations, publish dates (BD), payment marks (PAY) -> replace with the official logos
- Header logo (components/Header.js) is a placeholder: replace with the original SVG.
- Not built or tested in the environment where this was generated: run `npm run build` first.

## Service directory expansion
The homepage and static service routes are generated from `lib/serviceCatalog.js`.
Current catalogue: 54 services across Power of Attorney, Property & Real Estate, Company & Corporate, Vehicle, Notary & Legal Documents, and International Document Services.
Add or edit a service in the central catalogue rather than hard-coding homepage cards.
Apostille, legalisation and attestation are deliberately separate services because the correct route depends on issuing country, destination and receiving authority.

## Apostille scope (October 2026)
- Current document-origin market: Sweden.
- Destination SEO pages describe **Swedish documents for use in the destination country**.
- UAE is intentionally excluded from Apostille destinations and routed to UAE Document Attestation / Legalisation.
- Sweden's Apostille competent authorities are Notaries Public (Notarius Publicus).
- `lib/apostille.js` separates origin scope from destination SEO so new origin countries can be enabled later without restructuring routes.
- Before publishing/processing a case, verify current HCCH status, bilateral applicability, document type and receiving-authority requirements.
