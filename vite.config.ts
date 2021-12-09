// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'
import typescript from '@rollup/plugin-typescript'

const resolvePath = (str: string) => path.resolve(__dirname, str)

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'EveEsiSwaggerTs',
      fileName: (format) => `eve-esi-swaggerts.${format}.js`
    },
    rollupOptions: {
      plugins: [
        typescript({
          'target': 'esnext',
          'rootDir': resolvePath('src'),
          'declaration': true,
          'declarationDir': resolvePath('dist'),
          exclude: resolvePath('node_modules/**'),
          allowSyntheticDefaultImports: true
        })
      ]
    }
  }
})
