[eve-esi-swaggerts](../README.md) / [Exports](../modules.md) / FullRequestParams

# Interface: FullRequestParams

## Hierarchy

- `Omit`<`RequestInit`, ``"body"``\>

  ↳ **`FullRequestParams`**

## Table of contents

### Properties

- [baseUrl](FullRequestParams.md#baseurl)
- [body](FullRequestParams.md#body)
- [cache](FullRequestParams.md#cache)
- [cancelToken](FullRequestParams.md#canceltoken)
- [credentials](FullRequestParams.md#credentials)
- [format](FullRequestParams.md#format)
- [headers](FullRequestParams.md#headers)
- [integrity](FullRequestParams.md#integrity)
- [keepalive](FullRequestParams.md#keepalive)
- [method](FullRequestParams.md#method)
- [mode](FullRequestParams.md#mode)
- [path](FullRequestParams.md#path)
- [query](FullRequestParams.md#query)
- [redirect](FullRequestParams.md#redirect)
- [referrer](FullRequestParams.md#referrer)
- [referrerPolicy](FullRequestParams.md#referrerpolicy)
- [secure](FullRequestParams.md#secure)
- [signal](FullRequestParams.md#signal)
- [type](FullRequestParams.md#type)
- [window](FullRequestParams.md#window)

## Properties

### baseUrl

• `Optional` **baseUrl**: `string`

base url

#### Defined in

[src/index.ts:91](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L91)

___

### body

• `Optional` **body**: `unknown`

request body

#### Defined in

[src/index.ts:89](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L89)

___

### cache

• `Optional` **cache**: `RequestCache`

A string indicating how the request will interact with the browser's cache to set request's cache.

#### Inherited from

Omit.cache

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1470

___

### cancelToken

• `Optional` **cancelToken**: `CancelToken`

request cancellation token

#### Defined in

[src/index.ts:93](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L93)

___

### credentials

• `Optional` **credentials**: `RequestCredentials`

A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials.

#### Inherited from

Omit.credentials

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1472

___

### format

• `Optional` **format**: ``"arrayBuffer"`` \| ``"blob"`` \| ``"formData"`` \| ``"json"`` \| ``"text"``

format of response (i.e. response.json() -> format: "json")

#### Defined in

[src/index.ts:87](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L87)

___

### headers

• `Optional` **headers**: `HeadersInit`

A Headers object, an object literal, or an array of two-item arrays to set request's headers.

#### Inherited from

Omit.headers

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1474

___

### integrity

• `Optional` **integrity**: `string`

A cryptographic hash of the resource to be fetched by request. Sets request's integrity.

#### Inherited from

Omit.integrity

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1476

___

### keepalive

• `Optional` **keepalive**: `boolean`

A boolean to set request's keepalive.

#### Inherited from

Omit.keepalive

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1478

___

### method

• `Optional` **method**: `string`

A string to set request's method.

#### Inherited from

Omit.method

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1480

___

### mode

• `Optional` **mode**: `RequestMode`

A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode.

#### Inherited from

Omit.mode

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1482

___

### path

• **path**: `string`

request path

#### Defined in

[src/index.ts:81](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L81)

___

### query

• `Optional` **query**: [`QueryParamsType`](../modules.md#queryparamstype)

query params

#### Defined in

[src/index.ts:85](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L85)

___

### redirect

• `Optional` **redirect**: `RequestRedirect`

A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect.

#### Inherited from

Omit.redirect

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1484

___

### referrer

• `Optional` **referrer**: `string`

A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer.

#### Inherited from

Omit.referrer

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1486

___

### referrerPolicy

• `Optional` **referrerPolicy**: `ReferrerPolicy`

A referrer policy to set request's referrerPolicy.

#### Inherited from

Omit.referrerPolicy

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1488

___

### secure

• `Optional` **secure**: `boolean`

set parameter to `true` for call `securityWorker` for this request

#### Defined in

[src/index.ts:79](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L79)

___

### signal

• `Optional` **signal**: ``null`` \| `AbortSignal`

An AbortSignal to set request's signal.

#### Inherited from

Omit.signal

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1490

___

### type

• `Optional` **type**: [`ContentType`](../enums/ContentType.md)

content type of request body

#### Defined in

[src/index.ts:83](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L83)

___

### window

• `Optional` **window**: ``null``

Can only be null. Used to disassociate request from any Window.

#### Inherited from

Omit.window

#### Defined in

.yarn/cache/typescript-patch-613ccf361e-53838d56ab.zip/node_modules/typescript/lib/lib.dom.d.ts:1492
