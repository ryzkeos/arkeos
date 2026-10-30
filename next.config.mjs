const originOf = (value) => {
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
};

const apiOrigin = originOf(process.env.NEXT_PUBLIC_DATA_API_URL);
const storageOrigin = originOf(process.env.NEXT_PUBLIC_STORAGE_URL) || apiOrigin;
const isProd = process.env.NODE_ENV === "production";

const join = (...parts) => parts.filter(Boolean).join(" ");

const csp = [
  "default-src 'self'",
  join("script-src 'self' 'unsafe-inline'", !isProd && "'unsafe-eval'"),
  "style-src 'self' 'unsafe-inline'",
  join("img-src 'self' data: blob:", storageOrigin),
  join("media-src 'self' blob:", storageOrigin),
  join("font-src 'self' data:", storageOrigin),
  join("connect-src 'self'", apiOrigin, storageOrigin !== apiOrigin && storageOrigin),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isProd && "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin", headers: noindex },
      { source: "/admin/:path*", headers: noindex },
    ];
  },
};

export default nextConfig;
