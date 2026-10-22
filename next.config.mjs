const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
];
export default async function nextConfig(phase) {
  if (phase === 'phase-production-build' && !process.env.INTERNAL_POA_SITEMAP_PREPARED) {
    const {prepareSitemap} = await import('./scripts/prepare-sitemap.mjs');
    await prepareSitemap();
    process.env.INTERNAL_POA_SITEMAP_PREPARED = '1';
  }
  return {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() { return [
    { source: '/:path*', headers: securityHeaders },
    { source: '/sitemap-state.json', headers: [{key:'X-Robots-Tag',value:'noindex, follow'},{key:'Cache-Control',value:'public, max-age=0, must-revalidate'}] },
  ]; },
  };
}
