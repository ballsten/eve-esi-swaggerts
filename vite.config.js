// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'EveEsiSwaggerTs',
      fileName: (format) => `eve-esi-swaggerts.${format}.js`
    }
  }
})
