[eve-esi-swaggerts](../README.md) / [Exports](../modules.md) / HttpClient

# Class: HttpClient<SecurityDataType\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `SecurityDataType` | `unknown` |

## Hierarchy

- **`HttpClient`**

  ↳ [`Api`](Api.md)

## Table of contents

### Constructors

- [constructor](HttpClient.md#constructor)

### Properties

- [abortControllers](HttpClient.md#abortcontrollers)
- [baseApiParams](HttpClient.md#baseapiparams)
- [baseUrl](HttpClient.md#baseurl)
- [contentFormatters](HttpClient.md#contentformatters)
- [securityData](HttpClient.md#securitydata)
- [securityWorker](HttpClient.md#securityworker)

### Methods

- [abortRequest](HttpClient.md#abortrequest)
- [addArrayQueryParam](HttpClient.md#addarrayqueryparam)
- [addQueryParam](HttpClient.md#addqueryparam)
- [addQueryParams](HttpClient.md#addqueryparams)
- [createAbortSignal](HttpClient.md#createabortsignal)
- [customFetch](HttpClient.md#customfetch)
- [encodeQueryParam](HttpClient.md#encodequeryparam)
- [mergeRequestParams](HttpClient.md#mergerequestparams)
- [request](HttpClient.md#request)
- [setSecurityData](HttpClient.md#setsecuritydata)
- [toQueryString](HttpClient.md#toquerystring)

## Constructors

### constructor

• **new HttpClient**<`SecurityDataType`\>(`apiConfig?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `SecurityDataType` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `apiConfig` | [`ApiConfig`](../interfaces/ApiConfig.md)<`SecurityDataType`\> |

#### Defined in

[src/index.ts:132](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L132)

## Properties

### abortControllers

• `Private` **abortControllers**: `Map`<`CancelToken`, `AbortController`\>

#### Defined in

[src/index.ts:122](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L122)

___

### baseApiParams

• `Private` **baseApiParams**: [`RequestParams`](../modules.md#requestparams)

#### Defined in

[src/index.ts:125](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L125)

___

### baseUrl

• **baseUrl**: `string` = `"https://esi.evetech.net/latest"`

#### Defined in

[src/index.ts:119](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L119)

___

### contentFormatters

• `Private` **contentFormatters**: `Record`<[`ContentType`](../enums/ContentType.md), (`input`: `any`) => `any`\>

#### Defined in

[src/index.ts:167](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L167)

___

### securityData

• `Private` **securityData**: ``null`` \| `SecurityDataType` = `null`

#### Defined in

[src/index.ts:120](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L120)

___

### securityWorker

• `Private` `Optional` **securityWorker**: (`securityData`: ``null`` \| `SecurityDataType`) => `void` \| [`RequestParams`](../modules.md#requestparams) \| `Promise`<`void` \| [`RequestParams`](../modules.md#requestparams)\>

#### Type declaration

▸ (`securityData`): `void` \| [`RequestParams`](../modules.md#requestparams) \| `Promise`<`void` \| [`RequestParams`](../modules.md#requestparams)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `securityData` | ``null`` \| `SecurityDataType` |

##### Returns

`void` \| [`RequestParams`](../modules.md#requestparams) \| `Promise`<`void` \| [`RequestParams`](../modules.md#requestparams)\>

#### Defined in

[src/index.ts:121](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L121)

## Methods

### abortRequest

▸ **abortRequest**(`cancelToken`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `cancelToken` | `CancelToken` |

#### Returns

`void`

#### Defined in

[src/index.ts:213](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L213)

___

### addArrayQueryParam

▸ `Private` **addArrayQueryParam**(`query`, `key`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`QueryParamsType`](../modules.md#queryparamstype) |
| `key` | `string` |

#### Returns

`any`

#### Defined in

[src/index.ts:149](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L149)

___

### addQueryParam

▸ `Private` **addQueryParam**(`query`, `key`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`QueryParamsType`](../modules.md#queryparamstype) |
| `key` | `string` |

#### Returns

`string`

#### Defined in

[src/index.ts:145](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L145)

___

### addQueryParams

▸ `Protected` **addQueryParams**(`rawQuery?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rawQuery?` | [`QueryParamsType`](../modules.md#queryparamstype) |

#### Returns

`string`

#### Defined in

[src/index.ts:162](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L162)

___

### createAbortSignal

▸ `Private` **createAbortSignal**(`cancelToken`): `undefined` \| `AbortSignal`

#### Parameters

| Name | Type |
| :------ | :------ |
| `cancelToken` | `CancelToken` |

#### Returns

`undefined` \| `AbortSignal`

#### Defined in

[src/index.ts:199](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L199)

___

### customFetch

▸ `Private` **customFetch**(...`fetchParams`): `Promise`<`Response`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `...fetchParams` | [input: RequestInfo, init?: RequestInit] |

#### Returns

`Promise`<`Response`\>

#### Defined in

[src/index.ts:123](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L123)

___

### encodeQueryParam

▸ `Private` **encodeQueryParam**(`key`, `value`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `any` |

#### Returns

`string`

#### Defined in

[src/index.ts:140](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L140)

___

### mergeRequestParams

▸ `Private` **mergeRequestParams**(`params1`, `params2?`): [`RequestParams`](../modules.md#requestparams)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params1` | [`RequestParams`](../modules.md#requestparams) |
| `params2?` | [`RequestParams`](../modules.md#requestparams) |

#### Returns

[`RequestParams`](../modules.md#requestparams)

#### Defined in

[src/index.ts:186](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L186)

___

### request

▸ **request**<`T`, `E`\>(`__namedParameters`): `Promise`<[`HttpResponse`](../interfaces/HttpResponse.md)<`T`, `E`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |
| `E` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`FullRequestParams`](../interfaces/FullRequestParams.md) |

#### Returns

`Promise`<[`HttpResponse`](../interfaces/HttpResponse.md)<`T`, `E`\>\>

#### Defined in

[src/index.ts:222](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L222)

___

### setSecurityData

▸ **setSecurityData**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | ``null`` \| `SecurityDataType` |

#### Returns

`void`

#### Defined in

[src/index.ts:136](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L136)

___

### toQueryString

▸ `Protected` **toQueryString**(`rawQuery?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rawQuery?` | [`QueryParamsType`](../modules.md#queryparamstype) |

#### Returns

`string`

#### Defined in

[src/index.ts:154](https://github.com/ballsten/eve-esi-swaggerts/blob/4ed57e9/src/index.ts#L154)
