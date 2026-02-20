import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const username = env.VITE_GPS_DOZOR_USERNAME || 'api_gpsdozor'
  const password = env.VITE_GPS_DOZOR_PASSWORD || 'yakmwlARdn'
  const auth = btoa(`${username}:${password}`)

  return {
    plugins: [vue(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'https://a1.gpsguard.eu/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: true,
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
        '/windy': {
          target: 'https://api.windy.com/webcams/api/v3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/windy/, ''),
          secure: true,
          headers: {
            'x-windy-api-key': env.VITE_WINDY_API_KEY || '',
          },
        },
      },
    },
  }
})
