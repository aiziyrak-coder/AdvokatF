import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          overlay: false, // Disable error overlay to prevent crashes
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      css: {
        postcss: {
          plugins: [
            tailwindcss,
            autoprefixer,
          ],
        },
      },
      optimizeDeps: {
        include: ['pdfjs-dist'],
        exclude: ['@google/genai'],
      },
      build: {
        rollupOptions: {
          onwarn(warning, warn) {
            // Suppress privileged instruction warnings
            if (warning.code === 'EVAL' || warning.message?.includes('STATUS_PRIVILEGED_INSTRUCTION')) {
              return;
            }
            warn(warning);
          },
        },
      },
    };
});
