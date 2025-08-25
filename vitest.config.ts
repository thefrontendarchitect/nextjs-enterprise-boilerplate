import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.ts',
        '*.config.js',
        '.next/',
        'coverage/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/shared/components'),
      '@/lib': path.resolve(__dirname, './src/shared/lib'),
      '@/modules': path.resolve(__dirname, './src/modules'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@/types': path.resolve(__dirname, './src/shared/types'),
      '@/services': path.resolve(__dirname, './src/shared/services'),
      '@/stores': path.resolve(__dirname, './src/shared/stores'),
    },
  },
});