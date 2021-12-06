const { generateApi } = require('swagger-typescript-api')
const path = require('path')
// const fs = require('fs')

/* NOTE: all fields are optional expect one of `output`, `url`, `spec` */
generateApi({
  name: 'index.ts',
  output: path.resolve(process.cwd(), './src'),
  url: 'https://esi.evetech.net/latest/swagger.json',
  // templates: path.resolve(process.cwd(), './api-templates'),
  httpClientType: 'fetch', // or "fetch"
  defaultResponseAsSuccess: false,
  generateRouteTypes: false,
  generateResponses: true,
  toJS: false,
  extractRequestParams: false,
  extractRequestBody: false,
  prettier: {
    printWidth: 120,
    tabWidth: 2,
    trailingComma: 'all',
    parser: 'typescript'
  },
  defaultResponseType: 'void',
  singleHttpClient: false,
  cleanOutput: false,
  enumNamesAsValues: false,
  moduleNameFirstTag: false,
  modular: false,
  generateUnionEnums: false,
  extraTemplates: [],
  hooks: {
    onCreateComponent: (component) => { },
    onCreateRequestParams: (rawType) => { },
    onCreateRoute: (routeData) => { },
    onCreateRouteName: (routeNameInfo, rawRouteInfo) => { },
    onFormatRouteName: (routeInfo, templateRouteName) => { },
    onFormatTypeName: (typeName, rawTypeName) => { },
    onInit: (configuration) => { },
    onParseSchema: (originalSchema, parsedSchema) => { },
    onPrepareConfig: (currentConfiguration) => { }
  }
})
