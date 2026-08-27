import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
  build: {
    cssMinify: true,
    minify: true,
    assetsInlineLimit: 8192,
  },
})
