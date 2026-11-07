import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const allowSignup = (env.VITE_ALLOW_SIGNUP || env.ALLOW_SIGNUP || 'true') !== 'false';

  return {
    define: {
      'import.meta.env.VITE_ALLOW_SIGNUP': JSON.stringify(String(allowSignup)),
      'import.meta.env.ALLOW_SIGNUP': JSON.stringify(String(allowSignup)),
    },
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
            'motion-vendor': ['framer-motion', 'gsap', 'lenis'],
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
