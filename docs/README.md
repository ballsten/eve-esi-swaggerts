eve-esi-swaggerts / [Exports](modules.md)

# eve-esi-swaggerts

This library is purely auto-generated code using the 'swagger-typescript-api' package to generate the code.

I have not added any templates to change the output. Maybe that is a project for a future date.

## Docs
Auto-generated documentation is [available](./docs/modules.md)

## Examples
Import the package and execute a query. You will need an access token for secured endpoints. Check out eve-sso-pkce as an option.

```
import { Api } from 'eve-esi-swaggerts'

const esi = new Api()

const characterResponse = await esi.characters.getCharactersCharacterId(123456789)
const character = response.data

const accessToken = 'you will get this from your sso auth module'

const locationResponse = await esi.characters.getCharactersCharacterIdOnline(characterId, { token: token.accessToken })
const location = locationResponse.data
```
