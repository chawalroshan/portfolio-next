/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Only Vercel Blob hosts are optimizable. The previous `**` wildcard let
    // the Image Optimizer fetch arbitrary remote hosts (cache-fill / SSRF
    // adjacent). Cover/project images render via plain <img> (unoptimized),
    // so narrowing this changes nothing visually — add explicit hosts here if
    // you ever need next/image optimization for a specific CDN.
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  // NOTE: no Content-Security-Policy here on purpose — the site styles itself
  // with inline `style={}` props everywhere, so any CSP without 'unsafe-inline'
  // would break all UI. These headers harden framing/sniffing without touching
  // rendering.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
