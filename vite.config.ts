import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            // Intercepts all ASTD Wikia images and caches them locally
            urlPattern: /^https:\/\/static\.wikia\.nocookie\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'astd-unit-images',
              expiration: {
                maxEntries: 400,
                maxAgeSeconds: 60 * 60 * 24 * 30 // Caches for 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'ASTD Trading Server',
        short_name: 'ASTD Trades',
        description: 'Calculate and analyze ASTD unit trades.',
        theme_color: '#2B2D31',
        background_color: '#313338',
        display: 'standalone',
      }
    })
  ],
  build: {
    target: "esnext",
    minify: "esbuild",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "icons-vendor": ["lucide-react"],
        },
      },
    },
  },
});