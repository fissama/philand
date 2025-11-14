import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

export default withNextIntl(nextConfig);
