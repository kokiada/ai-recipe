import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'anthropic-api-cache',
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      }
    ]
  },
  ...nextConfig
});
