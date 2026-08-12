import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  integrations: [svelte()],
  vite: {
    plugins: [
      VitePWA({
        injectRegister: false,
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.svg',
          'robots.txt',
          'icon-192.png',
          'icon-512.png',
        ],
        manifest: {
          name: 'Pasaporte El Oro',
          short_name: 'Pasaporte',
          description: 'Pasaporte turístico digital inmersivo de El Oro, Pueblo Mágico Minero',
          theme_color: '#8B5A2B',
          background_color: '#F5F0E8',
          display: 'standalone',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          globPatterns: [
            '**/*.{html,js,css,svg,png,jpg,mp3,json,woff2}',
            // Incluir archivos de datos geográficos
            'data/**/*.json',
          ],
          // Opcional: agregar runtimeCaching para Firebase Storage (no necesario si ya precacheamos)
        },
      }),
    ],
  },
});