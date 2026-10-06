/** @type {import('next').NextConfig} */
const config = process.env.STATIC_EXPORT === '1' ? {
  output: 'export',
  distDir: '.next-static',
  images: { unoptimized: true },
} : {};

export default config;
