[eve-esi-swaggerts](../README.md) / [Exports](../modules.md) / ApiConfig

# Interface: ApiConfig<SecurityDataType\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `SecurityDataType` | `unknown` |

## Table of contents

### Properties

- [baseApiParams](ApiConfig.md#baseapiparams)
- [baseUrl](ApiConfig.md#baseurl)
- [customFetch](ApiConfig.md#customfetch)

### Methods

- [securityWorker](ApiConfig.md#securityworker)

## Properties

### baseApiParams

• `Optional` **baseApiParams**: `Omit`<[`RequestParams`](../modules.md#requestparams), ``"signal"`` \| ``"baseUrl"`` \| ``"cancelToken"``\>

#### Defined in

[src/index.ts:100](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L100)

___

### baseUrl

• `Optional` **baseUrl**: `string`

#### Defined in

[src/index.ts:99](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L99)

___

### customFetch

• `Optional` **customFetch**: (`input`: `RequestInfo`, `init?`: `RequestInit`) => `Promise`<`Response`\>

#### Type declaration

▸ (`input`, `init?`): `Promise`<`Response`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `RequestInfo` |
| `init?` | `RequestInit` |

##### Returns

`Promise`<`Response`\>

#### Defined in

[src/index.ts:102](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L102)

## Methods

### securityWorker

▸ `Optional` **securityWorker**(`securityData`): `void` \| [`RequestParams`](../modules.md#requestparams) \| `Promise`<`void` \| [`RequestParams`](../modules.md#requestparams)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `securityData` | ``null`` \| `SecurityDataType` |

#### Returns

`void` \| [`RequestParams`](../modules.md#requestparams) \| `Promise`<`void` \| [`RequestParams`](../modules.md#requestparams)\>

#### Defined in

[src/index.ts:101](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L101)
