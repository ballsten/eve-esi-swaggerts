[eve-esi-swaggerts](../README.md) / [Exports](../modules.md) / HttpResponse

# Interface: HttpResponse<D, E\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `unknown` |
| `E` | extends `unknown` = `unknown` |

## Hierarchy

- `Response`

  ↳ **`HttpResponse`**

## Table of contents

### Properties

- [body](HttpResponse.md#body)
- [bodyUsed](HttpResponse.md#bodyused)
- [data](HttpResponse.md#data)
- [error](HttpResponse.md#error)
- [headers](HttpResponse.md#headers)
- [ok](HttpResponse.md#ok)
- [redirected](HttpResponse.md#redirected)
- [status](HttpResponse.md#status)
- [statusText](HttpResponse.md#statustext)
- [type](HttpResponse.md#type)
- [url](HttpResponse.md#url)

### Methods

- [arrayBuffer](HttpResponse.md#arraybuffer)
- [blob](HttpResponse.md#blob)
- [clone](HttpResponse.md#clone)
- [formData](HttpResponse.md#formdata)
- [json](HttpResponse.md#json)
- [text](HttpResponse.md#text)

## Properties

### body

• `Readonly` **body**: ``null`` \| `ReadableStream`<`Uint8Array`\>

#### Inherited from

Response.body

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:2402

___

### bodyUsed

• `Readonly` **bodyUsed**: `boolean`

#### Inherited from

Response.bodyUsed

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:2403

___

### data

• **data**: `D`

#### Defined in

[src/index.ts:106](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L106)

___

### error

• **error**: `E`

#### Defined in

[src/index.ts:107](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L107)

___

### headers

• `Readonly` **headers**: `Headers`

#### Inherited from

Response.headers

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:11136

___

### ok

• `Readonly` **ok**: `boolean`

#### Inherited from

Response.ok

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:11137

___

### redirected

• `Readonly` **redirected**: `boolean`

#### Inherited from

Response.redirected

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:11138

___

### status

• `Readonly` **status**: `number`

#### Inherited from

Response.status

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:11139

___

### statusText

• `Readonly` **statusText**: `string`

#### Inherited from

Response.statusText

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:11140

___

### type

• `Readonly` **type**: `ResponseType`

#### Inherited from

Response.type

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:11141

___

### url

• `Readonly` **url**: `string`

#### Inherited from

Response.url

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:11142

## Methods

### arrayBuffer

▸ **arrayBuffer**(): `Promise`<`ArrayBuffer`\>

#### Returns

`Promise`<`ArrayBuffer`\>

#### Inherited from

Response.arrayBuffer

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:2404

___

### blob

▸ **blob**(): `Promise`<`Blob`\>

#### Returns

`Promise`<`Blob`\>

#### Inherited from

Response.blob

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:2405

___

### clone

▸ **clone**(): `Response`

#### Returns

`Response`

#### Inherited from

Response.clone

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:11143

___

### formData

▸ **formData**(): `Promise`<`FormData`\>

#### Returns

`Promise`<`FormData`\>

#### Inherited from

Response.formData

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:2406

___

### json

▸ **json**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Inherited from

Response.json

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:2407

___

### text

▸ **text**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

Response.text

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:2408
