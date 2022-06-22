[eve-esi-swaggerts](README.md) / Exports

# eve-esi-swaggerts

## Table of contents

### Enumerations

- [ContentType](enums/ContentType.md)

### Classes

- [Api](classes/Api.md)
- [HttpClient](classes/HttpClient.md)

### Interfaces

- [ApiConfig](interfaces/ApiConfig.md)
- [BadRequest](interfaces/BadRequest.md)
- [ErrorLimited](interfaces/ErrorLimited.md)
- [Forbidden](interfaces/Forbidden.md)
- [FullRequestParams](interfaces/FullRequestParams.md)
- [GatewayTimeout](interfaces/GatewayTimeout.md)
- [HttpResponse](interfaces/HttpResponse.md)
- [InternalServerError](interfaces/InternalServerError.md)
- [ServiceUnavailable](interfaces/ServiceUnavailable.md)
- [Unauthorized](interfaces/Unauthorized.md)

### Type aliases

- [QueryParamsType](modules.md#queryparamstype)
- [RequestParams](modules.md#requestparams)
- [ResponseFormat](modules.md#responseformat)

## Type aliases

### QueryParamsType

Ƭ **QueryParamsType**: `Record`<`string` \| `number`, `any`\>

#### Defined in

[src/index.ts:74](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L74)

___

### RequestParams

Ƭ **RequestParams**: `Omit`<[`FullRequestParams`](interfaces/FullRequestParams.md), ``"body"`` \| ``"method"`` \| ``"query"`` \| ``"path"``\>

#### Defined in

[src/index.ts:96](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L96)

___

### ResponseFormat

Ƭ **ResponseFormat**: keyof `Omit`<`Body`, ``"body"`` \| ``"bodyUsed"``\>

#### Defined in

[src/index.ts:75](https://github.com/ballsten/eve-esi-swaggerts/blob/ec6a45d/src/index.ts#L75)
