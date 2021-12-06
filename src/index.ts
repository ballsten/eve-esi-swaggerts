/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * Bad request model
 */
export interface BadRequest {
  /** Bad request message */
  error: string;
}

/**
 * Error limited model
 */
export interface ErrorLimited {
  /** Error limited message */
  error: string;
}

/**
 * Forbidden model
 */
export interface Forbidden {
  /** Forbidden message */
  error: string;

  /** status code received from SSO */
  sso_status?: number;
}

/**
 * Gateway timeout model
 */
export interface GatewayTimeout {
  /** Gateway timeout message */
  error: string;

  /** number of seconds the request was given */
  timeout?: number;
}

/**
 * Internal server error model
 */
export interface InternalServerError {
  /** Internal server error message */
  error: string;
}

/**
 * Service unavailable model
 */
export interface ServiceUnavailable {
  /** Service unavailable message */
  error: string;
}

/**
 * Unauthorized model
 */
export interface Unauthorized {
  /** Unauthorized message */
  error: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "https://esi.evetech.net/latest";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title EVE Swagger Interface
 * @version 1.10.1
 * @baseUrl https://esi.evetech.net/latest
 *
 * An OpenAPI for EVE Online
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  alliances = {
    /**
     * @description List all active player alliances --- Alternate route: `/dev/alliances/` Alternate route: `/legacy/alliances/` Alternate route: `/v1/alliances/` Alternate route: `/v2/alliances/` --- This route is cached for up to 3600 seconds
     *
     * @tags Alliance
     * @name GetAlliances
     * @summary List all alliances
     * @request GET:/alliances/
     * @response `200` `(number)[]` List of Alliance IDs
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getAlliances: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/alliances/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Public information about an alliance --- Alternate route: `/dev/alliances/{alliance_id}/` Alternate route: `/legacy/alliances/{alliance_id}/` Alternate route: `/v3/alliances/{alliance_id}/` Alternate route: `/v4/alliances/{alliance_id}/` --- This route is cached for up to 3600 seconds
     *
     * @tags Alliance
     * @name GetAlliancesAllianceId
     * @summary Get alliance information
     * @request GET:/alliances/{alliance_id}/
     * @response `200` `{ creator_corporation_id: number, creator_id: number, date_founded: string, executor_corporation_id?: number, faction_id?: number, name: string, ticker: string }` Public data about an alliance
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Alliance not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getAlliancesAllianceId: (allianceId: number, query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          creator_corporation_id: number;
          creator_id: number;
          date_founded: string;
          executor_corporation_id?: number;
          faction_id?: number;
          name: string;
          ticker: string;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/alliances/${allianceId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return contacts of an alliance --- Alternate route: `/dev/alliances/{alliance_id}/contacts/` Alternate route: `/v2/alliances/{alliance_id}/contacts/` --- This route is cached for up to 300 seconds
     *
     * @tags Contacts
     * @name GetAlliancesAllianceIdContacts
     * @summary Get alliance contacts
     * @request GET:/alliances/{alliance_id}/contacts/
     * @secure
     * @response `200` `({ contact_id: number, contact_type: "character" | "corporation" | "alliance" | "faction", label_ids?: (number)[], standing: number })[]` A list of contacts
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getAlliancesAllianceIdContacts: (
      allianceId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          contact_id: number;
          contact_type: "character" | "corporation" | "alliance" | "faction";
          label_ids?: number[];
          standing: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/alliances/${allianceId}/contacts/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return custom labels for an alliance's contacts --- Alternate route: `/dev/alliances/{alliance_id}/contacts/labels/` Alternate route: `/legacy/alliances/{alliance_id}/contacts/labels/` Alternate route: `/v1/alliances/{alliance_id}/contacts/labels/` --- This route is cached for up to 300 seconds
     *
     * @tags Contacts
     * @name GetAlliancesAllianceIdContactsLabels
     * @summary Get alliance contact labels
     * @request GET:/alliances/{alliance_id}/contacts/labels/
     * @secure
     * @response `200` `({ label_id: number, label_name: string })[]` A list of alliance contact labels
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getAlliancesAllianceIdContactsLabels: (
      allianceId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { label_id: number; label_name: string }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/alliances/${allianceId}/contacts/labels/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List all current member corporations of an alliance --- Alternate route: `/dev/alliances/{alliance_id}/corporations/` Alternate route: `/legacy/alliances/{alliance_id}/corporations/` Alternate route: `/v1/alliances/{alliance_id}/corporations/` Alternate route: `/v2/alliances/{alliance_id}/corporations/` --- This route is cached for up to 3600 seconds
     *
     * @tags Alliance
     * @name GetAlliancesAllianceIdCorporations
     * @summary List alliance's corporations
     * @request GET:/alliances/{alliance_id}/corporations/
     * @response `200` `(number)[]` List of corporation IDs
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getAlliancesAllianceIdCorporations: (
      allianceId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/alliances/${allianceId}/corporations/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the icon urls for a alliance --- Alternate route: `/legacy/alliances/{alliance_id}/icons/` Alternate route: `/v1/alliances/{alliance_id}/icons/` --- This route expires daily at 11:05 --- [Diff of the upcoming changes](https://esi.evetech.net/diff/latest/dev/#GET-/alliances/{alliance_id}/icons/)
     *
     * @tags Alliance
     * @name GetAlliancesAllianceIdIcons
     * @summary Get alliance icon
     * @request GET:/alliances/{alliance_id}/icons/
     * @response `200` `{ "px128x128"?: string, "px64x64"?: string }` Icon URLs for the given alliance id and server
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` No image server for this datasource
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getAlliancesAllianceIdIcons: (
      allianceId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        { px128x128?: string; px64x64?: string },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/alliances/${allianceId}/icons/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  characters = {
    /**
     * @description Bulk lookup of character IDs to corporation, alliance and faction --- Alternate route: `/dev/characters/affiliation/` Alternate route: `/v2/characters/affiliation/` --- This route is cached for up to 3600 seconds
     *
     * @tags Character
     * @name PostCharactersAffiliation
     * @summary Character affiliation
     * @request POST:/characters/affiliation/
     * @response `200` `({ alliance_id?: number, character_id: number, corporation_id: number, faction_id?: number })[]` Character corporation, alliance and faction IDs
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postCharactersAffiliation: (
      characters: number[],
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        { alliance_id?: number; character_id: number; corporation_id: number; faction_id?: number }[],
        BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/affiliation/`,
        method: "POST",
        query: query,
        body: characters,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Public information about a character --- Alternate route: `/dev/characters/{character_id}/` Alternate route: `/legacy/characters/{character_id}/` Alternate route: `/v5/characters/{character_id}/` --- This route is cached for up to 86400 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterId
     * @summary Get character's public information
     * @request GET:/characters/{character_id}/
     * @response `200` `{ alliance_id?: number, birthday: string, bloodline_id: number, corporation_id: number, description?: string, faction_id?: number, gender: "female" | "male", name: string, race_id: number, security_status?: number, title?: string }` Public data for the given character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Character not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterId: (
      characterId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          alliance_id?: number;
          birthday: string;
          bloodline_id: number;
          corporation_id: number;
          description?: string;
          faction_id?: number;
          gender: "female" | "male";
          name: string;
          race_id: number;
          security_status?: number;
          title?: string;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of agents research information for a character. The formula for finding the current research points with an agent is: currentPoints = remainderPoints + pointsPerDay * days(currentTime - researchStartDate) --- Alternate route: `/dev/characters/{character_id}/agents_research/` Alternate route: `/v2/characters/{character_id}/agents_research/` --- This route is cached for up to 3600 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdAgentsResearch
     * @summary Get agents research
     * @request GET:/characters/{character_id}/agents_research/
     * @secure
     * @response `200` `({ agent_id: number, points_per_day: number, remainder_points: number, skill_type_id: number, started_at: string })[]` A list of agents research information
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdAgentsResearch: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          agent_id: number;
          points_per_day: number;
          remainder_points: number;
          skill_type_id: number;
          started_at: string;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/agents_research/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of the characters assets --- Alternate route: `/dev/characters/{character_id}/assets/` Alternate route: `/v5/characters/{character_id}/assets/` --- This route is cached for up to 3600 seconds
     *
     * @tags Assets
     * @name GetCharactersCharacterIdAssets
     * @summary Get character assets
     * @request GET:/characters/{character_id}/assets/
     * @secure
     * @response `200` `({ is_blueprint_copy?: boolean, is_singleton: boolean, item_id: number, location_flag: "AssetSafety" | "AutoFit" | "BoosterBay" | "Cargo" | "CorpseBay" | "Deliveries" | "DroneBay" | "FighterBay" | "FighterTube0" | "FighterTube1" | "FighterTube2" | "FighterTube3" | "FighterTube4" | "FleetHangar" | "FrigateEscapeBay" | "Hangar" | "HangarAll" | "HiSlot0" | "HiSlot1" | "HiSlot2" | "HiSlot3" | "HiSlot4" | "HiSlot5" | "HiSlot6" | "HiSlot7" | "HiddenModifiers" | "Implant" | "LoSlot0" | "LoSlot1" | "LoSlot2" | "LoSlot3" | "LoSlot4" | "LoSlot5" | "LoSlot6" | "LoSlot7" | "Locked" | "MedSlot0" | "MedSlot1" | "MedSlot2" | "MedSlot3" | "MedSlot4" | "MedSlot5" | "MedSlot6" | "MedSlot7" | "QuafeBay" | "RigSlot0" | "RigSlot1" | "RigSlot2" | "RigSlot3" | "RigSlot4" | "RigSlot5" | "RigSlot6" | "RigSlot7" | "ShipHangar" | "Skill" | "SpecializedAmmoHold" | "SpecializedCommandCenterHold" | "SpecializedFuelBay" | "SpecializedGasHold" | "SpecializedIndustrialShipHold" | "SpecializedLargeShipHold" | "SpecializedMaterialBay" | "SpecializedMediumShipHold" | "SpecializedMineralHold" | "SpecializedOreHold" | "SpecializedPlanetaryCommoditiesHold" | "SpecializedSalvageHold" | "SpecializedShipHold" | "SpecializedSmallShipHold" | "SubSystemBay" | "SubSystemSlot0" | "SubSystemSlot1" | "SubSystemSlot2" | "SubSystemSlot3" | "SubSystemSlot4" | "SubSystemSlot5" | "SubSystemSlot6" | "SubSystemSlot7" | "Unlocked" | "Wardrobe", location_id: number, location_type: "station" | "solar_system" | "item" | "other", quantity: number, type_id: number })[]` A flat list of the users assets
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Requested page does not exist
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdAssets: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          is_blueprint_copy?: boolean;
          is_singleton: boolean;
          item_id: number;
          location_flag:
            | "AssetSafety"
            | "AutoFit"
            | "BoosterBay"
            | "Cargo"
            | "CorpseBay"
            | "Deliveries"
            | "DroneBay"
            | "FighterBay"
            | "FighterTube0"
            | "FighterTube1"
            | "FighterTube2"
            | "FighterTube3"
            | "FighterTube4"
            | "FleetHangar"
            | "FrigateEscapeBay"
            | "Hangar"
            | "HangarAll"
            | "HiSlot0"
            | "HiSlot1"
            | "HiSlot2"
            | "HiSlot3"
            | "HiSlot4"
            | "HiSlot5"
            | "HiSlot6"
            | "HiSlot7"
            | "HiddenModifiers"
            | "Implant"
            | "LoSlot0"
            | "LoSlot1"
            | "LoSlot2"
            | "LoSlot3"
            | "LoSlot4"
            | "LoSlot5"
            | "LoSlot6"
            | "LoSlot7"
            | "Locked"
            | "MedSlot0"
            | "MedSlot1"
            | "MedSlot2"
            | "MedSlot3"
            | "MedSlot4"
            | "MedSlot5"
            | "MedSlot6"
            | "MedSlot7"
            | "QuafeBay"
            | "RigSlot0"
            | "RigSlot1"
            | "RigSlot2"
            | "RigSlot3"
            | "RigSlot4"
            | "RigSlot5"
            | "RigSlot6"
            | "RigSlot7"
            | "ShipHangar"
            | "Skill"
            | "SpecializedAmmoHold"
            | "SpecializedCommandCenterHold"
            | "SpecializedFuelBay"
            | "SpecializedGasHold"
            | "SpecializedIndustrialShipHold"
            | "SpecializedLargeShipHold"
            | "SpecializedMaterialBay"
            | "SpecializedMediumShipHold"
            | "SpecializedMineralHold"
            | "SpecializedOreHold"
            | "SpecializedPlanetaryCommoditiesHold"
            | "SpecializedSalvageHold"
            | "SpecializedShipHold"
            | "SpecializedSmallShipHold"
            | "SubSystemBay"
            | "SubSystemSlot0"
            | "SubSystemSlot1"
            | "SubSystemSlot2"
            | "SubSystemSlot3"
            | "SubSystemSlot4"
            | "SubSystemSlot5"
            | "SubSystemSlot6"
            | "SubSystemSlot7"
            | "Unlocked"
            | "Wardrobe";
          location_id: number;
          location_type: "station" | "solar_system" | "item" | "other";
          quantity: number;
          type_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/assets/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return locations for a set of item ids, which you can get from character assets endpoint. Coordinates for items in hangars or stations are set to (0,0,0) --- Alternate route: `/dev/characters/{character_id}/assets/locations/` Alternate route: `/v2/characters/{character_id}/assets/locations/`
     *
     * @tags Assets
     * @name PostCharactersCharacterIdAssetsLocations
     * @summary Get character asset locations
     * @request POST:/characters/{character_id}/assets/locations/
     * @secure
     * @response `200` `({ item_id: number, position: { x: number, y: number, z: number } })[]` List of asset locations
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postCharactersCharacterIdAssetsLocations: (
      characterId: number,
      item_ids: number[],
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { item_id: number; position: { x: number; y: number; z: number } }[],
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/assets/locations/`,
        method: "POST",
        query: query,
        body: item_ids,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return names for a set of item ids, which you can get from character assets endpoint. Typically used for items that can customize names, like containers or ships. --- Alternate route: `/dev/characters/{character_id}/assets/names/` Alternate route: `/legacy/characters/{character_id}/assets/names/` Alternate route: `/v1/characters/{character_id}/assets/names/`
     *
     * @tags Assets
     * @name PostCharactersCharacterIdAssetsNames
     * @summary Get character asset names
     * @request POST:/characters/{character_id}/assets/names/
     * @secure
     * @response `200` `({ item_id: number, name: string })[]` List of asset names
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postCharactersCharacterIdAssetsNames: (
      characterId: number,
      item_ids: number[],
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { item_id: number; name: string }[],
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/assets/names/`,
        method: "POST",
        query: query,
        body: item_ids,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return attributes of a character --- Alternate route: `/dev/characters/{character_id}/attributes/` Alternate route: `/legacy/characters/{character_id}/attributes/` Alternate route: `/v1/characters/{character_id}/attributes/` --- This route is cached for up to 120 seconds
     *
     * @tags Skills
     * @name GetCharactersCharacterIdAttributes
     * @summary Get character attributes
     * @request GET:/characters/{character_id}/attributes/
     * @secure
     * @response `200` `{ accrued_remap_cooldown_date?: string, bonus_remaps?: number, charisma: number, intelligence: number, last_remap_date?: string, memory: number, perception: number, willpower: number }` Attributes of a character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdAttributes: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          accrued_remap_cooldown_date?: string;
          bonus_remaps?: number;
          charisma: number;
          intelligence: number;
          last_remap_date?: string;
          memory: number;
          perception: number;
          willpower: number;
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/attributes/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of blueprints the character owns --- Alternate route: `/dev/characters/{character_id}/blueprints/` Alternate route: `/v3/characters/{character_id}/blueprints/` --- This route is cached for up to 3600 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdBlueprints
     * @summary Get blueprints
     * @request GET:/characters/{character_id}/blueprints/
     * @secure
     * @response `200` `({ item_id: number, location_flag: "AutoFit" | "Cargo" | "CorpseBay" | "DroneBay" | "FleetHangar" | "Deliveries" | "HiddenModifiers" | "Hangar" | "HangarAll" | "LoSlot0" | "LoSlot1" | "LoSlot2" | "LoSlot3" | "LoSlot4" | "LoSlot5" | "LoSlot6" | "LoSlot7" | "MedSlot0" | "MedSlot1" | "MedSlot2" | "MedSlot3" | "MedSlot4" | "MedSlot5" | "MedSlot6" | "MedSlot7" | "HiSlot0" | "HiSlot1" | "HiSlot2" | "HiSlot3" | "HiSlot4" | "HiSlot5" | "HiSlot6" | "HiSlot7" | "AssetSafety" | "Locked" | "Unlocked" | "Implant" | "QuafeBay" | "RigSlot0" | "RigSlot1" | "RigSlot2" | "RigSlot3" | "RigSlot4" | "RigSlot5" | "RigSlot6" | "RigSlot7" | "ShipHangar" | "SpecializedFuelBay" | "SpecializedOreHold" | "SpecializedGasHold" | "SpecializedMineralHold" | "SpecializedSalvageHold" | "SpecializedShipHold" | "SpecializedSmallShipHold" | "SpecializedMediumShipHold" | "SpecializedLargeShipHold" | "SpecializedIndustrialShipHold" | "SpecializedAmmoHold" | "SpecializedCommandCenterHold" | "SpecializedPlanetaryCommoditiesHold" | "SpecializedMaterialBay" | "SubSystemSlot0" | "SubSystemSlot1" | "SubSystemSlot2" | "SubSystemSlot3" | "SubSystemSlot4" | "SubSystemSlot5" | "SubSystemSlot6" | "SubSystemSlot7" | "FighterBay" | "FighterTube0" | "FighterTube1" | "FighterTube2" | "FighterTube3" | "FighterTube4" | "Module", location_id: number, material_efficiency: number, quantity: number, runs: number, time_efficiency: number, type_id: number })[]` A list of blueprints
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdBlueprints: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          item_id: number;
          location_flag:
            | "AutoFit"
            | "Cargo"
            | "CorpseBay"
            | "DroneBay"
            | "FleetHangar"
            | "Deliveries"
            | "HiddenModifiers"
            | "Hangar"
            | "HangarAll"
            | "LoSlot0"
            | "LoSlot1"
            | "LoSlot2"
            | "LoSlot3"
            | "LoSlot4"
            | "LoSlot5"
            | "LoSlot6"
            | "LoSlot7"
            | "MedSlot0"
            | "MedSlot1"
            | "MedSlot2"
            | "MedSlot3"
            | "MedSlot4"
            | "MedSlot5"
            | "MedSlot6"
            | "MedSlot7"
            | "HiSlot0"
            | "HiSlot1"
            | "HiSlot2"
            | "HiSlot3"
            | "HiSlot4"
            | "HiSlot5"
            | "HiSlot6"
            | "HiSlot7"
            | "AssetSafety"
            | "Locked"
            | "Unlocked"
            | "Implant"
            | "QuafeBay"
            | "RigSlot0"
            | "RigSlot1"
            | "RigSlot2"
            | "RigSlot3"
            | "RigSlot4"
            | "RigSlot5"
            | "RigSlot6"
            | "RigSlot7"
            | "ShipHangar"
            | "SpecializedFuelBay"
            | "SpecializedOreHold"
            | "SpecializedGasHold"
            | "SpecializedMineralHold"
            | "SpecializedSalvageHold"
            | "SpecializedShipHold"
            | "SpecializedSmallShipHold"
            | "SpecializedMediumShipHold"
            | "SpecializedLargeShipHold"
            | "SpecializedIndustrialShipHold"
            | "SpecializedAmmoHold"
            | "SpecializedCommandCenterHold"
            | "SpecializedPlanetaryCommoditiesHold"
            | "SpecializedMaterialBay"
            | "SubSystemSlot0"
            | "SubSystemSlot1"
            | "SubSystemSlot2"
            | "SubSystemSlot3"
            | "SubSystemSlot4"
            | "SubSystemSlot5"
            | "SubSystemSlot6"
            | "SubSystemSlot7"
            | "FighterBay"
            | "FighterTube0"
            | "FighterTube1"
            | "FighterTube2"
            | "FighterTube3"
            | "FighterTube4"
            | "Module";
          location_id: number;
          material_efficiency: number;
          quantity: number;
          runs: number;
          time_efficiency: number;
          type_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/blueprints/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description A list of your character's personal bookmarks --- Alternate route: `/dev/characters/{character_id}/bookmarks/` Alternate route: `/v2/characters/{character_id}/bookmarks/` --- This route is cached for up to 3600 seconds
     *
     * @tags Bookmarks
     * @name GetCharactersCharacterIdBookmarks
     * @summary List bookmarks
     * @request GET:/characters/{character_id}/bookmarks/
     * @secure
     * @response `200` `({ bookmark_id: number, coordinates?: { x: number, y: number, z: number }, created: string, creator_id: number, folder_id?: number, item?: { item_id: number, type_id: number }, label: string, location_id: number, notes: string })[]` A list of bookmarks
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdBookmarks: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          bookmark_id: number;
          coordinates?: { x: number; y: number; z: number };
          created: string;
          creator_id: number;
          folder_id?: number;
          item?: { item_id: number; type_id: number };
          label: string;
          location_id: number;
          notes: string;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/bookmarks/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description A list of your character's personal bookmark folders --- Alternate route: `/dev/characters/{character_id}/bookmarks/folders/` Alternate route: `/v2/characters/{character_id}/bookmarks/folders/` --- This route is cached for up to 3600 seconds
     *
     * @tags Bookmarks
     * @name GetCharactersCharacterIdBookmarksFolders
     * @summary List bookmark folders
     * @request GET:/characters/{character_id}/bookmarks/folders/
     * @secure
     * @response `200` `({ folder_id: number, name: string })[]` List of bookmark folders
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdBookmarksFolders: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { folder_id: number; name: string }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/bookmarks/folders/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get 50 event summaries from the calendar. If no from_event ID is given, the resource will return the next 50 chronological event summaries from now. If a from_event ID is specified, it will return the next 50 chronological event summaries from after that event --- Alternate route: `/dev/characters/{character_id}/calendar/` Alternate route: `/legacy/characters/{character_id}/calendar/` Alternate route: `/v1/characters/{character_id}/calendar/` Alternate route: `/v2/characters/{character_id}/calendar/` --- This route is cached for up to 5 seconds
     *
     * @tags Calendar
     * @name GetCharactersCharacterIdCalendar
     * @summary List calendar event summaries
     * @request GET:/characters/{character_id}/calendar/
     * @secure
     * @response `200` `({ event_date?: string, event_id?: number, event_response?: "declined" | "not_responded" | "accepted" | "tentative", importance?: number, title?: string })[]` A collection of event summaries
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdCalendar: (
      characterId: number,
      query?: { datasource?: "tranquility"; from_event?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          event_date?: string;
          event_id?: number;
          event_response?: "declined" | "not_responded" | "accepted" | "tentative";
          importance?: number;
          title?: string;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/calendar/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all the information for a specific event --- Alternate route: `/dev/characters/{character_id}/calendar/{event_id}/` Alternate route: `/legacy/characters/{character_id}/calendar/{event_id}/` Alternate route: `/v3/characters/{character_id}/calendar/{event_id}/` Alternate route: `/v4/characters/{character_id}/calendar/{event_id}/` --- This route is cached for up to 5 seconds
     *
     * @tags Calendar
     * @name GetCharactersCharacterIdCalendarEventId
     * @summary Get an event
     * @request GET:/characters/{character_id}/calendar/{event_id}/
     * @secure
     * @response `200` `{ date: string, duration: number, event_id: number, importance: number, owner_id: number, owner_name: string, owner_type: "eve_server" | "corporation" | "faction" | "character" | "alliance", response: string, text: string, title: string }` Full details of a specific event
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdCalendarEventId: (
      characterId: number,
      eventId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          date: string;
          duration: number;
          event_id: number;
          importance: number;
          owner_id: number;
          owner_name: string;
          owner_type: "eve_server" | "corporation" | "faction" | "character" | "alliance";
          response: string;
          text: string;
          title: string;
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/calendar/${eventId}/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Set your response status to an event --- Alternate route: `/dev/characters/{character_id}/calendar/{event_id}/` Alternate route: `/legacy/characters/{character_id}/calendar/{event_id}/` Alternate route: `/v3/characters/{character_id}/calendar/{event_id}/` Alternate route: `/v4/characters/{character_id}/calendar/{event_id}/` --- This route is cached for up to 5 seconds
     *
     * @tags Calendar
     * @name PutCharactersCharacterIdCalendarEventId
     * @summary Respond to an event
     * @request PUT:/characters/{character_id}/calendar/{event_id}/
     * @secure
     * @response `204` `void` Event updated
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    putCharactersCharacterIdCalendarEventId: (
      characterId: number,
      eventId: number,
      response: { response: "accepted" | "declined" | "tentative" },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/calendar/${eventId}/`,
        method: "PUT",
        query: query,
        body: response,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get all invited attendees for a given event --- Alternate route: `/dev/characters/{character_id}/calendar/{event_id}/attendees/` Alternate route: `/legacy/characters/{character_id}/calendar/{event_id}/attendees/` Alternate route: `/v1/characters/{character_id}/calendar/{event_id}/attendees/` Alternate route: `/v2/characters/{character_id}/calendar/{event_id}/attendees/` --- This route is cached for up to 600 seconds
     *
     * @tags Calendar
     * @name GetCharactersCharacterIdCalendarEventIdAttendees
     * @summary Get attendees
     * @request GET:/characters/{character_id}/calendar/{event_id}/attendees/
     * @secure
     * @response `200` `({ character_id?: number, event_response?: "declined" | "not_responded" | "accepted" | "tentative" })[]` List of attendees
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdCalendarEventIdAttendees: (
      characterId: number,
      eventId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { character_id?: number; event_response?: "declined" | "not_responded" | "accepted" | "tentative" }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/calendar/${eventId}/attendees/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description A list of the character's clones --- Alternate route: `/dev/characters/{character_id}/clones/` Alternate route: `/v3/characters/{character_id}/clones/` Alternate route: `/v4/characters/{character_id}/clones/` --- This route is cached for up to 120 seconds
     *
     * @tags Clones
     * @name GetCharactersCharacterIdClones
     * @summary Get clones
     * @request GET:/characters/{character_id}/clones/
     * @secure
     * @response `200` `{ home_location?: { location_id?: number, location_type?: "station" | "structure" }, jump_clones: ({ implants: (number)[], jump_clone_id: number, location_id: number, location_type: "station" | "structure", name?: string })[], last_clone_jump_date?: string, last_station_change_date?: string }` Clone information for the given character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdClones: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          home_location?: { location_id?: number; location_type?: "station" | "structure" };
          jump_clones: {
            implants: number[];
            jump_clone_id: number;
            location_id: number;
            location_type: "station" | "structure";
            name?: string;
          }[];
          last_clone_jump_date?: string;
          last_station_change_date?: string;
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/clones/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Bulk delete contacts --- Alternate route: `/dev/characters/{character_id}/contacts/` Alternate route: `/v2/characters/{character_id}/contacts/`
     *
     * @tags Contacts
     * @name DeleteCharactersCharacterIdContacts
     * @summary Delete contacts
     * @request DELETE:/characters/{character_id}/contacts/
     * @secure
     * @response `204` `void` Contacts deleted
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    deleteCharactersCharacterIdContacts: (
      characterId: number,
      query: { contact_ids: number[]; datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/contacts/`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Return contacts of a character --- Alternate route: `/dev/characters/{character_id}/contacts/` Alternate route: `/v2/characters/{character_id}/contacts/` --- This route is cached for up to 300 seconds
     *
     * @tags Contacts
     * @name GetCharactersCharacterIdContacts
     * @summary Get contacts
     * @request GET:/characters/{character_id}/contacts/
     * @secure
     * @response `200` `({ contact_id: number, contact_type: "character" | "corporation" | "alliance" | "faction", is_blocked?: boolean, is_watched?: boolean, label_ids?: (number)[], standing: number })[]` A list of contacts
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdContacts: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          contact_id: number;
          contact_type: "character" | "corporation" | "alliance" | "faction";
          is_blocked?: boolean;
          is_watched?: boolean;
          label_ids?: number[];
          standing: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/contacts/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Bulk add contacts with same settings --- Alternate route: `/dev/characters/{character_id}/contacts/` Alternate route: `/v2/characters/{character_id}/contacts/`
     *
     * @tags Contacts
     * @name PostCharactersCharacterIdContacts
     * @summary Add contacts
     * @request POST:/characters/{character_id}/contacts/
     * @secure
     * @response `201` `(number)[]` A list of contact ids that successfully created
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     * @response `520` `{ error?: string }` Internal error thrown from the EVE server
     */
    postCharactersCharacterIdContacts: (
      characterId: number,
      query: { datasource?: "tranquility"; label_ids?: number[]; standing: number; token?: string; watched?: boolean },
      contact_ids: number[],
      params: RequestParams = {},
    ) =>
      this.request<
        number[],
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
        | { error?: string }
      >({
        path: `/characters/${characterId}/contacts/`,
        method: "POST",
        query: query,
        body: contact_ids,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Bulk edit contacts with same settings --- Alternate route: `/dev/characters/{character_id}/contacts/` Alternate route: `/v2/characters/{character_id}/contacts/`
     *
     * @tags Contacts
     * @name PutCharactersCharacterIdContacts
     * @summary Edit contacts
     * @request PUT:/characters/{character_id}/contacts/
     * @secure
     * @response `204` `void` Contacts updated
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    putCharactersCharacterIdContacts: (
      characterId: number,
      query: { datasource?: "tranquility"; label_ids?: number[]; standing: number; token?: string; watched?: boolean },
      contact_ids: number[],
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/contacts/`,
        method: "PUT",
        query: query,
        body: contact_ids,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Return custom labels for a character's contacts --- Alternate route: `/dev/characters/{character_id}/contacts/labels/` Alternate route: `/legacy/characters/{character_id}/contacts/labels/` Alternate route: `/v1/characters/{character_id}/contacts/labels/` --- This route is cached for up to 300 seconds
     *
     * @tags Contacts
     * @name GetCharactersCharacterIdContactsLabels
     * @summary Get contact labels
     * @request GET:/characters/{character_id}/contacts/labels/
     * @secure
     * @response `200` `({ label_id: number, label_name: string })[]` A list of contact labels
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdContactsLabels: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { label_id: number; label_name: string }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/contacts/labels/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns contracts available to a character, only if the character is issuer, acceptor or assignee. Only returns contracts no older than 30 days, or if the status is "in_progress". --- Alternate route: `/dev/characters/{character_id}/contracts/` Alternate route: `/legacy/characters/{character_id}/contracts/` Alternate route: `/v1/characters/{character_id}/contracts/` --- This route is cached for up to 300 seconds
     *
     * @tags Contracts
     * @name GetCharactersCharacterIdContracts
     * @summary Get contracts
     * @request GET:/characters/{character_id}/contracts/
     * @secure
     * @response `200` `({ acceptor_id: number, assignee_id: number, availability: "public" | "personal" | "corporation" | "alliance", buyout?: number, collateral?: number, contract_id: number, date_accepted?: string, date_completed?: string, date_expired: string, date_issued: string, days_to_complete?: number, end_location_id?: number, for_corporation: boolean, issuer_corporation_id: number, issuer_id: number, price?: number, reward?: number, start_location_id?: number, status: "outstanding" | "in_progress" | "finished_issuer" | "finished_contractor" | "finished" | "cancelled" | "rejected" | "failed" | "deleted" | "reversed", title?: string, type: "unknown" | "item_exchange" | "auction" | "courier" | "loan", volume?: number })[]` A list of contracts
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdContracts: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          acceptor_id: number;
          assignee_id: number;
          availability: "public" | "personal" | "corporation" | "alliance";
          buyout?: number;
          collateral?: number;
          contract_id: number;
          date_accepted?: string;
          date_completed?: string;
          date_expired: string;
          date_issued: string;
          days_to_complete?: number;
          end_location_id?: number;
          for_corporation: boolean;
          issuer_corporation_id: number;
          issuer_id: number;
          price?: number;
          reward?: number;
          start_location_id?: number;
          status:
            | "outstanding"
            | "in_progress"
            | "finished_issuer"
            | "finished_contractor"
            | "finished"
            | "cancelled"
            | "rejected"
            | "failed"
            | "deleted"
            | "reversed";
          title?: string;
          type: "unknown" | "item_exchange" | "auction" | "courier" | "loan";
          volume?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/contracts/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Lists bids on a particular auction contract --- Alternate route: `/dev/characters/{character_id}/contracts/{contract_id}/bids/` Alternate route: `/legacy/characters/{character_id}/contracts/{contract_id}/bids/` Alternate route: `/v1/characters/{character_id}/contracts/{contract_id}/bids/` --- This route is cached for up to 300 seconds
     *
     * @tags Contracts
     * @name GetCharactersCharacterIdContractsContractIdBids
     * @summary Get contract bids
     * @request GET:/characters/{character_id}/contracts/{contract_id}/bids/
     * @secure
     * @response `200` `({ amount: number, bid_id: number, bidder_id: number, date_bid: string })[]` A list of bids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdContractsContractIdBids: (
      characterId: number,
      contractId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { amount: number; bid_id: number; bidder_id: number; date_bid: string }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/contracts/${contractId}/bids/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Lists items of a particular contract --- Alternate route: `/dev/characters/{character_id}/contracts/{contract_id}/items/` Alternate route: `/legacy/characters/{character_id}/contracts/{contract_id}/items/` Alternate route: `/v1/characters/{character_id}/contracts/{contract_id}/items/` --- This route is cached for up to 3600 seconds
     *
     * @tags Contracts
     * @name GetCharactersCharacterIdContractsContractIdItems
     * @summary Get contract items
     * @request GET:/characters/{character_id}/contracts/{contract_id}/items/
     * @secure
     * @response `200` `({ is_included: boolean, is_singleton: boolean, quantity: number, raw_quantity?: number, record_id: number, type_id: number })[]` A list of items in this contract
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdContractsContractIdItems: (
      characterId: number,
      contractId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          is_included: boolean;
          is_singleton: boolean;
          quantity: number;
          raw_quantity?: number;
          record_id: number;
          type_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/contracts/${contractId}/items/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of all the corporations a character has been a member of --- Alternate route: `/dev/characters/{character_id}/corporationhistory/` Alternate route: `/v2/characters/{character_id}/corporationhistory/` --- This route is cached for up to 86400 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdCorporationhistory
     * @summary Get corporation history
     * @request GET:/characters/{character_id}/corporationhistory/
     * @response `200` `({ corporation_id: number, is_deleted?: boolean, record_id: number, start_date: string })[]` Corporation history for the given character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdCorporationhistory: (
      characterId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        { corporation_id: number; is_deleted?: boolean; record_id: number; start_date: string }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/corporationhistory/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Takes a source character ID in the url and a set of target character ID's in the body, returns a CSPA charge cost --- Alternate route: `/dev/characters/{character_id}/cspa/` Alternate route: `/v5/characters/{character_id}/cspa/`
     *
     * @tags Character
     * @name PostCharactersCharacterIdCspa
     * @summary Calculate a CSPA charge cost
     * @request POST:/characters/{character_id}/cspa/
     * @secure
     * @response `201` `number` Aggregate cost of sending a mail from the source character to the target characters, in ISK
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postCharactersCharacterIdCspa: (
      characterId: number,
      characters: number[],
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        number,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/cspa/`,
        method: "POST",
        query: query,
        body: characters,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a character's jump activation and fatigue information --- Alternate route: `/dev/characters/{character_id}/fatigue/` Alternate route: `/v2/characters/{character_id}/fatigue/` --- This route is cached for up to 300 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdFatigue
     * @summary Get jump fatigue
     * @request GET:/characters/{character_id}/fatigue/
     * @secure
     * @response `200` `{ jump_fatigue_expire_date?: string, last_jump_date?: string, last_update_date?: string }` Jump activation and fatigue information
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdFatigue: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { jump_fatigue_expire_date?: string; last_jump_date?: string; last_update_date?: string },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/fatigue/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return fittings of a character --- Alternate route: `/dev/characters/{character_id}/fittings/` Alternate route: `/v2/characters/{character_id}/fittings/` --- This route is cached for up to 300 seconds
     *
     * @tags Fittings
     * @name GetCharactersCharacterIdFittings
     * @summary Get fittings
     * @request GET:/characters/{character_id}/fittings/
     * @secure
     * @response `200` `({ description: string, fitting_id: number, items: ({ flag: "Cargo" | "DroneBay" | "FighterBay" | "HiSlot0" | "HiSlot1" | "HiSlot2" | "HiSlot3" | "HiSlot4" | "HiSlot5" | "HiSlot6" | "HiSlot7" | "Invalid" | "LoSlot0" | "LoSlot1" | "LoSlot2" | "LoSlot3" | "LoSlot4" | "LoSlot5" | "LoSlot6" | "LoSlot7" | "MedSlot0" | "MedSlot1" | "MedSlot2" | "MedSlot3" | "MedSlot4" | "MedSlot5" | "MedSlot6" | "MedSlot7" | "RigSlot0" | "RigSlot1" | "RigSlot2" | "ServiceSlot0" | "ServiceSlot1" | "ServiceSlot2" | "ServiceSlot3" | "ServiceSlot4" | "ServiceSlot5" | "ServiceSlot6" | "ServiceSlot7" | "SubSystemSlot0" | "SubSystemSlot1" | "SubSystemSlot2" | "SubSystemSlot3", quantity: number, type_id: number })[], name: string, ship_type_id: number })[]` A list of fittings
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdFittings: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          description: string;
          fitting_id: number;
          items: {
            flag:
              | "Cargo"
              | "DroneBay"
              | "FighterBay"
              | "HiSlot0"
              | "HiSlot1"
              | "HiSlot2"
              | "HiSlot3"
              | "HiSlot4"
              | "HiSlot5"
              | "HiSlot6"
              | "HiSlot7"
              | "Invalid"
              | "LoSlot0"
              | "LoSlot1"
              | "LoSlot2"
              | "LoSlot3"
              | "LoSlot4"
              | "LoSlot5"
              | "LoSlot6"
              | "LoSlot7"
              | "MedSlot0"
              | "MedSlot1"
              | "MedSlot2"
              | "MedSlot3"
              | "MedSlot4"
              | "MedSlot5"
              | "MedSlot6"
              | "MedSlot7"
              | "RigSlot0"
              | "RigSlot1"
              | "RigSlot2"
              | "ServiceSlot0"
              | "ServiceSlot1"
              | "ServiceSlot2"
              | "ServiceSlot3"
              | "ServiceSlot4"
              | "ServiceSlot5"
              | "ServiceSlot6"
              | "ServiceSlot7"
              | "SubSystemSlot0"
              | "SubSystemSlot1"
              | "SubSystemSlot2"
              | "SubSystemSlot3";
            quantity: number;
            type_id: number;
          }[];
          name: string;
          ship_type_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/fittings/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Save a new fitting for a character --- Alternate route: `/dev/characters/{character_id}/fittings/` Alternate route: `/v2/characters/{character_id}/fittings/`
     *
     * @tags Fittings
     * @name PostCharactersCharacterIdFittings
     * @summary Create fitting
     * @request POST:/characters/{character_id}/fittings/
     * @secure
     * @response `201` `{ fitting_id: number }` A list of fittings
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postCharactersCharacterIdFittings: (
      characterId: number,
      fitting: {
        description: string;
        items: {
          flag:
            | "Cargo"
            | "DroneBay"
            | "FighterBay"
            | "HiSlot0"
            | "HiSlot1"
            | "HiSlot2"
            | "HiSlot3"
            | "HiSlot4"
            | "HiSlot5"
            | "HiSlot6"
            | "HiSlot7"
            | "Invalid"
            | "LoSlot0"
            | "LoSlot1"
            | "LoSlot2"
            | "LoSlot3"
            | "LoSlot4"
            | "LoSlot5"
            | "LoSlot6"
            | "LoSlot7"
            | "MedSlot0"
            | "MedSlot1"
            | "MedSlot2"
            | "MedSlot3"
            | "MedSlot4"
            | "MedSlot5"
            | "MedSlot6"
            | "MedSlot7"
            | "RigSlot0"
            | "RigSlot1"
            | "RigSlot2"
            | "ServiceSlot0"
            | "ServiceSlot1"
            | "ServiceSlot2"
            | "ServiceSlot3"
            | "ServiceSlot4"
            | "ServiceSlot5"
            | "ServiceSlot6"
            | "ServiceSlot7"
            | "SubSystemSlot0"
            | "SubSystemSlot1"
            | "SubSystemSlot2"
            | "SubSystemSlot3";
          quantity: number;
          type_id: number;
        }[];
        name: string;
        ship_type_id: number;
      },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { fitting_id: number },
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/fittings/`,
        method: "POST",
        query: query,
        body: fitting,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a fitting from a character --- Alternate route: `/dev/characters/{character_id}/fittings/{fitting_id}/` Alternate route: `/legacy/characters/{character_id}/fittings/{fitting_id}/` Alternate route: `/v1/characters/{character_id}/fittings/{fitting_id}/`
     *
     * @tags Fittings
     * @name DeleteCharactersCharacterIdFittingsFittingId
     * @summary Delete fitting
     * @request DELETE:/characters/{character_id}/fittings/{fitting_id}/
     * @secure
     * @response `204` `void` Fitting deleted
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    deleteCharactersCharacterIdFittingsFittingId: (
      characterId: number,
      fittingId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/fittings/${fittingId}/`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Return the fleet ID the character is in, if any. --- Alternate route: `/legacy/characters/{character_id}/fleet/` Alternate route: `/v1/characters/{character_id}/fleet/` --- This route is cached for up to 60 seconds --- Warning: This route has an upgrade available --- [Diff of the upcoming changes](https://esi.evetech.net/diff/latest/dev/#GET-/characters/{character_id}/fleet/)
     *
     * @tags Fleets
     * @name GetCharactersCharacterIdFleet
     * @summary Get character fleet info
     * @request GET:/characters/{character_id}/fleet/
     * @secure
     * @response `200` `{ fleet_id: number, role: "fleet_commander" | "squad_commander" | "squad_member" | "wing_commander", squad_id: number, wing_id: number }` Details about the character's fleet
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The character is not in a fleet
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdFleet: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          fleet_id: number;
          role: "fleet_commander" | "squad_commander" | "squad_member" | "wing_commander";
          squad_id: number;
          wing_id: number;
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/fleet/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Statistical overview of a character involved in faction warfare --- Alternate route: `/dev/characters/{character_id}/fw/stats/` Alternate route: `/legacy/characters/{character_id}/fw/stats/` Alternate route: `/v1/characters/{character_id}/fw/stats/` Alternate route: `/v2/characters/{character_id}/fw/stats/` --- This route expires daily at 11:05
     *
     * @tags Faction Warfare
     * @name GetCharactersCharacterIdFwStats
     * @summary Overview of a character involved in faction warfare
     * @request GET:/characters/{character_id}/fw/stats/
     * @secure
     * @response `200` `{ current_rank?: number, enlisted_on?: string, faction_id?: number, highest_rank?: number, kills: { last_week: number, total: number, yesterday: number }, victory_points: { last_week: number, total: number, yesterday: number } }` Faction warfare statistics for a given character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdFwStats: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          current_rank?: number;
          enlisted_on?: string;
          faction_id?: number;
          highest_rank?: number;
          kills: { last_week: number; total: number; yesterday: number };
          victory_points: { last_week: number; total: number; yesterday: number };
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/fw/stats/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return implants on the active clone of a character --- Alternate route: `/dev/characters/{character_id}/implants/` Alternate route: `/legacy/characters/{character_id}/implants/` Alternate route: `/v1/characters/{character_id}/implants/` Alternate route: `/v2/characters/{character_id}/implants/` --- This route is cached for up to 120 seconds
     *
     * @tags Clones
     * @name GetCharactersCharacterIdImplants
     * @summary Get active implants
     * @request GET:/characters/{character_id}/implants/
     * @secure
     * @response `200` `(number)[]` A list of implant type ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdImplants: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        number[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/implants/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List industry jobs placed by a character --- Alternate route: `/dev/characters/{character_id}/industry/jobs/` Alternate route: `/legacy/characters/{character_id}/industry/jobs/` Alternate route: `/v1/characters/{character_id}/industry/jobs/` --- This route is cached for up to 300 seconds
     *
     * @tags Industry
     * @name GetCharactersCharacterIdIndustryJobs
     * @summary List character industry jobs
     * @request GET:/characters/{character_id}/industry/jobs/
     * @secure
     * @response `200` `({ activity_id: number, blueprint_id: number, blueprint_location_id: number, blueprint_type_id: number, completed_character_id?: number, completed_date?: string, cost?: number, duration: number, end_date: string, facility_id: number, installer_id: number, job_id: number, licensed_runs?: number, output_location_id: number, pause_date?: string, probability?: number, product_type_id?: number, runs: number, start_date: string, station_id: number, status: "active" | "cancelled" | "delivered" | "paused" | "ready" | "reverted", successful_runs?: number })[]` Industry jobs placed by a character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdIndustryJobs: (
      characterId: number,
      query?: { datasource?: "tranquility"; include_completed?: boolean; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          activity_id: number;
          blueprint_id: number;
          blueprint_location_id: number;
          blueprint_type_id: number;
          completed_character_id?: number;
          completed_date?: string;
          cost?: number;
          duration: number;
          end_date: string;
          facility_id: number;
          installer_id: number;
          job_id: number;
          licensed_runs?: number;
          output_location_id: number;
          pause_date?: string;
          probability?: number;
          product_type_id?: number;
          runs: number;
          start_date: string;
          station_id: number;
          status: "active" | "cancelled" | "delivered" | "paused" | "ready" | "reverted";
          successful_runs?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/industry/jobs/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of a character's kills and losses going back 90 days --- Alternate route: `/dev/characters/{character_id}/killmails/recent/` Alternate route: `/legacy/characters/{character_id}/killmails/recent/` Alternate route: `/v1/characters/{character_id}/killmails/recent/` --- This route is cached for up to 300 seconds
     *
     * @tags Killmails
     * @name GetCharactersCharacterIdKillmailsRecent
     * @summary Get a character's recent kills and losses
     * @request GET:/characters/{character_id}/killmails/recent/
     * @secure
     * @response `200` `({ killmail_hash: string, killmail_id: number })[]` A list of killmail IDs and hashes
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdKillmailsRecent: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { killmail_hash: string; killmail_id: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/killmails/recent/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Information about the characters current location. Returns the current solar system id, and also the current station or structure ID if applicable --- Alternate route: `/dev/characters/{character_id}/location/` Alternate route: `/legacy/characters/{character_id}/location/` Alternate route: `/v1/characters/{character_id}/location/` Alternate route: `/v2/characters/{character_id}/location/` --- This route is cached for up to 5 seconds
     *
     * @tags Location
     * @name GetCharactersCharacterIdLocation
     * @summary Get character location
     * @request GET:/characters/{character_id}/location/
     * @secure
     * @response `200` `{ solar_system_id: number, station_id?: number, structure_id?: number }` Information about the characters current location. Returns the current solar system id, and also the current station or structure ID if applicable
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdLocation: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { solar_system_id: number; station_id?: number; structure_id?: number },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/location/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of loyalty points for all corporations the character has worked for --- Alternate route: `/dev/characters/{character_id}/loyalty/points/` Alternate route: `/legacy/characters/{character_id}/loyalty/points/` Alternate route: `/v1/characters/{character_id}/loyalty/points/` --- This route is cached for up to 3600 seconds
     *
     * @tags Loyalty
     * @name GetCharactersCharacterIdLoyaltyPoints
     * @summary Get loyalty points
     * @request GET:/characters/{character_id}/loyalty/points/
     * @secure
     * @response `200` `({ corporation_id: number, loyalty_points: number })[]` A list of loyalty points
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdLoyaltyPoints: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { corporation_id: number; loyalty_points: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/loyalty/points/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return the 50 most recent mail headers belonging to the character that match the query criteria. Queries can be filtered by label, and last_mail_id can be used to paginate backwards --- Alternate route: `/dev/characters/{character_id}/mail/` Alternate route: `/legacy/characters/{character_id}/mail/` Alternate route: `/v1/characters/{character_id}/mail/` --- This route is cached for up to 30 seconds
     *
     * @tags Mail
     * @name GetCharactersCharacterIdMail
     * @summary Return mail headers
     * @request GET:/characters/{character_id}/mail/
     * @secure
     * @response `200` `({ from?: number, is_read?: boolean, labels?: (number)[], mail_id?: number, recipients?: ({ recipient_id: number, recipient_type: "alliance" | "character" | "corporation" | "mailing_list" })[], subject?: string, timestamp?: string })[]` The requested mail
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdMail: (
      characterId: number,
      query?: { datasource?: "tranquility"; labels?: number[]; last_mail_id?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          from?: number;
          is_read?: boolean;
          labels?: number[];
          mail_id?: number;
          recipients?: {
            recipient_id: number;
            recipient_type: "alliance" | "character" | "corporation" | "mailing_list";
          }[];
          subject?: string;
          timestamp?: string;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/mail/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create and send a new mail --- Alternate route: `/dev/characters/{character_id}/mail/` Alternate route: `/legacy/characters/{character_id}/mail/` Alternate route: `/v1/characters/{character_id}/mail/`
     *
     * @tags Mail
     * @name PostCharactersCharacterIdMail
     * @summary Send a new mail
     * @request POST:/characters/{character_id}/mail/
     * @secure
     * @response `201` `number` Mail created
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     * @response `520` `{ error?: string }` Internal error thrown from the EVE server. Most of the time this means you have hit an EVE server rate limit
     */
    postCharactersCharacterIdMail: (
      characterId: number,
      mail: {
        approved_cost?: number;
        body: string;
        recipients: {
          recipient_id: number;
          recipient_type: "alliance" | "character" | "corporation" | "mailing_list";
        }[];
        subject: string;
      },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        number,
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
        | { error?: string }
      >({
        path: `/characters/${characterId}/mail/`,
        method: "POST",
        query: query,
        body: mail,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of the users mail labels, unread counts for each label and a total unread count. --- Alternate route: `/dev/characters/{character_id}/mail/labels/` Alternate route: `/v3/characters/{character_id}/mail/labels/` --- This route is cached for up to 30 seconds
     *
     * @tags Mail
     * @name GetCharactersCharacterIdMailLabels
     * @summary Get mail labels and unread counts
     * @request GET:/characters/{character_id}/mail/labels/
     * @secure
     * @response `200` `{ labels?: ({ color?: "#0000fe" | "#006634" | "#0099ff" | "#00ff33" | "#01ffff" | "#349800" | "#660066" | "#666666" | "#999999" | "#99ffff" | "#9a0000" | "#ccff9a" | "#e6e6e6" | "#fe0000" | "#ff6600" | "#ffff01" | "#ffffcd" | "#ffffff", label_id?: number, name?: string, unread_count?: number })[], total_unread_count?: number }` A list of mail labels and unread counts
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdMailLabels: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          labels?: {
            color?:
              | "#0000fe"
              | "#006634"
              | "#0099ff"
              | "#00ff33"
              | "#01ffff"
              | "#349800"
              | "#660066"
              | "#666666"
              | "#999999"
              | "#99ffff"
              | "#9a0000"
              | "#ccff9a"
              | "#e6e6e6"
              | "#fe0000"
              | "#ff6600"
              | "#ffff01"
              | "#ffffcd"
              | "#ffffff";
            label_id?: number;
            name?: string;
            unread_count?: number;
          }[];
          total_unread_count?: number;
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/mail/labels/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a mail label --- Alternate route: `/dev/characters/{character_id}/mail/labels/` Alternate route: `/legacy/characters/{character_id}/mail/labels/` Alternate route: `/v2/characters/{character_id}/mail/labels/`
     *
     * @tags Mail
     * @name PostCharactersCharacterIdMailLabels
     * @summary Create a mail label
     * @request POST:/characters/{character_id}/mail/labels/
     * @secure
     * @response `201` `number` Label created
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postCharactersCharacterIdMailLabels: (
      characterId: number,
      label: {
        color?:
          | "#0000fe"
          | "#006634"
          | "#0099ff"
          | "#00ff33"
          | "#01ffff"
          | "#349800"
          | "#660066"
          | "#666666"
          | "#999999"
          | "#99ffff"
          | "#9a0000"
          | "#ccff9a"
          | "#e6e6e6"
          | "#fe0000"
          | "#ff6600"
          | "#ffff01"
          | "#ffffcd"
          | "#ffffff";
        name: string;
      },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        number,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/mail/labels/`,
        method: "POST",
        query: query,
        body: label,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a mail label --- Alternate route: `/dev/characters/{character_id}/mail/labels/{label_id}/` Alternate route: `/legacy/characters/{character_id}/mail/labels/{label_id}/` Alternate route: `/v1/characters/{character_id}/mail/labels/{label_id}/`
     *
     * @tags Mail
     * @name DeleteCharactersCharacterIdMailLabelsLabelId
     * @summary Delete a mail label
     * @request DELETE:/characters/{character_id}/mail/labels/{label_id}/
     * @secure
     * @response `204` `void` Label deleted
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `422` `{ error?: string }` Default labels cannot be deleted
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    deleteCharactersCharacterIdMailLabelsLabelId: (
      characterId: number,
      labelId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | { error?: string }
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/mail/labels/${labelId}/`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Return all mailing lists that the character is subscribed to --- Alternate route: `/dev/characters/{character_id}/mail/lists/` Alternate route: `/legacy/characters/{character_id}/mail/lists/` Alternate route: `/v1/characters/{character_id}/mail/lists/` --- This route is cached for up to 120 seconds
     *
     * @tags Mail
     * @name GetCharactersCharacterIdMailLists
     * @summary Return mailing list subscriptions
     * @request GET:/characters/{character_id}/mail/lists/
     * @secure
     * @response `200` `({ mailing_list_id: number, name: string })[]` Mailing lists
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdMailLists: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { mailing_list_id: number; name: string }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/mail/lists/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a mail --- Alternate route: `/dev/characters/{character_id}/mail/{mail_id}/` Alternate route: `/legacy/characters/{character_id}/mail/{mail_id}/` Alternate route: `/v1/characters/{character_id}/mail/{mail_id}/`
     *
     * @tags Mail
     * @name DeleteCharactersCharacterIdMailMailId
     * @summary Delete a mail
     * @request DELETE:/characters/{character_id}/mail/{mail_id}/
     * @secure
     * @response `204` `void` Mail deleted
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    deleteCharactersCharacterIdMailMailId: (
      characterId: number,
      mailId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/mail/${mailId}/`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Return the contents of an EVE mail --- Alternate route: `/dev/characters/{character_id}/mail/{mail_id}/` Alternate route: `/legacy/characters/{character_id}/mail/{mail_id}/` Alternate route: `/v1/characters/{character_id}/mail/{mail_id}/` --- This route is cached for up to 30 seconds
     *
     * @tags Mail
     * @name GetCharactersCharacterIdMailMailId
     * @summary Return a mail
     * @request GET:/characters/{character_id}/mail/{mail_id}/
     * @secure
     * @response `200` `{ body?: string, from?: number, labels?: (number)[], read?: boolean, recipients?: ({ recipient_id: number, recipient_type: "alliance" | "character" | "corporation" | "mailing_list" })[], subject?: string, timestamp?: string }` Contents of a mail
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Mail not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdMailMailId: (
      characterId: number,
      mailId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          body?: string;
          from?: number;
          labels?: number[];
          read?: boolean;
          recipients?: {
            recipient_id: number;
            recipient_type: "alliance" | "character" | "corporation" | "mailing_list";
          }[];
          subject?: string;
          timestamp?: string;
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/mail/${mailId}/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update metadata about a mail --- Alternate route: `/dev/characters/{character_id}/mail/{mail_id}/` Alternate route: `/legacy/characters/{character_id}/mail/{mail_id}/` Alternate route: `/v1/characters/{character_id}/mail/{mail_id}/`
     *
     * @tags Mail
     * @name PutCharactersCharacterIdMailMailId
     * @summary Update metadata about a mail
     * @request PUT:/characters/{character_id}/mail/{mail_id}/
     * @secure
     * @response `204` `void` Mail updated
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    putCharactersCharacterIdMailMailId: (
      characterId: number,
      mailId: number,
      contents: { labels?: number[]; read?: boolean },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/characters/${characterId}/mail/${mailId}/`,
        method: "PUT",
        query: query,
        body: contents,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Return a list of medals the character has --- Alternate route: `/dev/characters/{character_id}/medals/` Alternate route: `/v2/characters/{character_id}/medals/` --- This route is cached for up to 3600 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdMedals
     * @summary Get medals
     * @request GET:/characters/{character_id}/medals/
     * @secure
     * @response `200` `({ corporation_id: number, date: string, description: string, graphics: ({ color?: number, graphic: string, layer: number, part: number })[], issuer_id: number, medal_id: number, reason: string, status: "public" | "private", title: string })[]` A list of medals
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdMedals: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          corporation_id: number;
          date: string;
          description: string;
          graphics: { color?: number; graphic: string; layer: number; part: number }[];
          issuer_id: number;
          medal_id: number;
          reason: string;
          status: "public" | "private";
          title: string;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/medals/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Paginated record of all mining done by a character for the past 30 days --- Alternate route: `/dev/characters/{character_id}/mining/` Alternate route: `/legacy/characters/{character_id}/mining/` Alternate route: `/v1/characters/{character_id}/mining/` --- This route is cached for up to 600 seconds
     *
     * @tags Industry
     * @name GetCharactersCharacterIdMining
     * @summary Character mining ledger
     * @request GET:/characters/{character_id}/mining/
     * @secure
     * @response `200` `({ date: string, quantity: number, solar_system_id: number, type_id: number })[]` Mining ledger of a character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdMining: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { date: string; quantity: number; solar_system_id: number; type_id: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/mining/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return character notifications --- Alternate route: `/dev/characters/{character_id}/notifications/` Alternate route: `/v5/characters/{character_id}/notifications/` Alternate route: `/v6/characters/{character_id}/notifications/` --- This route is cached for up to 600 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdNotifications
     * @summary Get character notifications
     * @request GET:/characters/{character_id}/notifications/
     * @secure
     * @response `200` `({ is_read?: boolean, notification_id: number, sender_id: number, sender_type: "character" | "corporation" | "alliance" | "faction" | "other", text?: string, timestamp: string, type: "AcceptedAlly" | "AcceptedSurrender" | "AgentRetiredTrigravian" | "AllAnchoringMsg" | "AllMaintenanceBillMsg" | "AllStrucInvulnerableMsg" | "AllStructVulnerableMsg" | "AllWarCorpJoinedAllianceMsg" | "AllWarDeclaredMsg" | "AllWarInvalidatedMsg" | "AllWarRetractedMsg" | "AllWarSurrenderMsg" | "AllianceCapitalChanged" | "AllianceWarDeclaredV2" | "AllyContractCancelled" | "AllyJoinedWarAggressorMsg" | "AllyJoinedWarAllyMsg" | "AllyJoinedWarDefenderMsg" | "BattlePunishFriendlyFire" | "BillOutOfMoneyMsg" | "BillPaidCorpAllMsg" | "BountyClaimMsg" | "BountyESSShared" | "BountyESSTaken" | "BountyPlacedAlliance" | "BountyPlacedChar" | "BountyPlacedCorp" | "BountyYourBountyClaimed" | "BuddyConnectContactAdd" | "CharAppAcceptMsg" | "CharAppRejectMsg" | "CharAppWithdrawMsg" | "CharLeftCorpMsg" | "CharMedalMsg" | "CharTerminationMsg" | "CloneActivationMsg" | "CloneActivationMsg2" | "CloneMovedMsg" | "CloneRevokedMsg1" | "CloneRevokedMsg2" | "CombatOperationFinished" | "ContactAdd" | "ContactEdit" | "ContainerPasswordMsg" | "ContractRegionChangedToPochven" | "CorpAllBillMsg" | "CorpAppAcceptMsg" | "CorpAppInvitedMsg" | "CorpAppNewMsg" | "CorpAppRejectCustomMsg" | "CorpAppRejectMsg" | "CorpBecameWarEligible" | "CorpDividendMsg" | "CorpFriendlyFireDisableTimerCompleted" | "CorpFriendlyFireDisableTimerStarted" | "CorpFriendlyFireEnableTimerCompleted" | "CorpFriendlyFireEnableTimerStarted" | "CorpKicked" | "CorpLiquidationMsg" | "CorpNewCEOMsg" | "CorpNewsMsg" | "CorpNoLongerWarEligible" | "CorpOfficeExpirationMsg" | "CorpStructLostMsg" | "CorpTaxChangeMsg" | "CorpVoteCEORevokedMsg" | "CorpVoteMsg" | "CorpWarDeclaredMsg" | "CorpWarDeclaredV2" | "CorpWarFightingLegalMsg" | "CorpWarInvalidatedMsg" | "CorpWarRetractedMsg" | "CorpWarSurrenderMsg" | "CustomsMsg" | "DeclareWar" | "DistrictAttacked" | "DustAppAcceptedMsg" | "ESSMainBankLink" | "EntosisCaptureStarted" | "ExpertSystemExpired" | "ExpertSystemExpiryImminent" | "FWAllianceKickMsg" | "FWAllianceWarningMsg" | "FWCharKickMsg" | "FWCharRankGainMsg" | "FWCharRankLossMsg" | "FWCharWarningMsg" | "FWCorpJoinMsg" | "FWCorpKickMsg" | "FWCorpLeaveMsg" | "FWCorpWarningMsg" | "FacWarCorpJoinRequestMsg" | "FacWarCorpJoinWithdrawMsg" | "FacWarCorpLeaveRequestMsg" | "FacWarCorpLeaveWithdrawMsg" | "FacWarLPDisqualifiedEvent" | "FacWarLPDisqualifiedKill" | "FacWarLPPayoutEvent" | "FacWarLPPayoutKill" | "GameTimeAdded" | "GameTimeReceived" | "GameTimeSent" | "GiftReceived" | "IHubDestroyedByBillFailure" | "IncursionCompletedMsg" | "IndustryOperationFinished" | "IndustryTeamAuctionLost" | "IndustryTeamAuctionWon" | "InfrastructureHubBillAboutToExpire" | "InsuranceExpirationMsg" | "InsuranceFirstShipMsg" | "InsuranceInvalidatedMsg" | "InsuranceIssuedMsg" | "InsurancePayoutMsg" | "InvasionCompletedMsg" | "InvasionSystemLogin" | "InvasionSystemStart" | "JumpCloneDeletedMsg1" | "JumpCloneDeletedMsg2" | "KillReportFinalBlow" | "KillReportVictim" | "KillRightAvailable" | "KillRightAvailableOpen" | "KillRightEarned" | "KillRightUnavailable" | "KillRightUnavailableOpen" | "KillRightUsed" | "LocateCharMsg" | "MadeWarMutual" | "MercOfferRetractedMsg" | "MercOfferedNegotiationMsg" | "MissionCanceledTriglavian" | "MissionOfferExpirationMsg" | "MissionTimeoutMsg" | "MoonminingAutomaticFracture" | "MoonminingExtractionCancelled" | "MoonminingExtractionFinished" | "MoonminingExtractionStarted" | "MoonminingLaserFired" | "MutualWarExpired" | "MutualWarInviteAccepted" | "MutualWarInviteRejected" | "MutualWarInviteSent" | "NPCStandingsGained" | "NPCStandingsLost" | "OfferToAllyRetracted" | "OfferedSurrender" | "OfferedToAlly" | "OfficeLeaseCanceledInsufficientStandings" | "OldLscMessages" | "OperationFinished" | "OrbitalAttacked" | "OrbitalReinforced" | "OwnershipTransferred" | "RaffleCreated" | "RaffleExpired" | "RaffleFinished" | "ReimbursementMsg" | "ResearchMissionAvailableMsg" | "RetractsWar" | "SeasonalChallengeCompleted" | "SovAllClaimAquiredMsg" | "SovAllClaimLostMsg" | "SovCommandNodeEventStarted" | "SovCorpBillLateMsg" | "SovCorpClaimFailMsg" | "SovDisruptorMsg" | "SovStationEnteredFreeport" | "SovStructureDestroyed" | "SovStructureReinforced" | "SovStructureSelfDestructCancel" | "SovStructureSelfDestructFinished" | "SovStructureSelfDestructRequested" | "SovereigntyIHDamageMsg" | "SovereigntySBUDamageMsg" | "SovereigntyTCUDamageMsg" | "StationAggressionMsg1" | "StationAggressionMsg2" | "StationConquerMsg" | "StationServiceDisabled" | "StationServiceEnabled" | "StationStateChangeMsg" | "StoryLineMissionAvailableMsg" | "StructureAnchoring" | "StructureCourierContractChanged" | "StructureDestroyed" | "StructureFuelAlert" | "StructureImpendingAbandonmentAssetsAtRisk" | "StructureItemsDelivered" | "StructureItemsMovedToSafety" | "StructureLostArmor" | "StructureLostShields" | "StructureOnline" | "StructureServicesOffline" | "StructureUnanchoring" | "StructureUnderAttack" | "StructureWentHighPower" | "StructureWentLowPower" | "StructuresJobsCancelled" | "StructuresJobsPaused" | "StructuresReinforcementChanged" | "TowerAlertMsg" | "TowerResourceAlertMsg" | "TransactionReversalMsg" | "TutorialMsg" | "WarAdopted " | "WarAllyInherited" | "WarAllyOfferDeclinedMsg" | "WarConcordInvalidates" | "WarDeclared" | "WarEndedHqSecurityDrop" | "WarHQRemovedFromSpace" | "WarInherited" | "WarInvalid" | "WarRetracted" | "WarRetractedByConcord" | "WarSurrenderDeclinedMsg" | "WarSurrenderOfferMsg" })[]` Returns your recent notifications
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdNotifications: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          is_read?: boolean;
          notification_id: number;
          sender_id: number;
          sender_type: "character" | "corporation" | "alliance" | "faction" | "other";
          text?: string;
          timestamp: string;
          type:
            | "AcceptedAlly"
            | "AcceptedSurrender"
            | "AgentRetiredTrigravian"
            | "AllAnchoringMsg"
            | "AllMaintenanceBillMsg"
            | "AllStrucInvulnerableMsg"
            | "AllStructVulnerableMsg"
            | "AllWarCorpJoinedAllianceMsg"
            | "AllWarDeclaredMsg"
            | "AllWarInvalidatedMsg"
            | "AllWarRetractedMsg"
            | "AllWarSurrenderMsg"
            | "AllianceCapitalChanged"
            | "AllianceWarDeclaredV2"
            | "AllyContractCancelled"
            | "AllyJoinedWarAggressorMsg"
            | "AllyJoinedWarAllyMsg"
            | "AllyJoinedWarDefenderMsg"
            | "BattlePunishFriendlyFire"
            | "BillOutOfMoneyMsg"
            | "BillPaidCorpAllMsg"
            | "BountyClaimMsg"
            | "BountyESSShared"
            | "BountyESSTaken"
            | "BountyPlacedAlliance"
            | "BountyPlacedChar"
            | "BountyPlacedCorp"
            | "BountyYourBountyClaimed"
            | "BuddyConnectContactAdd"
            | "CharAppAcceptMsg"
            | "CharAppRejectMsg"
            | "CharAppWithdrawMsg"
            | "CharLeftCorpMsg"
            | "CharMedalMsg"
            | "CharTerminationMsg"
            | "CloneActivationMsg"
            | "CloneActivationMsg2"
            | "CloneMovedMsg"
            | "CloneRevokedMsg1"
            | "CloneRevokedMsg2"
            | "CombatOperationFinished"
            | "ContactAdd"
            | "ContactEdit"
            | "ContainerPasswordMsg"
            | "ContractRegionChangedToPochven"
            | "CorpAllBillMsg"
            | "CorpAppAcceptMsg"
            | "CorpAppInvitedMsg"
            | "CorpAppNewMsg"
            | "CorpAppRejectCustomMsg"
            | "CorpAppRejectMsg"
            | "CorpBecameWarEligible"
            | "CorpDividendMsg"
            | "CorpFriendlyFireDisableTimerCompleted"
            | "CorpFriendlyFireDisableTimerStarted"
            | "CorpFriendlyFireEnableTimerCompleted"
            | "CorpFriendlyFireEnableTimerStarted"
            | "CorpKicked"
            | "CorpLiquidationMsg"
            | "CorpNewCEOMsg"
            | "CorpNewsMsg"
            | "CorpNoLongerWarEligible"
            | "CorpOfficeExpirationMsg"
            | "CorpStructLostMsg"
            | "CorpTaxChangeMsg"
            | "CorpVoteCEORevokedMsg"
            | "CorpVoteMsg"
            | "CorpWarDeclaredMsg"
            | "CorpWarDeclaredV2"
            | "CorpWarFightingLegalMsg"
            | "CorpWarInvalidatedMsg"
            | "CorpWarRetractedMsg"
            | "CorpWarSurrenderMsg"
            | "CustomsMsg"
            | "DeclareWar"
            | "DistrictAttacked"
            | "DustAppAcceptedMsg"
            | "ESSMainBankLink"
            | "EntosisCaptureStarted"
            | "ExpertSystemExpired"
            | "ExpertSystemExpiryImminent"
            | "FWAllianceKickMsg"
            | "FWAllianceWarningMsg"
            | "FWCharKickMsg"
            | "FWCharRankGainMsg"
            | "FWCharRankLossMsg"
            | "FWCharWarningMsg"
            | "FWCorpJoinMsg"
            | "FWCorpKickMsg"
            | "FWCorpLeaveMsg"
            | "FWCorpWarningMsg"
            | "FacWarCorpJoinRequestMsg"
            | "FacWarCorpJoinWithdrawMsg"
            | "FacWarCorpLeaveRequestMsg"
            | "FacWarCorpLeaveWithdrawMsg"
            | "FacWarLPDisqualifiedEvent"
            | "FacWarLPDisqualifiedKill"
            | "FacWarLPPayoutEvent"
            | "FacWarLPPayoutKill"
            | "GameTimeAdded"
            | "GameTimeReceived"
            | "GameTimeSent"
            | "GiftReceived"
            | "IHubDestroyedByBillFailure"
            | "IncursionCompletedMsg"
            | "IndustryOperationFinished"
            | "IndustryTeamAuctionLost"
            | "IndustryTeamAuctionWon"
            | "InfrastructureHubBillAboutToExpire"
            | "InsuranceExpirationMsg"
            | "InsuranceFirstShipMsg"
            | "InsuranceInvalidatedMsg"
            | "InsuranceIssuedMsg"
            | "InsurancePayoutMsg"
            | "InvasionCompletedMsg"
            | "InvasionSystemLogin"
            | "InvasionSystemStart"
            | "JumpCloneDeletedMsg1"
            | "JumpCloneDeletedMsg2"
            | "KillReportFinalBlow"
            | "KillReportVictim"
            | "KillRightAvailable"
            | "KillRightAvailableOpen"
            | "KillRightEarned"
            | "KillRightUnavailable"
            | "KillRightUnavailableOpen"
            | "KillRightUsed"
            | "LocateCharMsg"
            | "MadeWarMutual"
            | "MercOfferRetractedMsg"
            | "MercOfferedNegotiationMsg"
            | "MissionCanceledTriglavian"
            | "MissionOfferExpirationMsg"
            | "MissionTimeoutMsg"
            | "MoonminingAutomaticFracture"
            | "MoonminingExtractionCancelled"
            | "MoonminingExtractionFinished"
            | "MoonminingExtractionStarted"
            | "MoonminingLaserFired"
            | "MutualWarExpired"
            | "MutualWarInviteAccepted"
            | "MutualWarInviteRejected"
            | "MutualWarInviteSent"
            | "NPCStandingsGained"
            | "NPCStandingsLost"
            | "OfferToAllyRetracted"
            | "OfferedSurrender"
            | "OfferedToAlly"
            | "OfficeLeaseCanceledInsufficientStandings"
            | "OldLscMessages"
            | "OperationFinished"
            | "OrbitalAttacked"
            | "OrbitalReinforced"
            | "OwnershipTransferred"
            | "RaffleCreated"
            | "RaffleExpired"
            | "RaffleFinished"
            | "ReimbursementMsg"
            | "ResearchMissionAvailableMsg"
            | "RetractsWar"
            | "SeasonalChallengeCompleted"
            | "SovAllClaimAquiredMsg"
            | "SovAllClaimLostMsg"
            | "SovCommandNodeEventStarted"
            | "SovCorpBillLateMsg"
            | "SovCorpClaimFailMsg"
            | "SovDisruptorMsg"
            | "SovStationEnteredFreeport"
            | "SovStructureDestroyed"
            | "SovStructureReinforced"
            | "SovStructureSelfDestructCancel"
            | "SovStructureSelfDestructFinished"
            | "SovStructureSelfDestructRequested"
            | "SovereigntyIHDamageMsg"
            | "SovereigntySBUDamageMsg"
            | "SovereigntyTCUDamageMsg"
            | "StationAggressionMsg1"
            | "StationAggressionMsg2"
            | "StationConquerMsg"
            | "StationServiceDisabled"
            | "StationServiceEnabled"
            | "StationStateChangeMsg"
            | "StoryLineMissionAvailableMsg"
            | "StructureAnchoring"
            | "StructureCourierContractChanged"
            | "StructureDestroyed"
            | "StructureFuelAlert"
            | "StructureImpendingAbandonmentAssetsAtRisk"
            | "StructureItemsDelivered"
            | "StructureItemsMovedToSafety"
            | "StructureLostArmor"
            | "StructureLostShields"
            | "StructureOnline"
            | "StructureServicesOffline"
            | "StructureUnanchoring"
            | "StructureUnderAttack"
            | "StructureWentHighPower"
            | "StructureWentLowPower"
            | "StructuresJobsCancelled"
            | "StructuresJobsPaused"
            | "StructuresReinforcementChanged"
            | "TowerAlertMsg"
            | "TowerResourceAlertMsg"
            | "TransactionReversalMsg"
            | "TutorialMsg"
            | "WarAdopted "
            | "WarAllyInherited"
            | "WarAllyOfferDeclinedMsg"
            | "WarConcordInvalidates"
            | "WarDeclared"
            | "WarEndedHqSecurityDrop"
            | "WarHQRemovedFromSpace"
            | "WarInherited"
            | "WarInvalid"
            | "WarRetracted"
            | "WarRetractedByConcord"
            | "WarSurrenderDeclinedMsg"
            | "WarSurrenderOfferMsg";
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/notifications/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return notifications about having been added to someone's contact list --- Alternate route: `/dev/characters/{character_id}/notifications/contacts/` Alternate route: `/v2/characters/{character_id}/notifications/contacts/` --- This route is cached for up to 600 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdNotificationsContacts
     * @summary Get new contact notifications
     * @request GET:/characters/{character_id}/notifications/contacts/
     * @secure
     * @response `200` `({ message: string, notification_id: number, send_date: string, sender_character_id: number, standing_level: number })[]` A list of contact notifications
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdNotificationsContacts: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          message: string;
          notification_id: number;
          send_date: string;
          sender_character_id: number;
          standing_level: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/notifications/contacts/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Checks if the character is currently online --- Alternate route: `/dev/characters/{character_id}/online/` Alternate route: `/v2/characters/{character_id}/online/` Alternate route: `/v3/characters/{character_id}/online/` --- This route is cached for up to 60 seconds
     *
     * @tags Location
     * @name GetCharactersCharacterIdOnline
     * @summary Get character online
     * @request GET:/characters/{character_id}/online/
     * @secure
     * @response `200` `{ last_login?: string, last_logout?: string, logins?: number, online: boolean }` Object describing the character's online status
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdOnline: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { last_login?: string; last_logout?: string; logins?: number; online: boolean },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/online/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of tasks finished by a character --- Alternate route: `/dev/characters/{character_id}/opportunities/` Alternate route: `/legacy/characters/{character_id}/opportunities/` Alternate route: `/v1/characters/{character_id}/opportunities/` --- This route is cached for up to 3600 seconds
     *
     * @tags Opportunities
     * @name GetCharactersCharacterIdOpportunities
     * @summary Get a character's completed tasks
     * @request GET:/characters/{character_id}/opportunities/
     * @secure
     * @response `200` `({ completed_at: string, task_id: number })[]` A list of opportunities task ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdOpportunities: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { completed_at: string; task_id: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/opportunities/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List open market orders placed by a character --- Alternate route: `/dev/characters/{character_id}/orders/` Alternate route: `/v2/characters/{character_id}/orders/` --- This route is cached for up to 1200 seconds
     *
     * @tags Market
     * @name GetCharactersCharacterIdOrders
     * @summary List open orders from a character
     * @request GET:/characters/{character_id}/orders/
     * @secure
     * @response `200` `({ duration: number, escrow?: number, is_buy_order?: boolean, is_corporation: boolean, issued: string, location_id: number, min_volume?: number, order_id: number, price: number, range: "1" | "10" | "2" | "20" | "3" | "30" | "4" | "40" | "5" | "region" | "solarsystem" | "station", region_id: number, type_id: number, volume_remain: number, volume_total: number })[]` Open market orders placed by a character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdOrders: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          duration: number;
          escrow?: number;
          is_buy_order?: boolean;
          is_corporation: boolean;
          issued: string;
          location_id: number;
          min_volume?: number;
          order_id: number;
          price: number;
          range: "1" | "10" | "2" | "20" | "3" | "30" | "4" | "40" | "5" | "region" | "solarsystem" | "station";
          region_id: number;
          type_id: number;
          volume_remain: number;
          volume_total: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/orders/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List cancelled and expired market orders placed by a character up to 90 days in the past. --- Alternate route: `/dev/characters/{character_id}/orders/history/` Alternate route: `/legacy/characters/{character_id}/orders/history/` Alternate route: `/v1/characters/{character_id}/orders/history/` --- This route is cached for up to 3600 seconds
     *
     * @tags Market
     * @name GetCharactersCharacterIdOrdersHistory
     * @summary List historical orders by a character
     * @request GET:/characters/{character_id}/orders/history/
     * @secure
     * @response `200` `({ duration: number, escrow?: number, is_buy_order?: boolean, is_corporation: boolean, issued: string, location_id: number, min_volume?: number, order_id: number, price: number, range: "1" | "10" | "2" | "20" | "3" | "30" | "4" | "40" | "5" | "region" | "solarsystem" | "station", region_id: number, state: "cancelled" | "expired", type_id: number, volume_remain: number, volume_total: number })[]` Expired and cancelled market orders placed by a character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdOrdersHistory: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          duration: number;
          escrow?: number;
          is_buy_order?: boolean;
          is_corporation: boolean;
          issued: string;
          location_id: number;
          min_volume?: number;
          order_id: number;
          price: number;
          range: "1" | "10" | "2" | "20" | "3" | "30" | "4" | "40" | "5" | "region" | "solarsystem" | "station";
          region_id: number;
          state: "cancelled" | "expired";
          type_id: number;
          volume_remain: number;
          volume_total: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/orders/history/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a list of all planetary colonies owned by a character. --- Alternate route: `/dev/characters/{character_id}/planets/` Alternate route: `/legacy/characters/{character_id}/planets/` Alternate route: `/v1/characters/{character_id}/planets/` --- This route is cached for up to 600 seconds
     *
     * @tags Planetary Interaction
     * @name GetCharactersCharacterIdPlanets
     * @summary Get colonies
     * @request GET:/characters/{character_id}/planets/
     * @secure
     * @response `200` `({ last_update: string, num_pins: number, owner_id: number, planet_id: number, planet_type: "temperate" | "barren" | "oceanic" | "ice" | "gas" | "lava" | "storm" | "plasma", solar_system_id: number, upgrade_level: number })[]` List of colonies
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdPlanets: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          last_update: string;
          num_pins: number;
          owner_id: number;
          planet_id: number;
          planet_type: "temperate" | "barren" | "oceanic" | "ice" | "gas" | "lava" | "storm" | "plasma";
          solar_system_id: number;
          upgrade_level: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/planets/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns full details on the layout of a single planetary colony, including links, pins and routes. Note: Planetary information is only recalculated when the colony is viewed through the client. Information will not update until this criteria is met. --- Alternate route: `/dev/characters/{character_id}/planets/{planet_id}/` Alternate route: `/v3/characters/{character_id}/planets/{planet_id}/`
     *
     * @tags Planetary Interaction
     * @name GetCharactersCharacterIdPlanetsPlanetId
     * @summary Get colony layout
     * @request GET:/characters/{character_id}/planets/{planet_id}/
     * @secure
     * @response `200` `{ links: ({ destination_pin_id: number, link_level: number, source_pin_id: number })[], pins: ({ contents?: ({ amount: number, type_id: number })[], expiry_time?: string, extractor_details?: { cycle_time?: number, head_radius?: number, heads: ({ head_id: number, latitude: number, longitude: number })[], product_type_id?: number, qty_per_cycle?: number }, factory_details?: { schematic_id: number }, install_time?: string, last_cycle_start?: string, latitude: number, longitude: number, pin_id: number, schematic_id?: number, type_id: number })[], routes: ({ content_type_id: number, destination_pin_id: number, quantity: number, route_id: number, source_pin_id: number, waypoints?: (number)[] })[] }` Colony layout
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Colony not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdPlanetsPlanetId: (
      characterId: number,
      planetId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          links: { destination_pin_id: number; link_level: number; source_pin_id: number }[];
          pins: {
            contents?: { amount: number; type_id: number }[];
            expiry_time?: string;
            extractor_details?: {
              cycle_time?: number;
              head_radius?: number;
              heads: { head_id: number; latitude: number; longitude: number }[];
              product_type_id?: number;
              qty_per_cycle?: number;
            };
            factory_details?: { schematic_id: number };
            install_time?: string;
            last_cycle_start?: string;
            latitude: number;
            longitude: number;
            pin_id: number;
            schematic_id?: number;
            type_id: number;
          }[];
          routes: {
            content_type_id: number;
            destination_pin_id: number;
            quantity: number;
            route_id: number;
            source_pin_id: number;
            waypoints?: number[];
          }[];
        },
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/planets/${planetId}/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get portrait urls for a character --- Alternate route: `/dev/characters/{character_id}/portrait/` Alternate route: `/v2/characters/{character_id}/portrait/` Alternate route: `/v3/characters/{character_id}/portrait/` --- This route expires daily at 11:05
     *
     * @tags Character
     * @name GetCharactersCharacterIdPortrait
     * @summary Get character portraits
     * @request GET:/characters/{character_id}/portrait/
     * @response `200` `{ "px128x128"?: string, "px256x256"?: string, "px512x512"?: string, "px64x64"?: string }` Public data for the given character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` No image server for this datasource
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdPortrait: (
      characterId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        { px128x128?: string; px256x256?: string; px512x512?: string; px64x64?: string },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/portrait/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a character's corporation roles --- Alternate route: `/dev/characters/{character_id}/roles/` Alternate route: `/v3/characters/{character_id}/roles/` --- This route is cached for up to 3600 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdRoles
     * @summary Get character corporation roles
     * @request GET:/characters/{character_id}/roles/
     * @secure
     * @response `200` `{ roles?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles_at_base?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles_at_hq?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles_at_other?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[] }` The character's roles in thier corporation
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdRoles: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          roles?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles_at_base?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles_at_hq?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles_at_other?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/roles/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Search for entities that match a given sub-string. --- Alternate route: `/dev/characters/{character_id}/search/` Alternate route: `/legacy/characters/{character_id}/search/` Alternate route: `/v3/characters/{character_id}/search/` --- This route is cached for up to 3600 seconds
     *
     * @tags Search
     * @name GetCharactersCharacterIdSearch
     * @summary Search on a string
     * @request GET:/characters/{character_id}/search/
     * @secure
     * @response `200` `{ agent?: (number)[], alliance?: (number)[], character?: (number)[], constellation?: (number)[], corporation?: (number)[], faction?: (number)[], inventory_type?: (number)[], region?: (number)[], solar_system?: (number)[], station?: (number)[], structure?: (number)[] }` A list of search results
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdSearch: (
      characterId: number,
      query: {
        categories: (
          | "agent"
          | "alliance"
          | "character"
          | "constellation"
          | "corporation"
          | "faction"
          | "inventory_type"
          | "region"
          | "solar_system"
          | "station"
          | "structure"
        )[];
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
        search: string;
        strict?: boolean;
        token?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          agent?: number[];
          alliance?: number[];
          character?: number[];
          constellation?: number[];
          corporation?: number[];
          faction?: number[];
          inventory_type?: number[];
          region?: number[];
          solar_system?: number[];
          station?: number[];
          structure?: number[];
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/search/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the current ship type, name and id --- Alternate route: `/dev/characters/{character_id}/ship/` Alternate route: `/legacy/characters/{character_id}/ship/` Alternate route: `/v1/characters/{character_id}/ship/` Alternate route: `/v2/characters/{character_id}/ship/` --- This route is cached for up to 5 seconds
     *
     * @tags Location
     * @name GetCharactersCharacterIdShip
     * @summary Get current ship
     * @request GET:/characters/{character_id}/ship/
     * @secure
     * @response `200` `{ ship_item_id: number, ship_name: string, ship_type_id: number }` Get the current ship type, name and id
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdShip: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { ship_item_id: number; ship_name: string; ship_type_id: number },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/ship/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List the configured skill queue for the given character --- Alternate route: `/dev/characters/{character_id}/skillqueue/` Alternate route: `/legacy/characters/{character_id}/skillqueue/` Alternate route: `/v2/characters/{character_id}/skillqueue/` --- This route is cached for up to 120 seconds
     *
     * @tags Skills
     * @name GetCharactersCharacterIdSkillqueue
     * @summary Get character's skill queue
     * @request GET:/characters/{character_id}/skillqueue/
     * @secure
     * @response `200` `({ finish_date?: string, finished_level: number, level_end_sp?: number, level_start_sp?: number, queue_position: number, skill_id: number, start_date?: string, training_start_sp?: number })[]` The current skill queue, sorted ascending by finishing time
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdSkillqueue: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          finish_date?: string;
          finished_level: number;
          level_end_sp?: number;
          level_start_sp?: number;
          queue_position: number;
          skill_id: number;
          start_date?: string;
          training_start_sp?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/skillqueue/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List all trained skills for the given character --- Alternate route: `/dev/characters/{character_id}/skills/` Alternate route: `/v4/characters/{character_id}/skills/` --- This route is cached for up to 120 seconds
     *
     * @tags Skills
     * @name GetCharactersCharacterIdSkills
     * @summary Get character skills
     * @request GET:/characters/{character_id}/skills/
     * @secure
     * @response `200` `{ skills: ({ active_skill_level: number, skill_id: number, skillpoints_in_skill: number, trained_skill_level: number })[], total_sp: number, unallocated_sp?: number }` Known skills for the character
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdSkills: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          skills: {
            active_skill_level: number;
            skill_id: number;
            skillpoints_in_skill: number;
            trained_skill_level: number;
          }[];
          total_sp: number;
          unallocated_sp?: number;
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/skills/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return character standings from agents, NPC corporations, and factions --- Alternate route: `/dev/characters/{character_id}/standings/` Alternate route: `/v2/characters/{character_id}/standings/` --- This route is cached for up to 3600 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdStandings
     * @summary Get standings
     * @request GET:/characters/{character_id}/standings/
     * @secure
     * @response `200` `({ from_id: number, from_type: "agent" | "npc_corp" | "faction", standing: number })[]` A list of standings
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdStandings: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { from_id: number; from_type: "agent" | "npc_corp" | "faction"; standing: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/standings/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a character's titles --- Alternate route: `/dev/characters/{character_id}/titles/` Alternate route: `/v2/characters/{character_id}/titles/` --- This route is cached for up to 3600 seconds
     *
     * @tags Character
     * @name GetCharactersCharacterIdTitles
     * @summary Get character corporation titles
     * @request GET:/characters/{character_id}/titles/
     * @secure
     * @response `200` `({ name?: string, title_id?: number })[]` A list of titles
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdTitles: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { name?: string; title_id?: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/titles/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a character's wallet balance --- Alternate route: `/legacy/characters/{character_id}/wallet/` Alternate route: `/v1/characters/{character_id}/wallet/` --- This route is cached for up to 120 seconds --- [Diff of the upcoming changes](https://esi.evetech.net/diff/latest/dev/#GET-/characters/{character_id}/wallet/)
     *
     * @tags Wallet
     * @name GetCharactersCharacterIdWallet
     * @summary Get a character's wallet balance
     * @request GET:/characters/{character_id}/wallet/
     * @secure
     * @response `200` `number` Wallet balance
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdWallet: (
      characterId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        number,
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/wallet/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve the given character's wallet journal going 30 days back --- Alternate route: `/dev/characters/{character_id}/wallet/journal/` Alternate route: `/v6/characters/{character_id}/wallet/journal/` --- This route is cached for up to 3600 seconds
     *
     * @tags Wallet
     * @name GetCharactersCharacterIdWalletJournal
     * @summary Get character wallet journal
     * @request GET:/characters/{character_id}/wallet/journal/
     * @secure
     * @response `200` `({ amount?: number, balance?: number, context_id?: number, context_id_type?: "structure_id" | "station_id" | "market_transaction_id" | "character_id" | "corporation_id" | "alliance_id" | "eve_system" | "industry_job_id" | "contract_id" | "planet_id" | "system_id" | "type_id", date: string, description: string, first_party_id?: number, id: number, reason?: string, ref_type: "acceleration_gate_fee" | "advertisement_listing_fee" | "agent_donation" | "agent_location_services" | "agent_miscellaneous" | "agent_mission_collateral_paid" | "agent_mission_collateral_refunded" | "agent_mission_reward" | "agent_mission_reward_corporation_tax" | "agent_mission_time_bonus_reward" | "agent_mission_time_bonus_reward_corporation_tax" | "agent_security_services" | "agent_services_rendered" | "agents_preward" | "alliance_maintainance_fee" | "alliance_registration_fee" | "asset_safety_recovery_tax" | "bounty" | "bounty_prize" | "bounty_prize_corporation_tax" | "bounty_prizes" | "bounty_reimbursement" | "bounty_surcharge" | "brokers_fee" | "clone_activation" | "clone_transfer" | "contraband_fine" | "contract_auction_bid" | "contract_auction_bid_corp" | "contract_auction_bid_refund" | "contract_auction_sold" | "contract_brokers_fee" | "contract_brokers_fee_corp" | "contract_collateral" | "contract_collateral_deposited_corp" | "contract_collateral_payout" | "contract_collateral_refund" | "contract_deposit" | "contract_deposit_corp" | "contract_deposit_refund" | "contract_deposit_sales_tax" | "contract_price" | "contract_price_payment_corp" | "contract_reversal" | "contract_reward" | "contract_reward_deposited" | "contract_reward_deposited_corp" | "contract_reward_refund" | "contract_sales_tax" | "copying" | "corporate_reward_payout" | "corporate_reward_tax" | "corporation_account_withdrawal" | "corporation_bulk_payment" | "corporation_dividend_payment" | "corporation_liquidation" | "corporation_logo_change_cost" | "corporation_payment" | "corporation_registration_fee" | "courier_mission_escrow" | "cspa" | "cspaofflinerefund" | "daily_challenge_reward" | "datacore_fee" | "dna_modification_fee" | "docking_fee" | "duel_wager_escrow" | "duel_wager_payment" | "duel_wager_refund" | "ess_escrow_transfer" | "external_trade_delivery" | "external_trade_freeze" | "external_trade_thaw" | "factory_slot_rental_fee" | "flux_payout" | "flux_tax" | "flux_ticket_repayment" | "flux_ticket_sale" | "gm_cash_transfer" | "industry_job_tax" | "infrastructure_hub_maintenance" | "inheritance" | "insurance" | "item_trader_payment" | "jump_clone_activation_fee" | "jump_clone_installation_fee" | "kill_right_fee" | "lp_store" | "manufacturing" | "market_escrow" | "market_fine_paid" | "market_provider_tax" | "market_transaction" | "medal_creation" | "medal_issued" | "milestone_reward_payment" | "mission_completion" | "mission_cost" | "mission_expiration" | "mission_reward" | "office_rental_fee" | "operation_bonus" | "opportunity_reward" | "planetary_construction" | "planetary_export_tax" | "planetary_import_tax" | "player_donation" | "player_trading" | "project_discovery_reward" | "project_discovery_tax" | "reaction" | "redeemed_isk_token" | "release_of_impounded_property" | "repair_bill" | "reprocessing_tax" | "researching_material_productivity" | "researching_technology" | "researching_time_productivity" | "resource_wars_reward" | "reverse_engineering" | "season_challenge_reward" | "security_processing_fee" | "shares" | "skill_purchase" | "sovereignity_bill" | "store_purchase" | "store_purchase_refund" | "structure_gate_jump" | "transaction_tax" | "upkeep_adjustment_fee" | "war_ally_contract" | "war_fee" | "war_fee_surrender", second_party_id?: number, tax?: number, tax_receiver_id?: number })[]` Journal entries
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdWalletJournal: (
      characterId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          amount?: number;
          balance?: number;
          context_id?: number;
          context_id_type?:
            | "structure_id"
            | "station_id"
            | "market_transaction_id"
            | "character_id"
            | "corporation_id"
            | "alliance_id"
            | "eve_system"
            | "industry_job_id"
            | "contract_id"
            | "planet_id"
            | "system_id"
            | "type_id";
          date: string;
          description: string;
          first_party_id?: number;
          id: number;
          reason?: string;
          ref_type:
            | "acceleration_gate_fee"
            | "advertisement_listing_fee"
            | "agent_donation"
            | "agent_location_services"
            | "agent_miscellaneous"
            | "agent_mission_collateral_paid"
            | "agent_mission_collateral_refunded"
            | "agent_mission_reward"
            | "agent_mission_reward_corporation_tax"
            | "agent_mission_time_bonus_reward"
            | "agent_mission_time_bonus_reward_corporation_tax"
            | "agent_security_services"
            | "agent_services_rendered"
            | "agents_preward"
            | "alliance_maintainance_fee"
            | "alliance_registration_fee"
            | "asset_safety_recovery_tax"
            | "bounty"
            | "bounty_prize"
            | "bounty_prize_corporation_tax"
            | "bounty_prizes"
            | "bounty_reimbursement"
            | "bounty_surcharge"
            | "brokers_fee"
            | "clone_activation"
            | "clone_transfer"
            | "contraband_fine"
            | "contract_auction_bid"
            | "contract_auction_bid_corp"
            | "contract_auction_bid_refund"
            | "contract_auction_sold"
            | "contract_brokers_fee"
            | "contract_brokers_fee_corp"
            | "contract_collateral"
            | "contract_collateral_deposited_corp"
            | "contract_collateral_payout"
            | "contract_collateral_refund"
            | "contract_deposit"
            | "contract_deposit_corp"
            | "contract_deposit_refund"
            | "contract_deposit_sales_tax"
            | "contract_price"
            | "contract_price_payment_corp"
            | "contract_reversal"
            | "contract_reward"
            | "contract_reward_deposited"
            | "contract_reward_deposited_corp"
            | "contract_reward_refund"
            | "contract_sales_tax"
            | "copying"
            | "corporate_reward_payout"
            | "corporate_reward_tax"
            | "corporation_account_withdrawal"
            | "corporation_bulk_payment"
            | "corporation_dividend_payment"
            | "corporation_liquidation"
            | "corporation_logo_change_cost"
            | "corporation_payment"
            | "corporation_registration_fee"
            | "courier_mission_escrow"
            | "cspa"
            | "cspaofflinerefund"
            | "daily_challenge_reward"
            | "datacore_fee"
            | "dna_modification_fee"
            | "docking_fee"
            | "duel_wager_escrow"
            | "duel_wager_payment"
            | "duel_wager_refund"
            | "ess_escrow_transfer"
            | "external_trade_delivery"
            | "external_trade_freeze"
            | "external_trade_thaw"
            | "factory_slot_rental_fee"
            | "flux_payout"
            | "flux_tax"
            | "flux_ticket_repayment"
            | "flux_ticket_sale"
            | "gm_cash_transfer"
            | "industry_job_tax"
            | "infrastructure_hub_maintenance"
            | "inheritance"
            | "insurance"
            | "item_trader_payment"
            | "jump_clone_activation_fee"
            | "jump_clone_installation_fee"
            | "kill_right_fee"
            | "lp_store"
            | "manufacturing"
            | "market_escrow"
            | "market_fine_paid"
            | "market_provider_tax"
            | "market_transaction"
            | "medal_creation"
            | "medal_issued"
            | "milestone_reward_payment"
            | "mission_completion"
            | "mission_cost"
            | "mission_expiration"
            | "mission_reward"
            | "office_rental_fee"
            | "operation_bonus"
            | "opportunity_reward"
            | "planetary_construction"
            | "planetary_export_tax"
            | "planetary_import_tax"
            | "player_donation"
            | "player_trading"
            | "project_discovery_reward"
            | "project_discovery_tax"
            | "reaction"
            | "redeemed_isk_token"
            | "release_of_impounded_property"
            | "repair_bill"
            | "reprocessing_tax"
            | "researching_material_productivity"
            | "researching_technology"
            | "researching_time_productivity"
            | "resource_wars_reward"
            | "reverse_engineering"
            | "season_challenge_reward"
            | "security_processing_fee"
            | "shares"
            | "skill_purchase"
            | "sovereignity_bill"
            | "store_purchase"
            | "store_purchase_refund"
            | "structure_gate_jump"
            | "transaction_tax"
            | "upkeep_adjustment_fee"
            | "war_ally_contract"
            | "war_fee"
            | "war_fee_surrender";
          second_party_id?: number;
          tax?: number;
          tax_receiver_id?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/wallet/journal/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get wallet transactions of a character --- Alternate route: `/dev/characters/{character_id}/wallet/transactions/` Alternate route: `/legacy/characters/{character_id}/wallet/transactions/` Alternate route: `/v1/characters/{character_id}/wallet/transactions/` --- This route is cached for up to 3600 seconds
     *
     * @tags Wallet
     * @name GetCharactersCharacterIdWalletTransactions
     * @summary Get wallet transactions
     * @request GET:/characters/{character_id}/wallet/transactions/
     * @secure
     * @response `200` `({ client_id: number, date: string, is_buy: boolean, is_personal: boolean, journal_ref_id: number, location_id: number, quantity: number, transaction_id: number, type_id: number, unit_price: number })[]` Wallet transactions
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCharactersCharacterIdWalletTransactions: (
      characterId: number,
      query?: { datasource?: "tranquility"; from_id?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          client_id: number;
          date: string;
          is_buy: boolean;
          is_personal: boolean;
          journal_ref_id: number;
          location_id: number;
          quantity: number;
          transaction_id: number;
          type_id: number;
          unit_price: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/characters/${characterId}/wallet/transactions/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  contracts = {
    /**
     * @description Lists bids on a public auction contract --- Alternate route: `/dev/contracts/public/bids/{contract_id}/` Alternate route: `/legacy/contracts/public/bids/{contract_id}/` Alternate route: `/v1/contracts/public/bids/{contract_id}/` --- This route is cached for up to 300 seconds
     *
     * @tags Contracts
     * @name GetContractsPublicBidsContractId
     * @summary Get public contract bids
     * @request GET:/contracts/public/bids/{contract_id}/
     * @response `200` `({ amount: number, bid_id: number, date_bid: string })[]` A list of bids
     * @response `204` `void` Contract expired or recently accepted by player
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `403` `{ error?: string }` Not Authorized to see contract
     * @response `404` `{ error?: string }` Not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getContractsPublicBidsContractId: (
      contractId: number,
      query?: { datasource?: "tranquility"; page?: number },
      params: RequestParams = {},
    ) =>
      this.request<
        { amount: number; bid_id: number; date_bid: string }[],
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/contracts/public/bids/${contractId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Lists items of a public contract --- Alternate route: `/dev/contracts/public/items/{contract_id}/` Alternate route: `/legacy/contracts/public/items/{contract_id}/` Alternate route: `/v1/contracts/public/items/{contract_id}/` --- This route is cached for up to 3600 seconds
     *
     * @tags Contracts
     * @name GetContractsPublicItemsContractId
     * @summary Get public contract items
     * @request GET:/contracts/public/items/{contract_id}/
     * @response `200` `({ is_blueprint_copy?: boolean, is_included: boolean, item_id?: number, material_efficiency?: number, quantity: number, record_id: number, runs?: number, time_efficiency?: number, type_id: number })[]` A list of items in this contract
     * @response `204` `void` Contract expired or recently accepted by player
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `403` `{ error?: string }` Not Authorized to see contract
     * @response `404` `{ error?: string }` Not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getContractsPublicItemsContractId: (
      contractId: number,
      query?: { datasource?: "tranquility"; page?: number },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          is_blueprint_copy?: boolean;
          is_included: boolean;
          item_id?: number;
          material_efficiency?: number;
          quantity: number;
          record_id: number;
          runs?: number;
          time_efficiency?: number;
          type_id: number;
        }[],
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/contracts/public/items/${contractId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a paginated list of all public contracts in the given region --- Alternate route: `/dev/contracts/public/{region_id}/` Alternate route: `/legacy/contracts/public/{region_id}/` Alternate route: `/v1/contracts/public/{region_id}/` --- This route is cached for up to 1800 seconds
     *
     * @tags Contracts
     * @name GetContractsPublicRegionId
     * @summary Get public contracts
     * @request GET:/contracts/public/{region_id}/
     * @response `200` `({ buyout?: number, collateral?: number, contract_id: number, date_expired: string, date_issued: string, days_to_complete?: number, end_location_id?: number, for_corporation?: boolean, issuer_corporation_id: number, issuer_id: number, price?: number, reward?: number, start_location_id?: number, title?: string, type: "unknown" | "item_exchange" | "auction" | "courier" | "loan", volume?: number })[]` A list of contracts
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Region not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getContractsPublicRegionId: (
      regionId: number,
      query?: { datasource?: "tranquility"; page?: number },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          buyout?: number;
          collateral?: number;
          contract_id: number;
          date_expired: string;
          date_issued: string;
          days_to_complete?: number;
          end_location_id?: number;
          for_corporation?: boolean;
          issuer_corporation_id: number;
          issuer_id: number;
          price?: number;
          reward?: number;
          start_location_id?: number;
          title?: string;
          type: "unknown" | "item_exchange" | "auction" | "courier" | "loan";
          volume?: number;
        }[],
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/contracts/public/${regionId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  corporation = {
    /**
     * @description Extraction timers for all moon chunks being extracted by refineries belonging to a corporation. --- Alternate route: `/dev/corporation/{corporation_id}/mining/extractions/` Alternate route: `/legacy/corporation/{corporation_id}/mining/extractions/` Alternate route: `/v1/corporation/{corporation_id}/mining/extractions/` --- This route is cached for up to 1800 seconds --- Requires one of the following EVE corporation role(s): Station_Manager
     *
     * @tags Industry
     * @name GetCorporationCorporationIdMiningExtractions
     * @summary Moon extraction timers
     * @request GET:/corporation/{corporation_id}/mining/extractions/
     * @secure
     * @response `200` `({ chunk_arrival_time: string, extraction_start_time: string, moon_id: number, natural_decay_time: string, structure_id: number })[]` A list of chunk timers
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationCorporationIdMiningExtractions: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          chunk_arrival_time: string;
          extraction_start_time: string;
          moon_id: number;
          natural_decay_time: string;
          structure_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporation/${corporationId}/mining/extractions/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Paginated list of all entities capable of observing and recording mining for a corporation --- Alternate route: `/dev/corporation/{corporation_id}/mining/observers/` Alternate route: `/legacy/corporation/{corporation_id}/mining/observers/` Alternate route: `/v1/corporation/{corporation_id}/mining/observers/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Accountant
     *
     * @tags Industry
     * @name GetCorporationCorporationIdMiningObservers
     * @summary Corporation mining observers
     * @request GET:/corporation/{corporation_id}/mining/observers/
     * @secure
     * @response `200` `({ last_updated: string, observer_id: number, observer_type: "structure" })[]` Observer list of a corporation
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationCorporationIdMiningObservers: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { last_updated: string; observer_id: number; observer_type: "structure" }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporation/${corporationId}/mining/observers/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Paginated record of all mining seen by an observer --- Alternate route: `/dev/corporation/{corporation_id}/mining/observers/{observer_id}/` Alternate route: `/legacy/corporation/{corporation_id}/mining/observers/{observer_id}/` Alternate route: `/v1/corporation/{corporation_id}/mining/observers/{observer_id}/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Accountant
     *
     * @tags Industry
     * @name GetCorporationCorporationIdMiningObserversObserverId
     * @summary Observed corporation mining
     * @request GET:/corporation/{corporation_id}/mining/observers/{observer_id}/
     * @secure
     * @response `200` `({ character_id: number, last_updated: string, quantity: number, recorded_corporation_id: number, type_id: number })[]` Mining ledger of an observer
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationCorporationIdMiningObserversObserverId: (
      corporationId: number,
      observerId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          character_id: number;
          last_updated: string;
          quantity: number;
          recorded_corporation_id: number;
          type_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporation/${corporationId}/mining/observers/${observerId}/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  corporations = {
    /**
     * @description Get a list of npc corporations --- Alternate route: `/dev/corporations/npccorps/` Alternate route: `/v2/corporations/npccorps/` --- This route expires daily at 11:05
     *
     * @tags Corporation
     * @name GetCorporationsNpccorps
     * @summary Get npc corporations
     * @request GET:/corporations/npccorps/
     * @response `200` `(number)[]` A list of npc corporation ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsNpccorps: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/corporations/npccorps/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Public information about a corporation --- Alternate route: `/dev/corporations/{corporation_id}/` Alternate route: `/v5/corporations/{corporation_id}/` --- This route is cached for up to 3600 seconds
     *
     * @tags Corporation
     * @name GetCorporationsCorporationId
     * @summary Get corporation information
     * @request GET:/corporations/{corporation_id}/
     * @response `200` `{ alliance_id?: number, ceo_id: number, creator_id: number, date_founded?: string, description?: string, faction_id?: number, home_station_id?: number, member_count: number, name: string, shares?: number, tax_rate: number, ticker: string, url?: string, war_eligible?: boolean }` Public information about a corporation
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Corporation not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationId: (
      corporationId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          alliance_id?: number;
          ceo_id: number;
          creator_id: number;
          date_founded?: string;
          description?: string;
          faction_id?: number;
          home_station_id?: number;
          member_count: number;
          name: string;
          shares?: number;
          tax_rate: number;
          ticker: string;
          url?: string;
          war_eligible?: boolean;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of all the alliances a corporation has been a member of --- Alternate route: `/dev/corporations/{corporation_id}/alliancehistory/` Alternate route: `/v3/corporations/{corporation_id}/alliancehistory/` --- This route is cached for up to 3600 seconds
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdAlliancehistory
     * @summary Get alliance history
     * @request GET:/corporations/{corporation_id}/alliancehistory/
     * @response `200` `({ alliance_id?: number, is_deleted?: boolean, record_id: number, start_date: string })[]` Alliance history for the given corporation
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdAlliancehistory: (
      corporationId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        { alliance_id?: number; is_deleted?: boolean; record_id: number; start_date: string }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/alliancehistory/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of the corporation assets --- Alternate route: `/dev/corporations/{corporation_id}/assets/` Alternate route: `/v5/corporations/{corporation_id}/assets/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Assets
     * @name GetCorporationsCorporationIdAssets
     * @summary Get corporation assets
     * @request GET:/corporations/{corporation_id}/assets/
     * @secure
     * @response `200` `({ is_blueprint_copy?: boolean, is_singleton: boolean, item_id: number, location_flag: "AssetSafety" | "AutoFit" | "Bonus" | "Booster" | "BoosterBay" | "Capsule" | "Cargo" | "CorpDeliveries" | "CorpSAG1" | "CorpSAG2" | "CorpSAG3" | "CorpSAG4" | "CorpSAG5" | "CorpSAG6" | "CorpSAG7" | "CrateLoot" | "Deliveries" | "DroneBay" | "DustBattle" | "DustDatabank" | "FighterBay" | "FighterTube0" | "FighterTube1" | "FighterTube2" | "FighterTube3" | "FighterTube4" | "FleetHangar" | "FrigateEscapeBay" | "Hangar" | "HangarAll" | "HiSlot0" | "HiSlot1" | "HiSlot2" | "HiSlot3" | "HiSlot4" | "HiSlot5" | "HiSlot6" | "HiSlot7" | "HiddenModifiers" | "Implant" | "Impounded" | "JunkyardReprocessed" | "JunkyardTrashed" | "LoSlot0" | "LoSlot1" | "LoSlot2" | "LoSlot3" | "LoSlot4" | "LoSlot5" | "LoSlot6" | "LoSlot7" | "Locked" | "MedSlot0" | "MedSlot1" | "MedSlot2" | "MedSlot3" | "MedSlot4" | "MedSlot5" | "MedSlot6" | "MedSlot7" | "OfficeFolder" | "Pilot" | "PlanetSurface" | "QuafeBay" | "QuantumCoreRoom" | "Reward" | "RigSlot0" | "RigSlot1" | "RigSlot2" | "RigSlot3" | "RigSlot4" | "RigSlot5" | "RigSlot6" | "RigSlot7" | "SecondaryStorage" | "ServiceSlot0" | "ServiceSlot1" | "ServiceSlot2" | "ServiceSlot3" | "ServiceSlot4" | "ServiceSlot5" | "ServiceSlot6" | "ServiceSlot7" | "ShipHangar" | "ShipOffline" | "Skill" | "SkillInTraining" | "SpecializedAmmoHold" | "SpecializedCommandCenterHold" | "SpecializedFuelBay" | "SpecializedGasHold" | "SpecializedIndustrialShipHold" | "SpecializedLargeShipHold" | "SpecializedMaterialBay" | "SpecializedMediumShipHold" | "SpecializedMineralHold" | "SpecializedOreHold" | "SpecializedPlanetaryCommoditiesHold" | "SpecializedSalvageHold" | "SpecializedShipHold" | "SpecializedSmallShipHold" | "StructureActive" | "StructureFuel" | "StructureInactive" | "StructureOffline" | "SubSystemBay" | "SubSystemSlot0" | "SubSystemSlot1" | "SubSystemSlot2" | "SubSystemSlot3" | "SubSystemSlot4" | "SubSystemSlot5" | "SubSystemSlot6" | "SubSystemSlot7" | "Unlocked" | "Wallet" | "Wardrobe", location_id: number, location_type: "station" | "solar_system" | "item" | "other", quantity: number, type_id: number })[]` A list of assets
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdAssets: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          is_blueprint_copy?: boolean;
          is_singleton: boolean;
          item_id: number;
          location_flag:
            | "AssetSafety"
            | "AutoFit"
            | "Bonus"
            | "Booster"
            | "BoosterBay"
            | "Capsule"
            | "Cargo"
            | "CorpDeliveries"
            | "CorpSAG1"
            | "CorpSAG2"
            | "CorpSAG3"
            | "CorpSAG4"
            | "CorpSAG5"
            | "CorpSAG6"
            | "CorpSAG7"
            | "CrateLoot"
            | "Deliveries"
            | "DroneBay"
            | "DustBattle"
            | "DustDatabank"
            | "FighterBay"
            | "FighterTube0"
            | "FighterTube1"
            | "FighterTube2"
            | "FighterTube3"
            | "FighterTube4"
            | "FleetHangar"
            | "FrigateEscapeBay"
            | "Hangar"
            | "HangarAll"
            | "HiSlot0"
            | "HiSlot1"
            | "HiSlot2"
            | "HiSlot3"
            | "HiSlot4"
            | "HiSlot5"
            | "HiSlot6"
            | "HiSlot7"
            | "HiddenModifiers"
            | "Implant"
            | "Impounded"
            | "JunkyardReprocessed"
            | "JunkyardTrashed"
            | "LoSlot0"
            | "LoSlot1"
            | "LoSlot2"
            | "LoSlot3"
            | "LoSlot4"
            | "LoSlot5"
            | "LoSlot6"
            | "LoSlot7"
            | "Locked"
            | "MedSlot0"
            | "MedSlot1"
            | "MedSlot2"
            | "MedSlot3"
            | "MedSlot4"
            | "MedSlot5"
            | "MedSlot6"
            | "MedSlot7"
            | "OfficeFolder"
            | "Pilot"
            | "PlanetSurface"
            | "QuafeBay"
            | "QuantumCoreRoom"
            | "Reward"
            | "RigSlot0"
            | "RigSlot1"
            | "RigSlot2"
            | "RigSlot3"
            | "RigSlot4"
            | "RigSlot5"
            | "RigSlot6"
            | "RigSlot7"
            | "SecondaryStorage"
            | "ServiceSlot0"
            | "ServiceSlot1"
            | "ServiceSlot2"
            | "ServiceSlot3"
            | "ServiceSlot4"
            | "ServiceSlot5"
            | "ServiceSlot6"
            | "ServiceSlot7"
            | "ShipHangar"
            | "ShipOffline"
            | "Skill"
            | "SkillInTraining"
            | "SpecializedAmmoHold"
            | "SpecializedCommandCenterHold"
            | "SpecializedFuelBay"
            | "SpecializedGasHold"
            | "SpecializedIndustrialShipHold"
            | "SpecializedLargeShipHold"
            | "SpecializedMaterialBay"
            | "SpecializedMediumShipHold"
            | "SpecializedMineralHold"
            | "SpecializedOreHold"
            | "SpecializedPlanetaryCommoditiesHold"
            | "SpecializedSalvageHold"
            | "SpecializedShipHold"
            | "SpecializedSmallShipHold"
            | "StructureActive"
            | "StructureFuel"
            | "StructureInactive"
            | "StructureOffline"
            | "SubSystemBay"
            | "SubSystemSlot0"
            | "SubSystemSlot1"
            | "SubSystemSlot2"
            | "SubSystemSlot3"
            | "SubSystemSlot4"
            | "SubSystemSlot5"
            | "SubSystemSlot6"
            | "SubSystemSlot7"
            | "Unlocked"
            | "Wallet"
            | "Wardrobe";
          location_id: number;
          location_type: "station" | "solar_system" | "item" | "other";
          quantity: number;
          type_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/assets/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return locations for a set of item ids, which you can get from corporation assets endpoint. Coordinates for items in hangars or stations are set to (0,0,0) --- Alternate route: `/dev/corporations/{corporation_id}/assets/locations/` Alternate route: `/v2/corporations/{corporation_id}/assets/locations/` --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Assets
     * @name PostCorporationsCorporationIdAssetsLocations
     * @summary Get corporation asset locations
     * @request POST:/corporations/{corporation_id}/assets/locations/
     * @secure
     * @response `200` `({ item_id: number, position: { x: number, y: number, z: number } })[]` List of asset locations
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Invalid IDs
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postCorporationsCorporationIdAssetsLocations: (
      corporationId: number,
      item_ids: number[],
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { item_id: number; position: { x: number; y: number; z: number } }[],
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/assets/locations/`,
        method: "POST",
        query: query,
        body: item_ids,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return names for a set of item ids, which you can get from corporation assets endpoint. Only valid for items that can customize names, like containers or ships --- Alternate route: `/dev/corporations/{corporation_id}/assets/names/` Alternate route: `/legacy/corporations/{corporation_id}/assets/names/` Alternate route: `/v1/corporations/{corporation_id}/assets/names/` --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Assets
     * @name PostCorporationsCorporationIdAssetsNames
     * @summary Get corporation asset names
     * @request POST:/corporations/{corporation_id}/assets/names/
     * @secure
     * @response `200` `({ item_id: number, name: string })[]` List of asset names
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Invalid IDs
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postCorporationsCorporationIdAssetsNames: (
      corporationId: number,
      item_ids: number[],
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { item_id: number; name: string }[],
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/assets/names/`,
        method: "POST",
        query: query,
        body: item_ids,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a list of blueprints the corporation owns --- Alternate route: `/dev/corporations/{corporation_id}/blueprints/` Alternate route: `/v3/corporations/{corporation_id}/blueprints/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdBlueprints
     * @summary Get corporation blueprints
     * @request GET:/corporations/{corporation_id}/blueprints/
     * @secure
     * @response `200` `({ item_id: number, location_flag: "AssetSafety" | "AutoFit" | "Bonus" | "Booster" | "BoosterBay" | "Capsule" | "Cargo" | "CorpDeliveries" | "CorpSAG1" | "CorpSAG2" | "CorpSAG3" | "CorpSAG4" | "CorpSAG5" | "CorpSAG6" | "CorpSAG7" | "CrateLoot" | "Deliveries" | "DroneBay" | "DustBattle" | "DustDatabank" | "FighterBay" | "FighterTube0" | "FighterTube1" | "FighterTube2" | "FighterTube3" | "FighterTube4" | "FleetHangar" | "FrigateEscapeBay" | "Hangar" | "HangarAll" | "HiSlot0" | "HiSlot1" | "HiSlot2" | "HiSlot3" | "HiSlot4" | "HiSlot5" | "HiSlot6" | "HiSlot7" | "HiddenModifiers" | "Implant" | "Impounded" | "JunkyardReprocessed" | "JunkyardTrashed" | "LoSlot0" | "LoSlot1" | "LoSlot2" | "LoSlot3" | "LoSlot4" | "LoSlot5" | "LoSlot6" | "LoSlot7" | "Locked" | "MedSlot0" | "MedSlot1" | "MedSlot2" | "MedSlot3" | "MedSlot4" | "MedSlot5" | "MedSlot6" | "MedSlot7" | "OfficeFolder" | "Pilot" | "PlanetSurface" | "QuafeBay" | "QuantumCoreRoom" | "Reward" | "RigSlot0" | "RigSlot1" | "RigSlot2" | "RigSlot3" | "RigSlot4" | "RigSlot5" | "RigSlot6" | "RigSlot7" | "SecondaryStorage" | "ServiceSlot0" | "ServiceSlot1" | "ServiceSlot2" | "ServiceSlot3" | "ServiceSlot4" | "ServiceSlot5" | "ServiceSlot6" | "ServiceSlot7" | "ShipHangar" | "ShipOffline" | "Skill" | "SkillInTraining" | "SpecializedAmmoHold" | "SpecializedCommandCenterHold" | "SpecializedFuelBay" | "SpecializedGasHold" | "SpecializedIndustrialShipHold" | "SpecializedLargeShipHold" | "SpecializedMaterialBay" | "SpecializedMediumShipHold" | "SpecializedMineralHold" | "SpecializedOreHold" | "SpecializedPlanetaryCommoditiesHold" | "SpecializedSalvageHold" | "SpecializedShipHold" | "SpecializedSmallShipHold" | "StructureActive" | "StructureFuel" | "StructureInactive" | "StructureOffline" | "SubSystemBay" | "SubSystemSlot0" | "SubSystemSlot1" | "SubSystemSlot2" | "SubSystemSlot3" | "SubSystemSlot4" | "SubSystemSlot5" | "SubSystemSlot6" | "SubSystemSlot7" | "Unlocked" | "Wallet" | "Wardrobe", location_id: number, material_efficiency: number, quantity: number, runs: number, time_efficiency: number, type_id: number })[]` List of corporation blueprints
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdBlueprints: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          item_id: number;
          location_flag:
            | "AssetSafety"
            | "AutoFit"
            | "Bonus"
            | "Booster"
            | "BoosterBay"
            | "Capsule"
            | "Cargo"
            | "CorpDeliveries"
            | "CorpSAG1"
            | "CorpSAG2"
            | "CorpSAG3"
            | "CorpSAG4"
            | "CorpSAG5"
            | "CorpSAG6"
            | "CorpSAG7"
            | "CrateLoot"
            | "Deliveries"
            | "DroneBay"
            | "DustBattle"
            | "DustDatabank"
            | "FighterBay"
            | "FighterTube0"
            | "FighterTube1"
            | "FighterTube2"
            | "FighterTube3"
            | "FighterTube4"
            | "FleetHangar"
            | "FrigateEscapeBay"
            | "Hangar"
            | "HangarAll"
            | "HiSlot0"
            | "HiSlot1"
            | "HiSlot2"
            | "HiSlot3"
            | "HiSlot4"
            | "HiSlot5"
            | "HiSlot6"
            | "HiSlot7"
            | "HiddenModifiers"
            | "Implant"
            | "Impounded"
            | "JunkyardReprocessed"
            | "JunkyardTrashed"
            | "LoSlot0"
            | "LoSlot1"
            | "LoSlot2"
            | "LoSlot3"
            | "LoSlot4"
            | "LoSlot5"
            | "LoSlot6"
            | "LoSlot7"
            | "Locked"
            | "MedSlot0"
            | "MedSlot1"
            | "MedSlot2"
            | "MedSlot3"
            | "MedSlot4"
            | "MedSlot5"
            | "MedSlot6"
            | "MedSlot7"
            | "OfficeFolder"
            | "Pilot"
            | "PlanetSurface"
            | "QuafeBay"
            | "QuantumCoreRoom"
            | "Reward"
            | "RigSlot0"
            | "RigSlot1"
            | "RigSlot2"
            | "RigSlot3"
            | "RigSlot4"
            | "RigSlot5"
            | "RigSlot6"
            | "RigSlot7"
            | "SecondaryStorage"
            | "ServiceSlot0"
            | "ServiceSlot1"
            | "ServiceSlot2"
            | "ServiceSlot3"
            | "ServiceSlot4"
            | "ServiceSlot5"
            | "ServiceSlot6"
            | "ServiceSlot7"
            | "ShipHangar"
            | "ShipOffline"
            | "Skill"
            | "SkillInTraining"
            | "SpecializedAmmoHold"
            | "SpecializedCommandCenterHold"
            | "SpecializedFuelBay"
            | "SpecializedGasHold"
            | "SpecializedIndustrialShipHold"
            | "SpecializedLargeShipHold"
            | "SpecializedMaterialBay"
            | "SpecializedMediumShipHold"
            | "SpecializedMineralHold"
            | "SpecializedOreHold"
            | "SpecializedPlanetaryCommoditiesHold"
            | "SpecializedSalvageHold"
            | "SpecializedShipHold"
            | "SpecializedSmallShipHold"
            | "StructureActive"
            | "StructureFuel"
            | "StructureInactive"
            | "StructureOffline"
            | "SubSystemBay"
            | "SubSystemSlot0"
            | "SubSystemSlot1"
            | "SubSystemSlot2"
            | "SubSystemSlot3"
            | "SubSystemSlot4"
            | "SubSystemSlot5"
            | "SubSystemSlot6"
            | "SubSystemSlot7"
            | "Unlocked"
            | "Wallet"
            | "Wardrobe";
          location_id: number;
          material_efficiency: number;
          quantity: number;
          runs: number;
          time_efficiency: number;
          type_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/blueprints/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description A list of your corporation's bookmarks --- Alternate route: `/dev/corporations/{corporation_id}/bookmarks/` Alternate route: `/legacy/corporations/{corporation_id}/bookmarks/` Alternate route: `/v1/corporations/{corporation_id}/bookmarks/` --- This route is cached for up to 3600 seconds
     *
     * @tags Bookmarks
     * @name GetCorporationsCorporationIdBookmarks
     * @summary List corporation bookmarks
     * @request GET:/corporations/{corporation_id}/bookmarks/
     * @secure
     * @response `200` `({ bookmark_id: number, coordinates?: { x: number, y: number, z: number }, created: string, creator_id: number, folder_id?: number, item?: { item_id: number, type_id: number }, label: string, location_id: number, notes: string })[]` List of corporation owned bookmarks
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdBookmarks: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          bookmark_id: number;
          coordinates?: { x: number; y: number; z: number };
          created: string;
          creator_id: number;
          folder_id?: number;
          item?: { item_id: number; type_id: number };
          label: string;
          location_id: number;
          notes: string;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/bookmarks/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description A list of your corporation's bookmark folders --- Alternate route: `/dev/corporations/{corporation_id}/bookmarks/folders/` Alternate route: `/legacy/corporations/{corporation_id}/bookmarks/folders/` Alternate route: `/v1/corporations/{corporation_id}/bookmarks/folders/` --- This route is cached for up to 3600 seconds
     *
     * @tags Bookmarks
     * @name GetCorporationsCorporationIdBookmarksFolders
     * @summary List corporation bookmark folders
     * @request GET:/corporations/{corporation_id}/bookmarks/folders/
     * @secure
     * @response `200` `({ creator_id?: number, folder_id: number, name: string })[]` List of corporation owned bookmark folders
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdBookmarksFolders: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { creator_id?: number; folder_id: number; name: string }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/bookmarks/folders/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return contacts of a corporation --- Alternate route: `/dev/corporations/{corporation_id}/contacts/` Alternate route: `/v2/corporations/{corporation_id}/contacts/` --- This route is cached for up to 300 seconds
     *
     * @tags Contacts
     * @name GetCorporationsCorporationIdContacts
     * @summary Get corporation contacts
     * @request GET:/corporations/{corporation_id}/contacts/
     * @secure
     * @response `200` `({ contact_id: number, contact_type: "character" | "corporation" | "alliance" | "faction", is_watched?: boolean, label_ids?: (number)[], standing: number })[]` A list of contacts
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdContacts: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          contact_id: number;
          contact_type: "character" | "corporation" | "alliance" | "faction";
          is_watched?: boolean;
          label_ids?: number[];
          standing: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/contacts/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return custom labels for a corporation's contacts --- Alternate route: `/dev/corporations/{corporation_id}/contacts/labels/` Alternate route: `/legacy/corporations/{corporation_id}/contacts/labels/` Alternate route: `/v1/corporations/{corporation_id}/contacts/labels/` --- This route is cached for up to 300 seconds
     *
     * @tags Contacts
     * @name GetCorporationsCorporationIdContactsLabels
     * @summary Get corporation contact labels
     * @request GET:/corporations/{corporation_id}/contacts/labels/
     * @secure
     * @response `200` `({ label_id: number, label_name: string })[]` A list of corporation contact labels
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdContactsLabels: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { label_id: number; label_name: string }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/contacts/labels/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns logs recorded in the past seven days from all audit log secure containers (ALSC) owned by a given corporation --- Alternate route: `/dev/corporations/{corporation_id}/containers/logs/` Alternate route: `/v3/corporations/{corporation_id}/containers/logs/` --- This route is cached for up to 600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdContainersLogs
     * @summary Get all corporation ALSC logs
     * @request GET:/corporations/{corporation_id}/containers/logs/
     * @secure
     * @response `200` `({ action: "add" | "assemble" | "configure" | "enter_password" | "lock" | "move" | "repackage" | "set_name" | "set_password" | "unlock", character_id: number, container_id: number, container_type_id: number, location_flag: "AssetSafety" | "AutoFit" | "Bonus" | "Booster" | "BoosterBay" | "Capsule" | "Cargo" | "CorpDeliveries" | "CorpSAG1" | "CorpSAG2" | "CorpSAG3" | "CorpSAG4" | "CorpSAG5" | "CorpSAG6" | "CorpSAG7" | "CrateLoot" | "Deliveries" | "DroneBay" | "DustBattle" | "DustDatabank" | "FighterBay" | "FighterTube0" | "FighterTube1" | "FighterTube2" | "FighterTube3" | "FighterTube4" | "FleetHangar" | "FrigateEscapeBay" | "Hangar" | "HangarAll" | "HiSlot0" | "HiSlot1" | "HiSlot2" | "HiSlot3" | "HiSlot4" | "HiSlot5" | "HiSlot6" | "HiSlot7" | "HiddenModifiers" | "Implant" | "Impounded" | "JunkyardReprocessed" | "JunkyardTrashed" | "LoSlot0" | "LoSlot1" | "LoSlot2" | "LoSlot3" | "LoSlot4" | "LoSlot5" | "LoSlot6" | "LoSlot7" | "Locked" | "MedSlot0" | "MedSlot1" | "MedSlot2" | "MedSlot3" | "MedSlot4" | "MedSlot5" | "MedSlot6" | "MedSlot7" | "OfficeFolder" | "Pilot" | "PlanetSurface" | "QuafeBay" | "QuantumCoreRoom" | "Reward" | "RigSlot0" | "RigSlot1" | "RigSlot2" | "RigSlot3" | "RigSlot4" | "RigSlot5" | "RigSlot6" | "RigSlot7" | "SecondaryStorage" | "ServiceSlot0" | "ServiceSlot1" | "ServiceSlot2" | "ServiceSlot3" | "ServiceSlot4" | "ServiceSlot5" | "ServiceSlot6" | "ServiceSlot7" | "ShipHangar" | "ShipOffline" | "Skill" | "SkillInTraining" | "SpecializedAmmoHold" | "SpecializedCommandCenterHold" | "SpecializedFuelBay" | "SpecializedGasHold" | "SpecializedIndustrialShipHold" | "SpecializedLargeShipHold" | "SpecializedMaterialBay" | "SpecializedMediumShipHold" | "SpecializedMineralHold" | "SpecializedOreHold" | "SpecializedPlanetaryCommoditiesHold" | "SpecializedSalvageHold" | "SpecializedShipHold" | "SpecializedSmallShipHold" | "StructureActive" | "StructureFuel" | "StructureInactive" | "StructureOffline" | "SubSystemBay" | "SubSystemSlot0" | "SubSystemSlot1" | "SubSystemSlot2" | "SubSystemSlot3" | "SubSystemSlot4" | "SubSystemSlot5" | "SubSystemSlot6" | "SubSystemSlot7" | "Unlocked" | "Wallet" | "Wardrobe", location_id: number, logged_at: string, new_config_bitmask?: number, old_config_bitmask?: number, password_type?: "config" | "general", quantity?: number, type_id?: number })[]` List of corporation ALSC logs
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdContainersLogs: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          action:
            | "add"
            | "assemble"
            | "configure"
            | "enter_password"
            | "lock"
            | "move"
            | "repackage"
            | "set_name"
            | "set_password"
            | "unlock";
          character_id: number;
          container_id: number;
          container_type_id: number;
          location_flag:
            | "AssetSafety"
            | "AutoFit"
            | "Bonus"
            | "Booster"
            | "BoosterBay"
            | "Capsule"
            | "Cargo"
            | "CorpDeliveries"
            | "CorpSAG1"
            | "CorpSAG2"
            | "CorpSAG3"
            | "CorpSAG4"
            | "CorpSAG5"
            | "CorpSAG6"
            | "CorpSAG7"
            | "CrateLoot"
            | "Deliveries"
            | "DroneBay"
            | "DustBattle"
            | "DustDatabank"
            | "FighterBay"
            | "FighterTube0"
            | "FighterTube1"
            | "FighterTube2"
            | "FighterTube3"
            | "FighterTube4"
            | "FleetHangar"
            | "FrigateEscapeBay"
            | "Hangar"
            | "HangarAll"
            | "HiSlot0"
            | "HiSlot1"
            | "HiSlot2"
            | "HiSlot3"
            | "HiSlot4"
            | "HiSlot5"
            | "HiSlot6"
            | "HiSlot7"
            | "HiddenModifiers"
            | "Implant"
            | "Impounded"
            | "JunkyardReprocessed"
            | "JunkyardTrashed"
            | "LoSlot0"
            | "LoSlot1"
            | "LoSlot2"
            | "LoSlot3"
            | "LoSlot4"
            | "LoSlot5"
            | "LoSlot6"
            | "LoSlot7"
            | "Locked"
            | "MedSlot0"
            | "MedSlot1"
            | "MedSlot2"
            | "MedSlot3"
            | "MedSlot4"
            | "MedSlot5"
            | "MedSlot6"
            | "MedSlot7"
            | "OfficeFolder"
            | "Pilot"
            | "PlanetSurface"
            | "QuafeBay"
            | "QuantumCoreRoom"
            | "Reward"
            | "RigSlot0"
            | "RigSlot1"
            | "RigSlot2"
            | "RigSlot3"
            | "RigSlot4"
            | "RigSlot5"
            | "RigSlot6"
            | "RigSlot7"
            | "SecondaryStorage"
            | "ServiceSlot0"
            | "ServiceSlot1"
            | "ServiceSlot2"
            | "ServiceSlot3"
            | "ServiceSlot4"
            | "ServiceSlot5"
            | "ServiceSlot6"
            | "ServiceSlot7"
            | "ShipHangar"
            | "ShipOffline"
            | "Skill"
            | "SkillInTraining"
            | "SpecializedAmmoHold"
            | "SpecializedCommandCenterHold"
            | "SpecializedFuelBay"
            | "SpecializedGasHold"
            | "SpecializedIndustrialShipHold"
            | "SpecializedLargeShipHold"
            | "SpecializedMaterialBay"
            | "SpecializedMediumShipHold"
            | "SpecializedMineralHold"
            | "SpecializedOreHold"
            | "SpecializedPlanetaryCommoditiesHold"
            | "SpecializedSalvageHold"
            | "SpecializedShipHold"
            | "SpecializedSmallShipHold"
            | "StructureActive"
            | "StructureFuel"
            | "StructureInactive"
            | "StructureOffline"
            | "SubSystemBay"
            | "SubSystemSlot0"
            | "SubSystemSlot1"
            | "SubSystemSlot2"
            | "SubSystemSlot3"
            | "SubSystemSlot4"
            | "SubSystemSlot5"
            | "SubSystemSlot6"
            | "SubSystemSlot7"
            | "Unlocked"
            | "Wallet"
            | "Wardrobe";
          location_id: number;
          logged_at: string;
          new_config_bitmask?: number;
          old_config_bitmask?: number;
          password_type?: "config" | "general";
          quantity?: number;
          type_id?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/containers/logs/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns contracts available to a corporation, only if the corporation is issuer, acceptor or assignee. Only returns contracts no older than 30 days, or if the status is "in_progress". --- Alternate route: `/dev/corporations/{corporation_id}/contracts/` Alternate route: `/legacy/corporations/{corporation_id}/contracts/` Alternate route: `/v1/corporations/{corporation_id}/contracts/` --- This route is cached for up to 300 seconds
     *
     * @tags Contracts
     * @name GetCorporationsCorporationIdContracts
     * @summary Get corporation contracts
     * @request GET:/corporations/{corporation_id}/contracts/
     * @secure
     * @response `200` `({ acceptor_id: number, assignee_id: number, availability: "public" | "personal" | "corporation" | "alliance", buyout?: number, collateral?: number, contract_id: number, date_accepted?: string, date_completed?: string, date_expired: string, date_issued: string, days_to_complete?: number, end_location_id?: number, for_corporation: boolean, issuer_corporation_id: number, issuer_id: number, price?: number, reward?: number, start_location_id?: number, status: "outstanding" | "in_progress" | "finished_issuer" | "finished_contractor" | "finished" | "cancelled" | "rejected" | "failed" | "deleted" | "reversed", title?: string, type: "unknown" | "item_exchange" | "auction" | "courier" | "loan", volume?: number })[]` A list of contracts
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdContracts: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          acceptor_id: number;
          assignee_id: number;
          availability: "public" | "personal" | "corporation" | "alliance";
          buyout?: number;
          collateral?: number;
          contract_id: number;
          date_accepted?: string;
          date_completed?: string;
          date_expired: string;
          date_issued: string;
          days_to_complete?: number;
          end_location_id?: number;
          for_corporation: boolean;
          issuer_corporation_id: number;
          issuer_id: number;
          price?: number;
          reward?: number;
          start_location_id?: number;
          status:
            | "outstanding"
            | "in_progress"
            | "finished_issuer"
            | "finished_contractor"
            | "finished"
            | "cancelled"
            | "rejected"
            | "failed"
            | "deleted"
            | "reversed";
          title?: string;
          type: "unknown" | "item_exchange" | "auction" | "courier" | "loan";
          volume?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/contracts/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Lists bids on a particular auction contract --- Alternate route: `/dev/corporations/{corporation_id}/contracts/{contract_id}/bids/` Alternate route: `/legacy/corporations/{corporation_id}/contracts/{contract_id}/bids/` Alternate route: `/v1/corporations/{corporation_id}/contracts/{contract_id}/bids/` --- This route is cached for up to 3600 seconds
     *
     * @tags Contracts
     * @name GetCorporationsCorporationIdContractsContractIdBids
     * @summary Get corporation contract bids
     * @request GET:/corporations/{corporation_id}/contracts/{contract_id}/bids/
     * @secure
     * @response `200` `({ amount: number, bid_id: number, bidder_id: number, date_bid: string })[]` A list of bids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdContractsContractIdBids: (
      contractId: number,
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { amount: number; bid_id: number; bidder_id: number; date_bid: string }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/contracts/${contractId}/bids/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Lists items of a particular contract --- Alternate route: `/dev/corporations/{corporation_id}/contracts/{contract_id}/items/` Alternate route: `/legacy/corporations/{corporation_id}/contracts/{contract_id}/items/` Alternate route: `/v1/corporations/{corporation_id}/contracts/{contract_id}/items/` --- This route is cached for up to 3600 seconds
     *
     * @tags Contracts
     * @name GetCorporationsCorporationIdContractsContractIdItems
     * @summary Get corporation contract items
     * @request GET:/corporations/{corporation_id}/contracts/{contract_id}/items/
     * @secure
     * @response `200` `({ is_included: boolean, is_singleton: boolean, quantity: number, raw_quantity?: number, record_id: number, type_id: number })[]` A list of items in this contract
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     * @response `520` `{ error?: string }` Internal error thrown from the EVE server. Most of the time this means you have hit an EVE server rate limit
     */
    getCorporationsCorporationIdContractsContractIdItems: (
      contractId: number,
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          is_included: boolean;
          is_singleton: boolean;
          quantity: number;
          raw_quantity?: number;
          record_id: number;
          type_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/contracts/${contractId}/items/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List customs offices owned by a corporation --- Alternate route: `/dev/corporations/{corporation_id}/customs_offices/` Alternate route: `/legacy/corporations/{corporation_id}/customs_offices/` Alternate route: `/v1/corporations/{corporation_id}/customs_offices/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Planetary Interaction
     * @name GetCorporationsCorporationIdCustomsOffices
     * @summary List corporation customs offices
     * @request GET:/corporations/{corporation_id}/customs_offices/
     * @secure
     * @response `200` `({ alliance_tax_rate?: number, allow_access_with_standings: boolean, allow_alliance_access: boolean, bad_standing_tax_rate?: number, corporation_tax_rate?: number, excellent_standing_tax_rate?: number, good_standing_tax_rate?: number, neutral_standing_tax_rate?: number, office_id: number, reinforce_exit_end: number, reinforce_exit_start: number, standing_level?: "bad" | "excellent" | "good" | "neutral" | "terrible", system_id: number, terrible_standing_tax_rate?: number })[]` A list of customs offices and their settings
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdCustomsOffices: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          alliance_tax_rate?: number;
          allow_access_with_standings: boolean;
          allow_alliance_access: boolean;
          bad_standing_tax_rate?: number;
          corporation_tax_rate?: number;
          excellent_standing_tax_rate?: number;
          good_standing_tax_rate?: number;
          neutral_standing_tax_rate?: number;
          office_id: number;
          reinforce_exit_end: number;
          reinforce_exit_start: number;
          standing_level?: "bad" | "excellent" | "good" | "neutral" | "terrible";
          system_id: number;
          terrible_standing_tax_rate?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/customs_offices/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return corporation hangar and wallet division names, only show if a division is not using the default name --- Alternate route: `/dev/corporations/{corporation_id}/divisions/` Alternate route: `/v2/corporations/{corporation_id}/divisions/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdDivisions
     * @summary Get corporation divisions
     * @request GET:/corporations/{corporation_id}/divisions/
     * @secure
     * @response `200` `{ hangar?: ({ division?: number, name?: string })[], wallet?: ({ division?: number, name?: string })[] }` List of corporation division names
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdDivisions: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { hangar?: { division?: number; name?: string }[]; wallet?: { division?: number; name?: string }[] },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/divisions/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a corporation's facilities --- Alternate route: `/dev/corporations/{corporation_id}/facilities/` Alternate route: `/v2/corporations/{corporation_id}/facilities/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Factory_Manager
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdFacilities
     * @summary Get corporation facilities
     * @request GET:/corporations/{corporation_id}/facilities/
     * @secure
     * @response `200` `({ facility_id: number, system_id: number, type_id: number })[]` List of corporation facilities
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdFacilities: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { facility_id: number; system_id: number; type_id: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/facilities/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Statistics about a corporation involved in faction warfare --- Alternate route: `/dev/corporations/{corporation_id}/fw/stats/` Alternate route: `/legacy/corporations/{corporation_id}/fw/stats/` Alternate route: `/v1/corporations/{corporation_id}/fw/stats/` Alternate route: `/v2/corporations/{corporation_id}/fw/stats/` --- This route expires daily at 11:05
     *
     * @tags Faction Warfare
     * @name GetCorporationsCorporationIdFwStats
     * @summary Overview of a corporation involved in faction warfare
     * @request GET:/corporations/{corporation_id}/fw/stats/
     * @secure
     * @response `200` `{ enlisted_on?: string, faction_id?: number, kills: { last_week: number, total: number, yesterday: number }, pilots?: number, victory_points: { last_week: number, total: number, yesterday: number } }` Faction warfare statistics for a given corporation
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdFwStats: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          enlisted_on?: string;
          faction_id?: number;
          kills: { last_week: number; total: number; yesterday: number };
          pilots?: number;
          victory_points: { last_week: number; total: number; yesterday: number };
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/fw/stats/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the icon urls for a corporation --- Alternate route: `/dev/corporations/{corporation_id}/icons/` Alternate route: `/v2/corporations/{corporation_id}/icons/` --- This route is cached for up to 3600 seconds
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdIcons
     * @summary Get corporation icon
     * @request GET:/corporations/{corporation_id}/icons/
     * @response `200` `{ "px128x128"?: string, "px256x256"?: string, "px64x64"?: string }` Urls for icons for the given corporation id and server
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` No image server for this datasource
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdIcons: (
      corporationId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        { px128x128?: string; px256x256?: string; px64x64?: string },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/icons/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description List industry jobs run by a corporation --- Alternate route: `/dev/corporations/{corporation_id}/industry/jobs/` Alternate route: `/legacy/corporations/{corporation_id}/industry/jobs/` Alternate route: `/v1/corporations/{corporation_id}/industry/jobs/` --- This route is cached for up to 300 seconds --- Requires one of the following EVE corporation role(s): Factory_Manager
     *
     * @tags Industry
     * @name GetCorporationsCorporationIdIndustryJobs
     * @summary List corporation industry jobs
     * @request GET:/corporations/{corporation_id}/industry/jobs/
     * @secure
     * @response `200` `({ activity_id: number, blueprint_id: number, blueprint_location_id: number, blueprint_type_id: number, completed_character_id?: number, completed_date?: string, cost?: number, duration: number, end_date: string, facility_id: number, installer_id: number, job_id: number, licensed_runs?: number, location_id: number, output_location_id: number, pause_date?: string, probability?: number, product_type_id?: number, runs: number, start_date: string, status: "active" | "cancelled" | "delivered" | "paused" | "ready" | "reverted", successful_runs?: number })[]` A list of corporation industry jobs
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdIndustryJobs: (
      corporationId: number,
      query?: { datasource?: "tranquility"; include_completed?: boolean; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          activity_id: number;
          blueprint_id: number;
          blueprint_location_id: number;
          blueprint_type_id: number;
          completed_character_id?: number;
          completed_date?: string;
          cost?: number;
          duration: number;
          end_date: string;
          facility_id: number;
          installer_id: number;
          job_id: number;
          licensed_runs?: number;
          location_id: number;
          output_location_id: number;
          pause_date?: string;
          probability?: number;
          product_type_id?: number;
          runs: number;
          start_date: string;
          status: "active" | "cancelled" | "delivered" | "paused" | "ready" | "reverted";
          successful_runs?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/industry/jobs/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of a corporation's kills and losses going back 90 days --- Alternate route: `/dev/corporations/{corporation_id}/killmails/recent/` Alternate route: `/legacy/corporations/{corporation_id}/killmails/recent/` Alternate route: `/v1/corporations/{corporation_id}/killmails/recent/` --- This route is cached for up to 300 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Killmails
     * @name GetCorporationsCorporationIdKillmailsRecent
     * @summary Get a corporation's recent kills and losses
     * @request GET:/corporations/{corporation_id}/killmails/recent/
     * @secure
     * @response `200` `({ killmail_hash: string, killmail_id: number })[]` A list of killmail IDs and hashes
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdKillmailsRecent: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { killmail_hash: string; killmail_id: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/killmails/recent/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a corporation's medals --- Alternate route: `/dev/corporations/{corporation_id}/medals/` Alternate route: `/v2/corporations/{corporation_id}/medals/` --- This route is cached for up to 3600 seconds
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdMedals
     * @summary Get corporation medals
     * @request GET:/corporations/{corporation_id}/medals/
     * @secure
     * @response `200` `({ created_at: string, creator_id: number, description: string, medal_id: number, title: string })[]` A list of medals
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdMedals: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { created_at: string; creator_id: number; description: string; medal_id: number; title: string }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/medals/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns medals issued by a corporation --- Alternate route: `/dev/corporations/{corporation_id}/medals/issued/` Alternate route: `/v2/corporations/{corporation_id}/medals/issued/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdMedalsIssued
     * @summary Get corporation issued medals
     * @request GET:/corporations/{corporation_id}/medals/issued/
     * @secure
     * @response `200` `({ character_id: number, issued_at: string, issuer_id: number, medal_id: number, reason: string, status: "private" | "public" })[]` A list of issued medals
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdMedalsIssued: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          character_id: number;
          issued_at: string;
          issuer_id: number;
          medal_id: number;
          reason: string;
          status: "private" | "public";
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/medals/issued/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return the current member list of a corporation, the token's character need to be a member of the corporation. --- Alternate route: `/dev/corporations/{corporation_id}/members/` Alternate route: `/v4/corporations/{corporation_id}/members/` --- This route is cached for up to 3600 seconds
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdMembers
     * @summary Get corporation members
     * @request GET:/corporations/{corporation_id}/members/
     * @secure
     * @response `200` `(number)[]` List of member character IDs
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdMembers: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        number[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/members/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a corporation's member limit, not including CEO himself --- Alternate route: `/dev/corporations/{corporation_id}/members/limit/` Alternate route: `/v2/corporations/{corporation_id}/members/limit/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdMembersLimit
     * @summary Get corporation member limit
     * @request GET:/corporations/{corporation_id}/members/limit/
     * @secure
     * @response `200` `number` The corporation's member limit
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdMembersLimit: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        number,
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/members/limit/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a corporation's members' titles --- Alternate route: `/dev/corporations/{corporation_id}/members/titles/` Alternate route: `/v2/corporations/{corporation_id}/members/titles/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdMembersTitles
     * @summary Get corporation's members' titles
     * @request GET:/corporations/{corporation_id}/members/titles/
     * @secure
     * @response `200` `({ character_id: number, titles: (number)[] })[]` A list of members and theirs titles
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdMembersTitles: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { character_id: number; titles: number[] }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/members/titles/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns additional information about a corporation's members which helps tracking their activities --- Alternate route: `/dev/corporations/{corporation_id}/membertracking/` Alternate route: `/v2/corporations/{corporation_id}/membertracking/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdMembertracking
     * @summary Track corporation members
     * @request GET:/corporations/{corporation_id}/membertracking/
     * @secure
     * @response `200` `({ base_id?: number, character_id: number, location_id?: number, logoff_date?: string, logon_date?: string, ship_type_id?: number, start_date?: string })[]` List of member character IDs
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdMembertracking: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          base_id?: number;
          character_id: number;
          location_id?: number;
          logoff_date?: string;
          logon_date?: string;
          ship_type_id?: number;
          start_date?: string;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/membertracking/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List open market orders placed on behalf of a corporation --- Alternate route: `/dev/corporations/{corporation_id}/orders/` Alternate route: `/v3/corporations/{corporation_id}/orders/` --- This route is cached for up to 1200 seconds --- Requires one of the following EVE corporation role(s): Accountant, Trader
     *
     * @tags Market
     * @name GetCorporationsCorporationIdOrders
     * @summary List open orders from a corporation
     * @request GET:/corporations/{corporation_id}/orders/
     * @secure
     * @response `200` `({ duration: number, escrow?: number, is_buy_order?: boolean, issued: string, issued_by: number, location_id: number, min_volume?: number, order_id: number, price: number, range: "1" | "10" | "2" | "20" | "3" | "30" | "4" | "40" | "5" | "region" | "solarsystem" | "station", region_id: number, type_id: number, volume_remain: number, volume_total: number, wallet_division: number })[]` A list of open market orders
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdOrders: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          duration: number;
          escrow?: number;
          is_buy_order?: boolean;
          issued: string;
          issued_by: number;
          location_id: number;
          min_volume?: number;
          order_id: number;
          price: number;
          range: "1" | "10" | "2" | "20" | "3" | "30" | "4" | "40" | "5" | "region" | "solarsystem" | "station";
          region_id: number;
          type_id: number;
          volume_remain: number;
          volume_total: number;
          wallet_division: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/orders/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List cancelled and expired market orders placed on behalf of a corporation up to 90 days in the past. --- Alternate route: `/dev/corporations/{corporation_id}/orders/history/` Alternate route: `/v2/corporations/{corporation_id}/orders/history/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Accountant, Trader
     *
     * @tags Market
     * @name GetCorporationsCorporationIdOrdersHistory
     * @summary List historical orders from a corporation
     * @request GET:/corporations/{corporation_id}/orders/history/
     * @secure
     * @response `200` `({ duration: number, escrow?: number, is_buy_order?: boolean, issued: string, issued_by?: number, location_id: number, min_volume?: number, order_id: number, price: number, range: "1" | "10" | "2" | "20" | "3" | "30" | "4" | "40" | "5" | "region" | "solarsystem" | "station", region_id: number, state: "cancelled" | "expired", type_id: number, volume_remain: number, volume_total: number, wallet_division: number })[]` Expired and cancelled market orders placed on behalf of a corporation
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdOrdersHistory: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          duration: number;
          escrow?: number;
          is_buy_order?: boolean;
          issued: string;
          issued_by?: number;
          location_id: number;
          min_volume?: number;
          order_id: number;
          price: number;
          range: "1" | "10" | "2" | "20" | "3" | "30" | "4" | "40" | "5" | "region" | "solarsystem" | "station";
          region_id: number;
          state: "cancelled" | "expired";
          type_id: number;
          volume_remain: number;
          volume_total: number;
          wallet_division: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/orders/history/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return the roles of all members if the character has the personnel manager role or any grantable role. --- Alternate route: `/dev/corporations/{corporation_id}/roles/` Alternate route: `/v2/corporations/{corporation_id}/roles/` --- This route is cached for up to 3600 seconds
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdRoles
     * @summary Get corporation member roles
     * @request GET:/corporations/{corporation_id}/roles/
     * @secure
     * @response `200` `({ character_id: number, grantable_roles?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], grantable_roles_at_base?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], grantable_roles_at_hq?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], grantable_roles_at_other?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles_at_base?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles_at_hq?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles_at_other?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[] })[]` List of member character ID's and roles
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdRoles: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          character_id: number;
          grantable_roles?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          grantable_roles_at_base?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          grantable_roles_at_hq?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          grantable_roles_at_other?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles_at_base?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles_at_hq?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles_at_other?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/roles/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return how roles have changed for a coporation's members, up to a month --- Alternate route: `/dev/corporations/{corporation_id}/roles/history/` Alternate route: `/v2/corporations/{corporation_id}/roles/history/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdRolesHistory
     * @summary Get corporation member roles history
     * @request GET:/corporations/{corporation_id}/roles/history/
     * @secure
     * @response `200` `({ changed_at: string, character_id: number, issuer_id: number, new_roles: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], old_roles: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], role_type: "grantable_roles" | "grantable_roles_at_base" | "grantable_roles_at_hq" | "grantable_roles_at_other" | "roles" | "roles_at_base" | "roles_at_hq" | "roles_at_other" })[]` List of role changes
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdRolesHistory: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          changed_at: string;
          character_id: number;
          issuer_id: number;
          new_roles: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          old_roles: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          role_type:
            | "grantable_roles"
            | "grantable_roles_at_base"
            | "grantable_roles_at_hq"
            | "grantable_roles_at_other"
            | "roles"
            | "roles_at_base"
            | "roles_at_hq"
            | "roles_at_other";
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/roles/history/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return the current shareholders of a corporation. --- Alternate route: `/dev/corporations/{corporation_id}/shareholders/` Alternate route: `/legacy/corporations/{corporation_id}/shareholders/` Alternate route: `/v1/corporations/{corporation_id}/shareholders/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdShareholders
     * @summary Get corporation shareholders
     * @request GET:/corporations/{corporation_id}/shareholders/
     * @secure
     * @response `200` `({ share_count: number, shareholder_id: number, shareholder_type: "character" | "corporation" })[]` List of shareholders
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdShareholders: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { share_count: number; shareholder_id: number; shareholder_type: "character" | "corporation" }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/shareholders/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return corporation standings from agents, NPC corporations, and factions --- Alternate route: `/dev/corporations/{corporation_id}/standings/` Alternate route: `/v2/corporations/{corporation_id}/standings/` --- This route is cached for up to 3600 seconds
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdStandings
     * @summary Get corporation standings
     * @request GET:/corporations/{corporation_id}/standings/
     * @secure
     * @response `200` `({ from_id: number, from_type: "agent" | "npc_corp" | "faction", standing: number })[]` A list of standings
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdStandings: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { from_id: number; from_type: "agent" | "npc_corp" | "faction"; standing: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/standings/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns list of corporation starbases (POSes) --- Alternate route: `/dev/corporations/{corporation_id}/starbases/` Alternate route: `/v2/corporations/{corporation_id}/starbases/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdStarbases
     * @summary Get corporation starbases (POSes)
     * @request GET:/corporations/{corporation_id}/starbases/
     * @secure
     * @response `200` `({ moon_id?: number, onlined_since?: string, reinforced_until?: string, starbase_id: number, state?: "offline" | "online" | "onlining" | "reinforced" | "unanchoring", system_id: number, type_id: number, unanchor_at?: string })[]` List of starbases (POSes)
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdStarbases: (
      corporationId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          moon_id?: number;
          onlined_since?: string;
          reinforced_until?: string;
          starbase_id: number;
          state?: "offline" | "online" | "onlining" | "reinforced" | "unanchoring";
          system_id: number;
          type_id: number;
          unanchor_at?: string;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/starbases/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns various settings and fuels of a starbase (POS) --- Alternate route: `/dev/corporations/{corporation_id}/starbases/{starbase_id}/` Alternate route: `/v2/corporations/{corporation_id}/starbases/{starbase_id}/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdStarbasesStarbaseId
     * @summary Get starbase (POS) detail
     * @request GET:/corporations/{corporation_id}/starbases/{starbase_id}/
     * @secure
     * @response `200` `{ allow_alliance_members: boolean, allow_corporation_members: boolean, anchor: "alliance_member" | "config_starbase_equipment_role" | "corporation_member" | "starbase_fuel_technician_role", attack_if_at_war: boolean, attack_if_other_security_status_dropping: boolean, attack_security_status_threshold?: number, attack_standing_threshold?: number, fuel_bay_take: "alliance_member" | "config_starbase_equipment_role" | "corporation_member" | "starbase_fuel_technician_role", fuel_bay_view: "alliance_member" | "config_starbase_equipment_role" | "corporation_member" | "starbase_fuel_technician_role", fuels?: ({ quantity: number, type_id: number })[], offline: "alliance_member" | "config_starbase_equipment_role" | "corporation_member" | "starbase_fuel_technician_role", online: "alliance_member" | "config_starbase_equipment_role" | "corporation_member" | "starbase_fuel_technician_role", unanchor: "alliance_member" | "config_starbase_equipment_role" | "corporation_member" | "starbase_fuel_technician_role", use_alliance_standings: boolean }` List of starbases (POSes)
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdStarbasesStarbaseId: (
      corporationId: number,
      starbaseId: number,
      query: { datasource?: "tranquility"; system_id: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          allow_alliance_members: boolean;
          allow_corporation_members: boolean;
          anchor:
            | "alliance_member"
            | "config_starbase_equipment_role"
            | "corporation_member"
            | "starbase_fuel_technician_role";
          attack_if_at_war: boolean;
          attack_if_other_security_status_dropping: boolean;
          attack_security_status_threshold?: number;
          attack_standing_threshold?: number;
          fuel_bay_take:
            | "alliance_member"
            | "config_starbase_equipment_role"
            | "corporation_member"
            | "starbase_fuel_technician_role";
          fuel_bay_view:
            | "alliance_member"
            | "config_starbase_equipment_role"
            | "corporation_member"
            | "starbase_fuel_technician_role";
          fuels?: { quantity: number; type_id: number }[];
          offline:
            | "alliance_member"
            | "config_starbase_equipment_role"
            | "corporation_member"
            | "starbase_fuel_technician_role";
          online:
            | "alliance_member"
            | "config_starbase_equipment_role"
            | "corporation_member"
            | "starbase_fuel_technician_role";
          unanchor:
            | "alliance_member"
            | "config_starbase_equipment_role"
            | "corporation_member"
            | "starbase_fuel_technician_role";
          use_alliance_standings: boolean;
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/starbases/${starbaseId}/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of corporation structures. This route's version includes the changes to structures detailed in this blog: https://www.eveonline.com/article/upwell-2.0-structures-changes-coming-on-february-13th --- Alternate route: `/dev/corporations/{corporation_id}/structures/` Alternate route: `/v4/corporations/{corporation_id}/structures/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Station_Manager
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdStructures
     * @summary Get corporation structures
     * @request GET:/corporations/{corporation_id}/structures/
     * @secure
     * @response `200` `({ corporation_id: number, fuel_expires?: string, name?: string, next_reinforce_apply?: string, next_reinforce_hour?: number, profile_id: number, reinforce_hour?: number, services?: ({ name: string, state: "online" | "offline" | "cleanup" })[], state: "anchor_vulnerable" | "anchoring" | "armor_reinforce" | "armor_vulnerable" | "deploy_vulnerable" | "fitting_invulnerable" | "hull_reinforce" | "hull_vulnerable" | "online_deprecated" | "onlining_vulnerable" | "shield_vulnerable" | "unanchored" | "unknown", state_timer_end?: string, state_timer_start?: string, structure_id: number, system_id: number, type_id: number, unanchors_at?: string })[]` List of corporation structures' information
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdStructures: (
      corporationId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
        page?: number;
        token?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          corporation_id: number;
          fuel_expires?: string;
          name?: string;
          next_reinforce_apply?: string;
          next_reinforce_hour?: number;
          profile_id: number;
          reinforce_hour?: number;
          services?: { name: string; state: "online" | "offline" | "cleanup" }[];
          state:
            | "anchor_vulnerable"
            | "anchoring"
            | "armor_reinforce"
            | "armor_vulnerable"
            | "deploy_vulnerable"
            | "fitting_invulnerable"
            | "hull_reinforce"
            | "hull_vulnerable"
            | "online_deprecated"
            | "onlining_vulnerable"
            | "shield_vulnerable"
            | "unanchored"
            | "unknown";
          state_timer_end?: string;
          state_timer_start?: string;
          structure_id: number;
          system_id: number;
          type_id: number;
          unanchors_at?: string;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/structures/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a corporation's titles --- Alternate route: `/dev/corporations/{corporation_id}/titles/` Alternate route: `/v2/corporations/{corporation_id}/titles/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Director
     *
     * @tags Corporation
     * @name GetCorporationsCorporationIdTitles
     * @summary Get corporation titles
     * @request GET:/corporations/{corporation_id}/titles/
     * @secure
     * @response `200` `({ grantable_roles?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], grantable_roles_at_base?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], grantable_roles_at_hq?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], grantable_roles_at_other?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], name?: string, roles?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles_at_base?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles_at_hq?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], roles_at_other?: ("Account_Take_1" | "Account_Take_2" | "Account_Take_3" | "Account_Take_4" | "Account_Take_5" | "Account_Take_6" | "Account_Take_7" | "Accountant" | "Auditor" | "Communications_Officer" | "Config_Equipment" | "Config_Starbase_Equipment" | "Container_Take_1" | "Container_Take_2" | "Container_Take_3" | "Container_Take_4" | "Container_Take_5" | "Container_Take_6" | "Container_Take_7" | "Contract_Manager" | "Diplomat" | "Director" | "Factory_Manager" | "Fitting_Manager" | "Hangar_Query_1" | "Hangar_Query_2" | "Hangar_Query_3" | "Hangar_Query_4" | "Hangar_Query_5" | "Hangar_Query_6" | "Hangar_Query_7" | "Hangar_Take_1" | "Hangar_Take_2" | "Hangar_Take_3" | "Hangar_Take_4" | "Hangar_Take_5" | "Hangar_Take_6" | "Hangar_Take_7" | "Junior_Accountant" | "Personnel_Manager" | "Rent_Factory_Facility" | "Rent_Office" | "Rent_Research_Facility" | "Security_Officer" | "Starbase_Defense_Operator" | "Starbase_Fuel_Technician" | "Station_Manager" | "Trader")[], title_id?: number })[]` A list of titles
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdTitles: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          grantable_roles?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          grantable_roles_at_base?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          grantable_roles_at_hq?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          grantable_roles_at_other?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          name?: string;
          roles?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles_at_base?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles_at_hq?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          roles_at_other?: (
            | "Account_Take_1"
            | "Account_Take_2"
            | "Account_Take_3"
            | "Account_Take_4"
            | "Account_Take_5"
            | "Account_Take_6"
            | "Account_Take_7"
            | "Accountant"
            | "Auditor"
            | "Communications_Officer"
            | "Config_Equipment"
            | "Config_Starbase_Equipment"
            | "Container_Take_1"
            | "Container_Take_2"
            | "Container_Take_3"
            | "Container_Take_4"
            | "Container_Take_5"
            | "Container_Take_6"
            | "Container_Take_7"
            | "Contract_Manager"
            | "Diplomat"
            | "Director"
            | "Factory_Manager"
            | "Fitting_Manager"
            | "Hangar_Query_1"
            | "Hangar_Query_2"
            | "Hangar_Query_3"
            | "Hangar_Query_4"
            | "Hangar_Query_5"
            | "Hangar_Query_6"
            | "Hangar_Query_7"
            | "Hangar_Take_1"
            | "Hangar_Take_2"
            | "Hangar_Take_3"
            | "Hangar_Take_4"
            | "Hangar_Take_5"
            | "Hangar_Take_6"
            | "Hangar_Take_7"
            | "Junior_Accountant"
            | "Personnel_Manager"
            | "Rent_Factory_Facility"
            | "Rent_Office"
            | "Rent_Research_Facility"
            | "Security_Officer"
            | "Starbase_Defense_Operator"
            | "Starbase_Fuel_Technician"
            | "Station_Manager"
            | "Trader"
          )[];
          title_id?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/titles/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a corporation's wallets --- Alternate route: `/dev/corporations/{corporation_id}/wallets/` Alternate route: `/legacy/corporations/{corporation_id}/wallets/` Alternate route: `/v1/corporations/{corporation_id}/wallets/` --- This route is cached for up to 300 seconds --- Requires one of the following EVE corporation role(s): Accountant, Junior_Accountant
     *
     * @tags Wallet
     * @name GetCorporationsCorporationIdWallets
     * @summary Returns a corporation's wallet balance
     * @request GET:/corporations/{corporation_id}/wallets/
     * @secure
     * @response `200` `({ balance: number, division: number })[]` List of corporation wallets
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdWallets: (
      corporationId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { balance: number; division: number }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/wallets/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve the given corporation's wallet journal for the given division going 30 days back --- Alternate route: `/dev/corporations/{corporation_id}/wallets/{division}/journal/` Alternate route: `/v4/corporations/{corporation_id}/wallets/{division}/journal/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Accountant, Junior_Accountant
     *
     * @tags Wallet
     * @name GetCorporationsCorporationIdWalletsDivisionJournal
     * @summary Get corporation wallet journal
     * @request GET:/corporations/{corporation_id}/wallets/{division}/journal/
     * @secure
     * @response `200` `({ amount?: number, balance?: number, context_id?: number, context_id_type?: "structure_id" | "station_id" | "market_transaction_id" | "character_id" | "corporation_id" | "alliance_id" | "eve_system" | "industry_job_id" | "contract_id" | "planet_id" | "system_id" | "type_id", date: string, description: string, first_party_id?: number, id: number, reason?: string, ref_type: "acceleration_gate_fee" | "advertisement_listing_fee" | "agent_donation" | "agent_location_services" | "agent_miscellaneous" | "agent_mission_collateral_paid" | "agent_mission_collateral_refunded" | "agent_mission_reward" | "agent_mission_reward_corporation_tax" | "agent_mission_time_bonus_reward" | "agent_mission_time_bonus_reward_corporation_tax" | "agent_security_services" | "agent_services_rendered" | "agents_preward" | "alliance_maintainance_fee" | "alliance_registration_fee" | "asset_safety_recovery_tax" | "bounty" | "bounty_prize" | "bounty_prize_corporation_tax" | "bounty_prizes" | "bounty_reimbursement" | "bounty_surcharge" | "brokers_fee" | "clone_activation" | "clone_transfer" | "contraband_fine" | "contract_auction_bid" | "contract_auction_bid_corp" | "contract_auction_bid_refund" | "contract_auction_sold" | "contract_brokers_fee" | "contract_brokers_fee_corp" | "contract_collateral" | "contract_collateral_deposited_corp" | "contract_collateral_payout" | "contract_collateral_refund" | "contract_deposit" | "contract_deposit_corp" | "contract_deposit_refund" | "contract_deposit_sales_tax" | "contract_price" | "contract_price_payment_corp" | "contract_reversal" | "contract_reward" | "contract_reward_deposited" | "contract_reward_deposited_corp" | "contract_reward_refund" | "contract_sales_tax" | "copying" | "corporate_reward_payout" | "corporate_reward_tax" | "corporation_account_withdrawal" | "corporation_bulk_payment" | "corporation_dividend_payment" | "corporation_liquidation" | "corporation_logo_change_cost" | "corporation_payment" | "corporation_registration_fee" | "courier_mission_escrow" | "cspa" | "cspaofflinerefund" | "daily_challenge_reward" | "datacore_fee" | "dna_modification_fee" | "docking_fee" | "duel_wager_escrow" | "duel_wager_payment" | "duel_wager_refund" | "ess_escrow_transfer" | "external_trade_delivery" | "external_trade_freeze" | "external_trade_thaw" | "factory_slot_rental_fee" | "flux_payout" | "flux_tax" | "flux_ticket_repayment" | "flux_ticket_sale" | "gm_cash_transfer" | "industry_job_tax" | "infrastructure_hub_maintenance" | "inheritance" | "insurance" | "item_trader_payment" | "jump_clone_activation_fee" | "jump_clone_installation_fee" | "kill_right_fee" | "lp_store" | "manufacturing" | "market_escrow" | "market_fine_paid" | "market_provider_tax" | "market_transaction" | "medal_creation" | "medal_issued" | "milestone_reward_payment" | "mission_completion" | "mission_cost" | "mission_expiration" | "mission_reward" | "office_rental_fee" | "operation_bonus" | "opportunity_reward" | "planetary_construction" | "planetary_export_tax" | "planetary_import_tax" | "player_donation" | "player_trading" | "project_discovery_reward" | "project_discovery_tax" | "reaction" | "redeemed_isk_token" | "release_of_impounded_property" | "repair_bill" | "reprocessing_tax" | "researching_material_productivity" | "researching_technology" | "researching_time_productivity" | "resource_wars_reward" | "reverse_engineering" | "season_challenge_reward" | "security_processing_fee" | "shares" | "skill_purchase" | "sovereignity_bill" | "store_purchase" | "store_purchase_refund" | "structure_gate_jump" | "transaction_tax" | "upkeep_adjustment_fee" | "war_ally_contract" | "war_fee" | "war_fee_surrender", second_party_id?: number, tax?: number, tax_receiver_id?: number })[]` Journal entries
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdWalletsDivisionJournal: (
      corporationId: number,
      division: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          amount?: number;
          balance?: number;
          context_id?: number;
          context_id_type?:
            | "structure_id"
            | "station_id"
            | "market_transaction_id"
            | "character_id"
            | "corporation_id"
            | "alliance_id"
            | "eve_system"
            | "industry_job_id"
            | "contract_id"
            | "planet_id"
            | "system_id"
            | "type_id";
          date: string;
          description: string;
          first_party_id?: number;
          id: number;
          reason?: string;
          ref_type:
            | "acceleration_gate_fee"
            | "advertisement_listing_fee"
            | "agent_donation"
            | "agent_location_services"
            | "agent_miscellaneous"
            | "agent_mission_collateral_paid"
            | "agent_mission_collateral_refunded"
            | "agent_mission_reward"
            | "agent_mission_reward_corporation_tax"
            | "agent_mission_time_bonus_reward"
            | "agent_mission_time_bonus_reward_corporation_tax"
            | "agent_security_services"
            | "agent_services_rendered"
            | "agents_preward"
            | "alliance_maintainance_fee"
            | "alliance_registration_fee"
            | "asset_safety_recovery_tax"
            | "bounty"
            | "bounty_prize"
            | "bounty_prize_corporation_tax"
            | "bounty_prizes"
            | "bounty_reimbursement"
            | "bounty_surcharge"
            | "brokers_fee"
            | "clone_activation"
            | "clone_transfer"
            | "contraband_fine"
            | "contract_auction_bid"
            | "contract_auction_bid_corp"
            | "contract_auction_bid_refund"
            | "contract_auction_sold"
            | "contract_brokers_fee"
            | "contract_brokers_fee_corp"
            | "contract_collateral"
            | "contract_collateral_deposited_corp"
            | "contract_collateral_payout"
            | "contract_collateral_refund"
            | "contract_deposit"
            | "contract_deposit_corp"
            | "contract_deposit_refund"
            | "contract_deposit_sales_tax"
            | "contract_price"
            | "contract_price_payment_corp"
            | "contract_reversal"
            | "contract_reward"
            | "contract_reward_deposited"
            | "contract_reward_deposited_corp"
            | "contract_reward_refund"
            | "contract_sales_tax"
            | "copying"
            | "corporate_reward_payout"
            | "corporate_reward_tax"
            | "corporation_account_withdrawal"
            | "corporation_bulk_payment"
            | "corporation_dividend_payment"
            | "corporation_liquidation"
            | "corporation_logo_change_cost"
            | "corporation_payment"
            | "corporation_registration_fee"
            | "courier_mission_escrow"
            | "cspa"
            | "cspaofflinerefund"
            | "daily_challenge_reward"
            | "datacore_fee"
            | "dna_modification_fee"
            | "docking_fee"
            | "duel_wager_escrow"
            | "duel_wager_payment"
            | "duel_wager_refund"
            | "ess_escrow_transfer"
            | "external_trade_delivery"
            | "external_trade_freeze"
            | "external_trade_thaw"
            | "factory_slot_rental_fee"
            | "flux_payout"
            | "flux_tax"
            | "flux_ticket_repayment"
            | "flux_ticket_sale"
            | "gm_cash_transfer"
            | "industry_job_tax"
            | "infrastructure_hub_maintenance"
            | "inheritance"
            | "insurance"
            | "item_trader_payment"
            | "jump_clone_activation_fee"
            | "jump_clone_installation_fee"
            | "kill_right_fee"
            | "lp_store"
            | "manufacturing"
            | "market_escrow"
            | "market_fine_paid"
            | "market_provider_tax"
            | "market_transaction"
            | "medal_creation"
            | "medal_issued"
            | "milestone_reward_payment"
            | "mission_completion"
            | "mission_cost"
            | "mission_expiration"
            | "mission_reward"
            | "office_rental_fee"
            | "operation_bonus"
            | "opportunity_reward"
            | "planetary_construction"
            | "planetary_export_tax"
            | "planetary_import_tax"
            | "player_donation"
            | "player_trading"
            | "project_discovery_reward"
            | "project_discovery_tax"
            | "reaction"
            | "redeemed_isk_token"
            | "release_of_impounded_property"
            | "repair_bill"
            | "reprocessing_tax"
            | "researching_material_productivity"
            | "researching_technology"
            | "researching_time_productivity"
            | "resource_wars_reward"
            | "reverse_engineering"
            | "season_challenge_reward"
            | "security_processing_fee"
            | "shares"
            | "skill_purchase"
            | "sovereignity_bill"
            | "store_purchase"
            | "store_purchase_refund"
            | "structure_gate_jump"
            | "transaction_tax"
            | "upkeep_adjustment_fee"
            | "war_ally_contract"
            | "war_fee"
            | "war_fee_surrender";
          second_party_id?: number;
          tax?: number;
          tax_receiver_id?: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/wallets/${division}/journal/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get wallet transactions of a corporation --- Alternate route: `/dev/corporations/{corporation_id}/wallets/{division}/transactions/` Alternate route: `/legacy/corporations/{corporation_id}/wallets/{division}/transactions/` Alternate route: `/v1/corporations/{corporation_id}/wallets/{division}/transactions/` --- This route is cached for up to 3600 seconds --- Requires one of the following EVE corporation role(s): Accountant, Junior_Accountant
     *
     * @tags Wallet
     * @name GetCorporationsCorporationIdWalletsDivisionTransactions
     * @summary Get corporation wallet transactions
     * @request GET:/corporations/{corporation_id}/wallets/{division}/transactions/
     * @secure
     * @response `200` `({ client_id: number, date: string, is_buy: boolean, journal_ref_id: number, location_id: number, quantity: number, transaction_id: number, type_id: number, unit_price: number })[]` Wallet transactions
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getCorporationsCorporationIdWalletsDivisionTransactions: (
      corporationId: number,
      division: number,
      query?: { datasource?: "tranquility"; from_id?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          client_id: number;
          date: string;
          is_buy: boolean;
          journal_ref_id: number;
          location_id: number;
          quantity: number;
          transaction_id: number;
          type_id: number;
          unit_price: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/corporations/${corporationId}/wallets/${division}/transactions/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  dogma = {
    /**
     * @description Get a list of dogma attribute ids --- Alternate route: `/dev/dogma/attributes/` Alternate route: `/legacy/dogma/attributes/` Alternate route: `/v1/dogma/attributes/` --- This route expires daily at 11:05
     *
     * @tags Dogma
     * @name GetDogmaAttributes
     * @summary Get attributes
     * @request GET:/dogma/attributes/
     * @response `200` `(number)[]` A list of dogma attribute ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getDogmaAttributes: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/dogma/attributes/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a dogma attribute --- Alternate route: `/dev/dogma/attributes/{attribute_id}/` Alternate route: `/legacy/dogma/attributes/{attribute_id}/` Alternate route: `/v1/dogma/attributes/{attribute_id}/` --- This route expires daily at 11:05
     *
     * @tags Dogma
     * @name GetDogmaAttributesAttributeId
     * @summary Get attribute information
     * @request GET:/dogma/attributes/{attribute_id}/
     * @response `200` `{ attribute_id: number, default_value?: number, description?: string, display_name?: string, high_is_good?: boolean, icon_id?: number, name?: string, published?: boolean, stackable?: boolean, unit_id?: number }` Information about a dogma attribute
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Dogma attribute not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getDogmaAttributesAttributeId: (
      attributeId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          attribute_id: number;
          default_value?: number;
          description?: string;
          display_name?: string;
          high_is_good?: boolean;
          icon_id?: number;
          name?: string;
          published?: boolean;
          stackable?: boolean;
          unit_id?: number;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/dogma/attributes/${attributeId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns info about a dynamic item resulting from mutation with a mutaplasmid. --- Alternate route: `/dev/dogma/dynamic/items/{type_id}/{item_id}/` Alternate route: `/legacy/dogma/dynamic/items/{type_id}/{item_id}/` Alternate route: `/v1/dogma/dynamic/items/{type_id}/{item_id}/` --- This route expires daily at 11:05
     *
     * @tags Dogma
     * @name GetDogmaDynamicItemsTypeIdItemId
     * @summary Get dynamic item information
     * @request GET:/dogma/dynamic/items/{type_id}/{item_id}/
     * @response `200` `{ created_by: number, dogma_attributes: ({ attribute_id: number, value: number })[], dogma_effects: ({ effect_id: number, is_default: boolean })[], mutator_type_id: number, source_type_id: number }` Details about a dynamic item
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Item not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getDogmaDynamicItemsTypeIdItemId: (
      itemId: number,
      typeId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          created_by: number;
          dogma_attributes: { attribute_id: number; value: number }[];
          dogma_effects: { effect_id: number; is_default: boolean }[];
          mutator_type_id: number;
          source_type_id: number;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/dogma/dynamic/items/${typeId}/${itemId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of dogma effect ids --- Alternate route: `/dev/dogma/effects/` Alternate route: `/legacy/dogma/effects/` Alternate route: `/v1/dogma/effects/` --- This route expires daily at 11:05
     *
     * @tags Dogma
     * @name GetDogmaEffects
     * @summary Get effects
     * @request GET:/dogma/effects/
     * @response `200` `(number)[]` A list of dogma effect ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getDogmaEffects: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/dogma/effects/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a dogma effect --- Alternate route: `/dev/dogma/effects/{effect_id}/` Alternate route: `/v2/dogma/effects/{effect_id}/` --- This route expires daily at 11:05
     *
     * @tags Dogma
     * @name GetDogmaEffectsEffectId
     * @summary Get effect information
     * @request GET:/dogma/effects/{effect_id}/
     * @response `200` `{ description?: string, disallow_auto_repeat?: boolean, discharge_attribute_id?: number, display_name?: string, duration_attribute_id?: number, effect_category?: number, effect_id: number, electronic_chance?: boolean, falloff_attribute_id?: number, icon_id?: number, is_assistance?: boolean, is_offensive?: boolean, is_warp_safe?: boolean, modifiers?: ({ domain?: string, effect_id?: number, func: string, modified_attribute_id?: number, modifying_attribute_id?: number, operator?: number })[], name?: string, post_expression?: number, pre_expression?: number, published?: boolean, range_attribute_id?: number, range_chance?: boolean, tracking_speed_attribute_id?: number }` Information about a dogma effect
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Dogma effect not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getDogmaEffectsEffectId: (effectId: number, query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          description?: string;
          disallow_auto_repeat?: boolean;
          discharge_attribute_id?: number;
          display_name?: string;
          duration_attribute_id?: number;
          effect_category?: number;
          effect_id: number;
          electronic_chance?: boolean;
          falloff_attribute_id?: number;
          icon_id?: number;
          is_assistance?: boolean;
          is_offensive?: boolean;
          is_warp_safe?: boolean;
          modifiers?: {
            domain?: string;
            effect_id?: number;
            func: string;
            modified_attribute_id?: number;
            modifying_attribute_id?: number;
            operator?: number;
          }[];
          name?: string;
          post_expression?: number;
          pre_expression?: number;
          published?: boolean;
          range_attribute_id?: number;
          range_chance?: boolean;
          tracking_speed_attribute_id?: number;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/dogma/effects/${effectId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  fleets = {
    /**
     * @description Return details about a fleet --- Alternate route: `/dev/fleets/{fleet_id}/` Alternate route: `/legacy/fleets/{fleet_id}/` Alternate route: `/v1/fleets/{fleet_id}/` --- This route is cached for up to 5 seconds
     *
     * @tags Fleets
     * @name GetFleetsFleetId
     * @summary Get fleet information
     * @request GET:/fleets/{fleet_id}/
     * @secure
     * @response `200` `{ is_free_move: boolean, is_registered: boolean, is_voice_enabled: boolean, motd: string }` Details about a fleet
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getFleetsFleetId: (
      fleetId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { is_free_move: boolean; is_registered: boolean; is_voice_enabled: boolean; motd: string },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update settings about a fleet --- Alternate route: `/dev/fleets/{fleet_id}/` Alternate route: `/legacy/fleets/{fleet_id}/` Alternate route: `/v1/fleets/{fleet_id}/`
     *
     * @tags Fleets
     * @name PutFleetsFleetId
     * @summary Update fleet
     * @request PUT:/fleets/{fleet_id}/
     * @secure
     * @response `204` `void` Fleet updated
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    putFleetsFleetId: (
      fleetId: number,
      new_settings: { is_free_move?: boolean; motd?: string },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/`,
        method: "PUT",
        query: query,
        body: new_settings,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Return information about fleet members --- Alternate route: `/dev/fleets/{fleet_id}/members/` Alternate route: `/legacy/fleets/{fleet_id}/members/` Alternate route: `/v1/fleets/{fleet_id}/members/` --- This route is cached for up to 5 seconds
     *
     * @tags Fleets
     * @name GetFleetsFleetIdMembers
     * @summary Get fleet members
     * @request GET:/fleets/{fleet_id}/members/
     * @secure
     * @response `200` `({ character_id: number, join_time: string, role: "fleet_commander" | "wing_commander" | "squad_commander" | "squad_member", role_name: string, ship_type_id: number, solar_system_id: number, squad_id: number, station_id?: number, takes_fleet_warp: boolean, wing_id: number })[]` A list of fleet members
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getFleetsFleetIdMembers: (
      fleetId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
        token?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          character_id: number;
          join_time: string;
          role: "fleet_commander" | "wing_commander" | "squad_commander" | "squad_member";
          role_name: string;
          ship_type_id: number;
          solar_system_id: number;
          squad_id: number;
          station_id?: number;
          takes_fleet_warp: boolean;
          wing_id: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/members/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Invite a character into the fleet. If a character has a CSPA charge set it is not possible to invite them to the fleet using ESI --- Alternate route: `/dev/fleets/{fleet_id}/members/` Alternate route: `/legacy/fleets/{fleet_id}/members/` Alternate route: `/v1/fleets/{fleet_id}/members/`
     *
     * @tags Fleets
     * @name PostFleetsFleetIdMembers
     * @summary Create fleet invitation
     * @request POST:/fleets/{fleet_id}/members/
     * @secure
     * @response `204` `void` Fleet invitation sent
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `422` `{ error?: string }` Errors in invitation
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postFleetsFleetIdMembers: (
      fleetId: number,
      invitation: {
        character_id: number;
        role: "fleet_commander" | "wing_commander" | "squad_commander" | "squad_member";
        squad_id?: number;
        wing_id?: number;
      },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/members/`,
        method: "POST",
        query: query,
        body: invitation,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Kick a fleet member --- Alternate route: `/dev/fleets/{fleet_id}/members/{member_id}/` Alternate route: `/legacy/fleets/{fleet_id}/members/{member_id}/` Alternate route: `/v1/fleets/{fleet_id}/members/{member_id}/`
     *
     * @tags Fleets
     * @name DeleteFleetsFleetIdMembersMemberId
     * @summary Kick fleet member
     * @request DELETE:/fleets/{fleet_id}/members/{member_id}/
     * @secure
     * @response `204` `void` Fleet member kicked
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    deleteFleetsFleetIdMembersMemberId: (
      fleetId: number,
      memberId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/members/${memberId}/`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Move a fleet member around --- Alternate route: `/dev/fleets/{fleet_id}/members/{member_id}/` Alternate route: `/legacy/fleets/{fleet_id}/members/{member_id}/` Alternate route: `/v1/fleets/{fleet_id}/members/{member_id}/`
     *
     * @tags Fleets
     * @name PutFleetsFleetIdMembersMemberId
     * @summary Move fleet member
     * @request PUT:/fleets/{fleet_id}/members/{member_id}/
     * @secure
     * @response `204` `void` Fleet invitation sent
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `422` `{ error?: string }` Errors in invitation
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    putFleetsFleetIdMembersMemberId: (
      fleetId: number,
      memberId: number,
      movement: {
        role: "fleet_commander" | "wing_commander" | "squad_commander" | "squad_member";
        squad_id?: number;
        wing_id?: number;
      },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/members/${memberId}/`,
        method: "PUT",
        query: query,
        body: movement,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete a fleet squad, only empty squads can be deleted --- Alternate route: `/dev/fleets/{fleet_id}/squads/{squad_id}/` Alternate route: `/legacy/fleets/{fleet_id}/squads/{squad_id}/` Alternate route: `/v1/fleets/{fleet_id}/squads/{squad_id}/`
     *
     * @tags Fleets
     * @name DeleteFleetsFleetIdSquadsSquadId
     * @summary Delete fleet squad
     * @request DELETE:/fleets/{fleet_id}/squads/{squad_id}/
     * @secure
     * @response `204` `void` Squad deleted
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    deleteFleetsFleetIdSquadsSquadId: (
      fleetId: number,
      squadId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/squads/${squadId}/`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Rename a fleet squad --- Alternate route: `/dev/fleets/{fleet_id}/squads/{squad_id}/` Alternate route: `/legacy/fleets/{fleet_id}/squads/{squad_id}/` Alternate route: `/v1/fleets/{fleet_id}/squads/{squad_id}/`
     *
     * @tags Fleets
     * @name PutFleetsFleetIdSquadsSquadId
     * @summary Rename fleet squad
     * @request PUT:/fleets/{fleet_id}/squads/{squad_id}/
     * @secure
     * @response `204` `void` Squad renamed
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    putFleetsFleetIdSquadsSquadId: (
      fleetId: number,
      squadId: number,
      naming: { name: string },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/squads/${squadId}/`,
        method: "PUT",
        query: query,
        body: naming,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Return information about wings in a fleet --- Alternate route: `/dev/fleets/{fleet_id}/wings/` Alternate route: `/legacy/fleets/{fleet_id}/wings/` Alternate route: `/v1/fleets/{fleet_id}/wings/` --- This route is cached for up to 5 seconds
     *
     * @tags Fleets
     * @name GetFleetsFleetIdWings
     * @summary Get fleet wings
     * @request GET:/fleets/{fleet_id}/wings/
     * @secure
     * @response `200` `({ id: number, name: string, squads: ({ id: number, name: string })[] })[]` A list of fleet wings
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getFleetsFleetIdWings: (
      fleetId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
        token?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { id: number; name: string; squads: { id: number; name: string }[] }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/wings/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new wing in a fleet --- Alternate route: `/dev/fleets/{fleet_id}/wings/` Alternate route: `/legacy/fleets/{fleet_id}/wings/` Alternate route: `/v1/fleets/{fleet_id}/wings/`
     *
     * @tags Fleets
     * @name PostFleetsFleetIdWings
     * @summary Create fleet wing
     * @request POST:/fleets/{fleet_id}/wings/
     * @secure
     * @response `201` `{ wing_id: number }` Wing created
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postFleetsFleetIdWings: (
      fleetId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { wing_id: number },
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/wings/`,
        method: "POST",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a fleet wing, only empty wings can be deleted. The wing may contain squads, but the squads must be empty --- Alternate route: `/dev/fleets/{fleet_id}/wings/{wing_id}/` Alternate route: `/legacy/fleets/{fleet_id}/wings/{wing_id}/` Alternate route: `/v1/fleets/{fleet_id}/wings/{wing_id}/`
     *
     * @tags Fleets
     * @name DeleteFleetsFleetIdWingsWingId
     * @summary Delete fleet wing
     * @request DELETE:/fleets/{fleet_id}/wings/{wing_id}/
     * @secure
     * @response `204` `void` Wing deleted
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    deleteFleetsFleetIdWingsWingId: (
      fleetId: number,
      wingId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/wings/${wingId}/`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Rename a fleet wing --- Alternate route: `/dev/fleets/{fleet_id}/wings/{wing_id}/` Alternate route: `/legacy/fleets/{fleet_id}/wings/{wing_id}/` Alternate route: `/v1/fleets/{fleet_id}/wings/{wing_id}/`
     *
     * @tags Fleets
     * @name PutFleetsFleetIdWingsWingId
     * @summary Rename fleet wing
     * @request PUT:/fleets/{fleet_id}/wings/{wing_id}/
     * @secure
     * @response `204` `void` Wing renamed
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    putFleetsFleetIdWingsWingId: (
      fleetId: number,
      wingId: number,
      naming: { name: string },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/wings/${wingId}/`,
        method: "PUT",
        query: query,
        body: naming,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Create a new squad in a fleet --- Alternate route: `/dev/fleets/{fleet_id}/wings/{wing_id}/squads/` Alternate route: `/legacy/fleets/{fleet_id}/wings/{wing_id}/squads/` Alternate route: `/v1/fleets/{fleet_id}/wings/{wing_id}/squads/`
     *
     * @tags Fleets
     * @name PostFleetsFleetIdWingsWingIdSquads
     * @summary Create fleet squad
     * @request POST:/fleets/{fleet_id}/wings/{wing_id}/squads/
     * @secure
     * @response `201` `{ squad_id: number }` Squad created
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` The fleet does not exist or you don't have access to it
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postFleetsFleetIdWingsWingIdSquads: (
      fleetId: number,
      wingId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        { squad_id: number },
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/fleets/${fleetId}/wings/${wingId}/squads/`,
        method: "POST",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  fw = {
    /**
     * @description Top 4 leaderboard of factions for kills and victory points separated by total, last week and yesterday --- Alternate route: `/dev/fw/leaderboards/` Alternate route: `/legacy/fw/leaderboards/` Alternate route: `/v1/fw/leaderboards/` Alternate route: `/v2/fw/leaderboards/` --- This route expires daily at 11:05
     *
     * @tags Faction Warfare
     * @name GetFwLeaderboards
     * @summary List of the top factions in faction warfare
     * @request GET:/fw/leaderboards/
     * @response `200` `{ kills: { active_total: ({ amount?: number, faction_id?: number })[], last_week: ({ amount?: number, faction_id?: number })[], yesterday: ({ amount?: number, faction_id?: number })[] }, victory_points: { active_total: ({ amount?: number, faction_id?: number })[], last_week: ({ amount?: number, faction_id?: number })[], yesterday: ({ amount?: number, faction_id?: number })[] } }` Corporation leaderboard of kills and victory points within faction warfare
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getFwLeaderboards: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          kills: {
            active_total: { amount?: number; faction_id?: number }[];
            last_week: { amount?: number; faction_id?: number }[];
            yesterday: { amount?: number; faction_id?: number }[];
          };
          victory_points: {
            active_total: { amount?: number; faction_id?: number }[];
            last_week: { amount?: number; faction_id?: number }[];
            yesterday: { amount?: number; faction_id?: number }[];
          };
        },
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/fw/leaderboards/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Top 100 leaderboard of pilots for kills and victory points separated by total, last week and yesterday --- Alternate route: `/dev/fw/leaderboards/characters/` Alternate route: `/legacy/fw/leaderboards/characters/` Alternate route: `/v1/fw/leaderboards/characters/` Alternate route: `/v2/fw/leaderboards/characters/` --- This route expires daily at 11:05
     *
     * @tags Faction Warfare
     * @name GetFwLeaderboardsCharacters
     * @summary List of the top pilots in faction warfare
     * @request GET:/fw/leaderboards/characters/
     * @response `200` `{ kills: { active_total: ({ amount?: number, character_id?: number })[], last_week: ({ amount?: number, character_id?: number })[], yesterday: ({ amount?: number, character_id?: number })[] }, victory_points: { active_total: ({ amount?: number, character_id?: number })[], last_week: ({ amount?: number, character_id?: number })[], yesterday: ({ amount?: number, character_id?: number })[] } }` Character leaderboard of kills and victory points within faction warfare
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getFwLeaderboardsCharacters: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          kills: {
            active_total: { amount?: number; character_id?: number }[];
            last_week: { amount?: number; character_id?: number }[];
            yesterday: { amount?: number; character_id?: number }[];
          };
          victory_points: {
            active_total: { amount?: number; character_id?: number }[];
            last_week: { amount?: number; character_id?: number }[];
            yesterday: { amount?: number; character_id?: number }[];
          };
        },
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/fw/leaderboards/characters/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Top 10 leaderboard of corporations for kills and victory points separated by total, last week and yesterday --- Alternate route: `/dev/fw/leaderboards/corporations/` Alternate route: `/legacy/fw/leaderboards/corporations/` Alternate route: `/v1/fw/leaderboards/corporations/` Alternate route: `/v2/fw/leaderboards/corporations/` --- This route expires daily at 11:05
     *
     * @tags Faction Warfare
     * @name GetFwLeaderboardsCorporations
     * @summary List of the top corporations in faction warfare
     * @request GET:/fw/leaderboards/corporations/
     * @response `200` `{ kills: { active_total: ({ amount?: number, corporation_id?: number })[], last_week: ({ amount?: number, corporation_id?: number })[], yesterday: ({ amount?: number, corporation_id?: number })[] }, victory_points: { active_total: ({ amount?: number, corporation_id?: number })[], last_week: ({ amount?: number, corporation_id?: number })[], yesterday: ({ amount?: number, corporation_id?: number })[] } }` Corporation leaderboard of kills and victory points within faction warfare
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getFwLeaderboardsCorporations: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          kills: {
            active_total: { amount?: number; corporation_id?: number }[];
            last_week: { amount?: number; corporation_id?: number }[];
            yesterday: { amount?: number; corporation_id?: number }[];
          };
          victory_points: {
            active_total: { amount?: number; corporation_id?: number }[];
            last_week: { amount?: number; corporation_id?: number }[];
            yesterday: { amount?: number; corporation_id?: number }[];
          };
        },
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/fw/leaderboards/corporations/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Statistical overviews of factions involved in faction warfare --- Alternate route: `/dev/fw/stats/` Alternate route: `/legacy/fw/stats/` Alternate route: `/v1/fw/stats/` Alternate route: `/v2/fw/stats/` --- This route expires daily at 11:05
     *
     * @tags Faction Warfare
     * @name GetFwStats
     * @summary An overview of statistics about factions involved in faction warfare
     * @request GET:/fw/stats/
     * @response `200` `({ faction_id: number, kills: { last_week: number, total: number, yesterday: number }, pilots: number, systems_controlled: number, victory_points: { last_week: number, total: number, yesterday: number } })[]` Per faction breakdown of faction warfare statistics
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getFwStats: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          faction_id: number;
          kills: { last_week: number; total: number; yesterday: number };
          pilots: number;
          systems_controlled: number;
          victory_points: { last_week: number; total: number; yesterday: number };
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/fw/stats/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description An overview of the current ownership of faction warfare solar systems --- Alternate route: `/dev/fw/systems/` Alternate route: `/legacy/fw/systems/` Alternate route: `/v2/fw/systems/` Alternate route: `/v3/fw/systems/` --- This route is cached for up to 1800 seconds
     *
     * @tags Faction Warfare
     * @name GetFwSystems
     * @summary Ownership of faction warfare systems
     * @request GET:/fw/systems/
     * @response `200` `({ contested: "captured" | "contested" | "uncontested" | "vulnerable", occupier_faction_id: number, owner_faction_id: number, solar_system_id: number, victory_points: number, victory_points_threshold: number })[]` All faction warfare solar systems
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getFwSystems: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          contested: "captured" | "contested" | "uncontested" | "vulnerable";
          occupier_faction_id: number;
          owner_faction_id: number;
          solar_system_id: number;
          victory_points: number;
          victory_points_threshold: number;
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/fw/systems/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Data about which NPC factions are at war --- Alternate route: `/dev/fw/wars/` Alternate route: `/legacy/fw/wars/` Alternate route: `/v1/fw/wars/` Alternate route: `/v2/fw/wars/` --- This route expires daily at 11:05
     *
     * @tags Faction Warfare
     * @name GetFwWars
     * @summary Data about which NPC factions are at war
     * @request GET:/fw/wars/
     * @response `200` `({ against_id: number, faction_id: number })[]` A list of NPC factions at war
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getFwWars: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        { against_id: number; faction_id: number }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/fw/wars/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  incursions = {
    /**
     * @description Return a list of current incursions --- Alternate route: `/dev/incursions/` Alternate route: `/legacy/incursions/` Alternate route: `/v1/incursions/` --- This route is cached for up to 300 seconds
     *
     * @tags Incursions
     * @name GetIncursions
     * @summary List incursions
     * @request GET:/incursions/
     * @response `200` `({ constellation_id: number, faction_id: number, has_boss: boolean, infested_solar_systems: (number)[], influence: number, staging_solar_system_id: number, state: "withdrawing" | "mobilizing" | "established", type: string })[]` A list of incursions
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getIncursions: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          constellation_id: number;
          faction_id: number;
          has_boss: boolean;
          infested_solar_systems: number[];
          influence: number;
          staging_solar_system_id: number;
          state: "withdrawing" | "mobilizing" | "established";
          type: string;
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/incursions/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  industry = {
    /**
     * @description Return a list of industry facilities --- Alternate route: `/dev/industry/facilities/` Alternate route: `/legacy/industry/facilities/` Alternate route: `/v1/industry/facilities/` --- This route is cached for up to 3600 seconds
     *
     * @tags Industry
     * @name GetIndustryFacilities
     * @summary List industry facilities
     * @request GET:/industry/facilities/
     * @response `200` `({ facility_id: number, owner_id: number, region_id: number, solar_system_id: number, tax?: number, type_id: number })[]` A list of facilities
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getIndustryFacilities: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          facility_id: number;
          owner_id: number;
          region_id: number;
          solar_system_id: number;
          tax?: number;
          type_id: number;
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/industry/facilities/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return cost indices for solar systems --- Alternate route: `/dev/industry/systems/` Alternate route: `/legacy/industry/systems/` Alternate route: `/v1/industry/systems/` --- This route is cached for up to 3600 seconds
     *
     * @tags Industry
     * @name GetIndustrySystems
     * @summary List solar system cost indices
     * @request GET:/industry/systems/
     * @response `200` `({ cost_indices: ({ activity: "copying" | "duplicating" | "invention" | "manufacturing" | "none" | "reaction" | "researching_material_efficiency" | "researching_technology" | "researching_time_efficiency" | "reverse_engineering", cost_index: number })[], solar_system_id: number })[]` A list of cost indicies
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getIndustrySystems: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          cost_indices: {
            activity:
              | "copying"
              | "duplicating"
              | "invention"
              | "manufacturing"
              | "none"
              | "reaction"
              | "researching_material_efficiency"
              | "researching_technology"
              | "researching_time_efficiency"
              | "reverse_engineering";
            cost_index: number;
          }[];
          solar_system_id: number;
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/industry/systems/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  insurance = {
    /**
     * @description Return available insurance levels for all ship types --- Alternate route: `/dev/insurance/prices/` Alternate route: `/legacy/insurance/prices/` Alternate route: `/v1/insurance/prices/` --- This route is cached for up to 3600 seconds
     *
     * @tags Insurance
     * @name GetInsurancePrices
     * @summary List insurance levels
     * @request GET:/insurance/prices/
     * @response `200` `({ levels: ({ cost: number, name: string, payout: number })[], type_id: number })[]` A list of insurance levels for all ship types
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getInsurancePrices: (
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { levels: { cost: number; name: string; payout: number }[]; type_id: number }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/insurance/prices/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  killmails = {
    /**
     * @description Return a single killmail from its ID and hash --- Alternate route: `/dev/killmails/{killmail_id}/{killmail_hash}/` Alternate route: `/legacy/killmails/{killmail_id}/{killmail_hash}/` Alternate route: `/v1/killmails/{killmail_id}/{killmail_hash}/` --- This route is cached for up to 30758400 seconds
     *
     * @tags Killmails
     * @name GetKillmailsKillmailIdKillmailHash
     * @summary Get a single killmail
     * @request GET:/killmails/{killmail_id}/{killmail_hash}/
     * @response `200` `{ attackers: ({ alliance_id?: number, character_id?: number, corporation_id?: number, damage_done: number, faction_id?: number, final_blow: boolean, security_status: number, ship_type_id?: number, weapon_type_id?: number })[], killmail_id: number, killmail_time: string, moon_id?: number, solar_system_id: number, victim: { alliance_id?: number, character_id?: number, corporation_id?: number, damage_taken: number, faction_id?: number, items?: ({ flag: number, item_type_id: number, items?: ({ flag: number, item_type_id: number, quantity_destroyed?: number, quantity_dropped?: number, singleton: number })[], quantity_destroyed?: number, quantity_dropped?: number, singleton: number })[], position?: { x: number, y: number, z: number }, ship_type_id: number }, war_id?: number }` A killmail
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `422` `{ error?: string }` Invalid killmail_id and/or killmail_hash
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getKillmailsKillmailIdKillmailHash: (
      killmailHash: string,
      killmailId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          attackers: {
            alliance_id?: number;
            character_id?: number;
            corporation_id?: number;
            damage_done: number;
            faction_id?: number;
            final_blow: boolean;
            security_status: number;
            ship_type_id?: number;
            weapon_type_id?: number;
          }[];
          killmail_id: number;
          killmail_time: string;
          moon_id?: number;
          solar_system_id: number;
          victim: {
            alliance_id?: number;
            character_id?: number;
            corporation_id?: number;
            damage_taken: number;
            faction_id?: number;
            items?: {
              flag: number;
              item_type_id: number;
              items?: {
                flag: number;
                item_type_id: number;
                quantity_destroyed?: number;
                quantity_dropped?: number;
                singleton: number;
              }[];
              quantity_destroyed?: number;
              quantity_dropped?: number;
              singleton: number;
            }[];
            position?: { x: number; y: number; z: number };
            ship_type_id: number;
          };
          war_id?: number;
        },
        | void
        | BadRequest
        | ErrorLimited
        | { error?: string }
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/killmails/${killmailId}/${killmailHash}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  loyalty = {
    /**
     * @description Return a list of offers from a specific corporation's loyalty store --- Alternate route: `/dev/loyalty/stores/{corporation_id}/offers/` Alternate route: `/legacy/loyalty/stores/{corporation_id}/offers/` Alternate route: `/v1/loyalty/stores/{corporation_id}/offers/` --- This route expires daily at 11:05
     *
     * @tags Loyalty
     * @name GetLoyaltyStoresCorporationIdOffers
     * @summary List loyalty store offers
     * @request GET:/loyalty/stores/{corporation_id}/offers/
     * @response `200` `({ ak_cost?: number, isk_cost: number, lp_cost: number, offer_id: number, quantity: number, required_items: ({ quantity: number, type_id: number })[], type_id: number })[]` A list of offers
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` No loyalty point store found for the provided corporation
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getLoyaltyStoresCorporationIdOffers: (
      corporationId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          ak_cost?: number;
          isk_cost: number;
          lp_cost: number;
          offer_id: number;
          quantity: number;
          required_items: { quantity: number; type_id: number }[];
          type_id: number;
        }[],
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/loyalty/stores/${corporationId}/offers/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  markets = {
    /**
     * @description Get a list of item groups --- Alternate route: `/dev/markets/groups/` Alternate route: `/legacy/markets/groups/` Alternate route: `/v1/markets/groups/` --- This route expires daily at 11:05
     *
     * @tags Market
     * @name GetMarketsGroups
     * @summary Get item groups
     * @request GET:/markets/groups/
     * @response `200` `(number)[]` A list of item group ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getMarketsGroups: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/markets/groups/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on an item group --- Alternate route: `/dev/markets/groups/{market_group_id}/` Alternate route: `/legacy/markets/groups/{market_group_id}/` Alternate route: `/v1/markets/groups/{market_group_id}/` --- This route expires daily at 11:05
     *
     * @tags Market
     * @name GetMarketsGroupsMarketGroupId
     * @summary Get item group information
     * @request GET:/markets/groups/{market_group_id}/
     * @response `200` `{ description: string, market_group_id: number, name: string, parent_group_id?: number, types: (number)[] }` Information about an item group
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Market group not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getMarketsGroupsMarketGroupId: (
      marketGroupId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { description: string; market_group_id: number; name: string; parent_group_id?: number; types: number[] },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/markets/groups/${marketGroupId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of prices --- Alternate route: `/dev/markets/prices/` Alternate route: `/legacy/markets/prices/` Alternate route: `/v1/markets/prices/` --- This route is cached for up to 3600 seconds
     *
     * @tags Market
     * @name GetMarketsPrices
     * @summary List market prices
     * @request GET:/markets/prices/
     * @response `200` `({ adjusted_price?: number, average_price?: number, type_id: number })[]` A list of prices
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getMarketsPrices: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        { adjusted_price?: number; average_price?: number; type_id: number }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/markets/prices/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return all orders in a structure --- Alternate route: `/dev/markets/structures/{structure_id}/` Alternate route: `/legacy/markets/structures/{structure_id}/` Alternate route: `/v1/markets/structures/{structure_id}/` --- This route is cached for up to 300 seconds
     *
     * @tags Market
     * @name GetMarketsStructuresStructureId
     * @summary List orders in a structure
     * @request GET:/markets/structures/{structure_id}/
     * @secure
     * @response `200` `({ duration: number, is_buy_order: boolean, issued: string, location_id: number, min_volume: number, order_id: number, price: number, range: "station" | "region" | "solarsystem" | "1" | "2" | "3" | "4" | "5" | "10" | "20" | "30" | "40", type_id: number, volume_remain: number, volume_total: number })[]` A list of orders
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getMarketsStructuresStructureId: (
      structureId: number,
      query?: { datasource?: "tranquility"; page?: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          duration: number;
          is_buy_order: boolean;
          issued: string;
          location_id: number;
          min_volume: number;
          order_id: number;
          price: number;
          range: "station" | "region" | "solarsystem" | "1" | "2" | "3" | "4" | "5" | "10" | "20" | "30" | "40";
          type_id: number;
          volume_remain: number;
          volume_total: number;
        }[],
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/markets/structures/${structureId}/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of historical market statistics for the specified type in a region --- Alternate route: `/dev/markets/{region_id}/history/` Alternate route: `/legacy/markets/{region_id}/history/` Alternate route: `/v1/markets/{region_id}/history/` --- This route expires daily at 11:05
     *
     * @tags Market
     * @name GetMarketsRegionIdHistory
     * @summary List historical market statistics in a region
     * @request GET:/markets/{region_id}/history/
     * @response `200` `({ average: number, date: string, highest: number, lowest: number, order_count: number, volume: number })[]` A list of historical market statistics
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Type not found
     * @response `420` `ErrorLimited` Error limited
     * @response `422` `{ error?: string }` Not found
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     * @response `520` `{ error?: string }` Internal error thrown from the EVE server
     */
    getMarketsRegionIdHistory: (
      regionId: number,
      query: { datasource?: "tranquility"; type_id: number },
      params: RequestParams = {},
    ) =>
      this.request<
        { average: number; date: string; highest: number; lowest: number; order_count: number; volume: number }[],
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/markets/${regionId}/history/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of orders in a region --- Alternate route: `/dev/markets/{region_id}/orders/` Alternate route: `/legacy/markets/{region_id}/orders/` Alternate route: `/v1/markets/{region_id}/orders/` --- This route is cached for up to 300 seconds
     *
     * @tags Market
     * @name GetMarketsRegionIdOrders
     * @summary List orders in a region
     * @request GET:/markets/{region_id}/orders/
     * @response `200` `({ duration: number, is_buy_order: boolean, issued: string, location_id: number, min_volume: number, order_id: number, price: number, range: "station" | "region" | "solarsystem" | "1" | "2" | "3" | "4" | "5" | "10" | "20" | "30" | "40", system_id: number, type_id: number, volume_remain: number, volume_total: number })[]` A list of orders
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Not found
     * @response `420` `ErrorLimited` Error limited
     * @response `422` `{ error?: string }` Not found
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getMarketsRegionIdOrders: (
      regionId: number,
      query: { datasource?: "tranquility"; order_type: "buy" | "sell" | "all"; page?: number; type_id?: number },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          duration: number;
          is_buy_order: boolean;
          issued: string;
          location_id: number;
          min_volume: number;
          order_id: number;
          price: number;
          range: "station" | "region" | "solarsystem" | "1" | "2" | "3" | "4" | "5" | "10" | "20" | "30" | "40";
          system_id: number;
          type_id: number;
          volume_remain: number;
          volume_total: number;
        }[],
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/markets/${regionId}/orders/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of type IDs that have active orders in the region, for efficient market indexing. --- Alternate route: `/dev/markets/{region_id}/types/` Alternate route: `/legacy/markets/{region_id}/types/` Alternate route: `/v1/markets/{region_id}/types/` --- This route is cached for up to 600 seconds
     *
     * @tags Market
     * @name GetMarketsRegionIdTypes
     * @summary List type IDs relevant to a market
     * @request GET:/markets/{region_id}/types/
     * @response `200` `(number)[]` A list of type IDs
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getMarketsRegionIdTypes: (
      regionId: number,
      query?: { datasource?: "tranquility"; page?: number },
      params: RequestParams = {},
    ) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/markets/${regionId}/types/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  opportunities = {
    /**
     * @description Return a list of opportunities groups --- Alternate route: `/dev/opportunities/groups/` Alternate route: `/legacy/opportunities/groups/` Alternate route: `/v1/opportunities/groups/` --- This route expires daily at 11:05
     *
     * @tags Opportunities
     * @name GetOpportunitiesGroups
     * @summary Get opportunities groups
     * @request GET:/opportunities/groups/
     * @response `200` `(number)[]` A list of opportunities group ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getOpportunitiesGroups: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/opportunities/groups/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return information of an opportunities group --- Alternate route: `/dev/opportunities/groups/{group_id}/` Alternate route: `/legacy/opportunities/groups/{group_id}/` Alternate route: `/v1/opportunities/groups/{group_id}/` --- This route expires daily at 11:05
     *
     * @tags Opportunities
     * @name GetOpportunitiesGroupsGroupId
     * @summary Get opportunities group
     * @request GET:/opportunities/groups/{group_id}/
     * @response `200` `{ connected_groups: (number)[], description: string, group_id: number, name: string, notification: string, required_tasks: (number)[] }` Details of an opportunities group
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getOpportunitiesGroupsGroupId: (
      groupId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          connected_groups: number[];
          description: string;
          group_id: number;
          name: string;
          notification: string;
          required_tasks: number[];
        },
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/opportunities/groups/${groupId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of opportunities tasks --- Alternate route: `/dev/opportunities/tasks/` Alternate route: `/legacy/opportunities/tasks/` Alternate route: `/v1/opportunities/tasks/` --- This route expires daily at 11:05
     *
     * @tags Opportunities
     * @name GetOpportunitiesTasks
     * @summary Get opportunities tasks
     * @request GET:/opportunities/tasks/
     * @response `200` `(number)[]` A list of opportunities task ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getOpportunitiesTasks: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/opportunities/tasks/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return information of an opportunities task --- Alternate route: `/dev/opportunities/tasks/{task_id}/` Alternate route: `/legacy/opportunities/tasks/{task_id}/` Alternate route: `/v1/opportunities/tasks/{task_id}/` --- This route expires daily at 11:05
     *
     * @tags Opportunities
     * @name GetOpportunitiesTasksTaskId
     * @summary Get opportunities task
     * @request GET:/opportunities/tasks/{task_id}/
     * @response `200` `{ description: string, name: string, notification: string, task_id: number }` Details of an opportunities task
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getOpportunitiesTasksTaskId: (taskId: number, query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        { description: string; name: string; notification: string; task_id: number },
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/opportunities/tasks/${taskId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  route = {
    /**
     * @description Get the systems between origin and destination --- Alternate route: `/dev/route/{origin}/{destination}/` Alternate route: `/legacy/route/{origin}/{destination}/` Alternate route: `/v1/route/{origin}/{destination}/` --- This route is cached for up to 86400 seconds
     *
     * @tags Routes
     * @name GetRouteOriginDestination
     * @summary Get route
     * @request GET:/route/{origin}/{destination}/
     * @response `200` `(number)[]` Solar systems in route from origin to destination
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` No route found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getRouteOriginDestination: (
      destination: number,
      origin: number,
      query?: {
        avoid?: number[];
        connections?: number[][];
        datasource?: "tranquility";
        flag?: "shortest" | "secure" | "insecure";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        number[],
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/route/${origin}/${destination}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  search = {
    /**
     * @description Search for entities that match a given sub-string. --- Alternate route: `/dev/search/` Alternate route: `/legacy/search/` Alternate route: `/v2/search/` --- This route is cached for up to 3600 seconds
     *
     * @tags Search
     * @name GetSearch
     * @summary Search on a string
     * @request GET:/search/
     * @response `200` `{ agent?: (number)[], alliance?: (number)[], character?: (number)[], constellation?: (number)[], corporation?: (number)[], faction?: (number)[], inventory_type?: (number)[], region?: (number)[], solar_system?: (number)[], station?: (number)[] }` A list of search results
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getSearch: (
      query: {
        categories: (
          | "agent"
          | "alliance"
          | "character"
          | "constellation"
          | "corporation"
          | "faction"
          | "inventory_type"
          | "region"
          | "solar_system"
          | "station"
        )[];
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
        search: string;
        strict?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          agent?: number[];
          alliance?: number[];
          character?: number[];
          constellation?: number[];
          corporation?: number[];
          faction?: number[];
          inventory_type?: number[];
          region?: number[];
          solar_system?: number[];
          station?: number[];
        },
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/search/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  sovereignty = {
    /**
     * @description Shows sovereignty data for campaigns. --- Alternate route: `/dev/sovereignty/campaigns/` Alternate route: `/legacy/sovereignty/campaigns/` Alternate route: `/v1/sovereignty/campaigns/` --- This route is cached for up to 5 seconds
     *
     * @tags Sovereignty
     * @name GetSovereigntyCampaigns
     * @summary List sovereignty campaigns
     * @request GET:/sovereignty/campaigns/
     * @response `200` `({ attackers_score?: number, campaign_id: number, constellation_id: number, defender_id?: number, defender_score?: number, event_type: "tcu_defense" | "ihub_defense" | "station_defense" | "station_freeport", participants?: ({ alliance_id: number, score: number })[], solar_system_id: number, start_time: string, structure_id: number })[]` A list of sovereignty campaigns
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getSovereigntyCampaigns: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          attackers_score?: number;
          campaign_id: number;
          constellation_id: number;
          defender_id?: number;
          defender_score?: number;
          event_type: "tcu_defense" | "ihub_defense" | "station_defense" | "station_freeport";
          participants?: { alliance_id: number; score: number }[];
          solar_system_id: number;
          start_time: string;
          structure_id: number;
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/sovereignty/campaigns/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Shows sovereignty information for solar systems --- Alternate route: `/dev/sovereignty/map/` Alternate route: `/legacy/sovereignty/map/` Alternate route: `/v1/sovereignty/map/` --- This route is cached for up to 3600 seconds
     *
     * @tags Sovereignty
     * @name GetSovereigntyMap
     * @summary List sovereignty of systems
     * @request GET:/sovereignty/map/
     * @response `200` `({ alliance_id?: number, corporation_id?: number, faction_id?: number, system_id: number })[]` A list of sovereignty information for solar systems in New Eden
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getSovereigntyMap: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        { alliance_id?: number; corporation_id?: number; faction_id?: number; system_id: number }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/sovereignty/map/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Shows sovereignty data for structures. --- Alternate route: `/dev/sovereignty/structures/` Alternate route: `/legacy/sovereignty/structures/` Alternate route: `/v1/sovereignty/structures/` --- This route is cached for up to 120 seconds
     *
     * @tags Sovereignty
     * @name GetSovereigntyStructures
     * @summary List sovereignty structures
     * @request GET:/sovereignty/structures/
     * @response `200` `({ alliance_id: number, solar_system_id: number, structure_id: number, structure_type_id: number, vulnerability_occupancy_level?: number, vulnerable_end_time?: string, vulnerable_start_time?: string })[]` A list of sovereignty structures
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getSovereigntyStructures: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          alliance_id: number;
          solar_system_id: number;
          structure_id: number;
          structure_type_id: number;
          vulnerability_occupancy_level?: number;
          vulnerable_end_time?: string;
          vulnerable_start_time?: string;
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/sovereignty/structures/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  status = {
    /**
     * @description EVE Server status --- Alternate route: `/dev/status/` Alternate route: `/legacy/status/` Alternate route: `/v1/status/` Alternate route: `/v2/status/` --- This route is cached for up to 30 seconds
     *
     * @tags Status
     * @name GetStatus
     * @summary Retrieve the uptime and player counts
     * @request GET:/status/
     * @response `200` `{ players: number, server_version: string, start_time: string, vip?: boolean }` Server status
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getStatus: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        { players: number; server_version: string; start_time: string; vip?: boolean },
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/status/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  ui = {
    /**
     * @description Set a solar system as autopilot waypoint --- Alternate route: `/dev/ui/autopilot/waypoint/` Alternate route: `/legacy/ui/autopilot/waypoint/` Alternate route: `/v2/ui/autopilot/waypoint/`
     *
     * @tags User Interface
     * @name PostUiAutopilotWaypoint
     * @summary Set Autopilot Waypoint
     * @request POST:/ui/autopilot/waypoint/
     * @secure
     * @response `204` `void` Open window request received
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postUiAutopilotWaypoint: (
      query: {
        add_to_beginning: boolean;
        clear_other_waypoints: boolean;
        datasource?: "tranquility";
        destination_id: number;
        token?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/ui/autopilot/waypoint/`,
        method: "POST",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Open the contract window inside the client --- Alternate route: `/dev/ui/openwindow/contract/` Alternate route: `/legacy/ui/openwindow/contract/` Alternate route: `/v1/ui/openwindow/contract/`
     *
     * @tags User Interface
     * @name PostUiOpenwindowContract
     * @summary Open Contract Window
     * @request POST:/ui/openwindow/contract/
     * @secure
     * @response `204` `void` Open window request received
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postUiOpenwindowContract: (
      query: { contract_id: number; datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/ui/openwindow/contract/`,
        method: "POST",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Open the information window for a character, corporation or alliance inside the client --- Alternate route: `/dev/ui/openwindow/information/` Alternate route: `/legacy/ui/openwindow/information/` Alternate route: `/v1/ui/openwindow/information/`
     *
     * @tags User Interface
     * @name PostUiOpenwindowInformation
     * @summary Open Information Window
     * @request POST:/ui/openwindow/information/
     * @secure
     * @response `204` `void` Open window request received
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postUiOpenwindowInformation: (
      query: { datasource?: "tranquility"; target_id: number; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/ui/openwindow/information/`,
        method: "POST",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Open the market details window for a specific typeID inside the client --- Alternate route: `/dev/ui/openwindow/marketdetails/` Alternate route: `/legacy/ui/openwindow/marketdetails/` Alternate route: `/v1/ui/openwindow/marketdetails/`
     *
     * @tags User Interface
     * @name PostUiOpenwindowMarketdetails
     * @summary Open Market Details
     * @request POST:/ui/openwindow/marketdetails/
     * @secure
     * @response `204` `void` Open window request received
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postUiOpenwindowMarketdetails: (
      query: { datasource?: "tranquility"; token?: string; type_id: number },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        BadRequest | Unauthorized | Forbidden | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/ui/openwindow/marketdetails/`,
        method: "POST",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Open the New Mail window, according to settings from the request if applicable --- Alternate route: `/dev/ui/openwindow/newmail/` Alternate route: `/legacy/ui/openwindow/newmail/` Alternate route: `/v1/ui/openwindow/newmail/`
     *
     * @tags User Interface
     * @name PostUiOpenwindowNewmail
     * @summary Open New Mail Window
     * @request POST:/ui/openwindow/newmail/
     * @secure
     * @response `204` `void` Open window request received
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `420` `ErrorLimited` Error limited
     * @response `422` `{ error?: string }` Invalid request
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postUiOpenwindowNewmail: (
      new_mail: {
        body: string;
        recipients: number[];
        subject: string;
        to_corp_or_alliance_id?: number;
        to_mailing_list_id?: number;
      },
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        | BadRequest
        | Unauthorized
        | Forbidden
        | ErrorLimited
        | { error?: string }
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/ui/openwindow/newmail/`,
        method: "POST",
        query: query,
        body: new_mail,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  universe = {
    /**
     * @description Get all character ancestries --- Alternate route: `/legacy/universe/ancestries/` Alternate route: `/v1/universe/ancestries/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseAncestries
     * @summary Get ancestries
     * @request GET:/universe/ancestries/
     * @response `200` `({ bloodline_id: number, description: string, icon_id?: number, id: number, name: string, short_description?: string })[]` A list of ancestries
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseAncestries: (
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          bloodline_id: number;
          description: string;
          icon_id?: number;
          id: number;
          name: string;
          short_description?: string;
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/ancestries/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on an asteroid belt --- Alternate route: `/legacy/universe/asteroid_belts/{asteroid_belt_id}/` Alternate route: `/v1/universe/asteroid_belts/{asteroid_belt_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseAsteroidBeltsAsteroidBeltId
     * @summary Get asteroid belt information
     * @request GET:/universe/asteroid_belts/{asteroid_belt_id}/
     * @response `200` `{ name: string, position: { x: number, y: number, z: number }, system_id: number }` Information about an asteroid belt
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Asteroid belt not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseAsteroidBeltsAsteroidBeltId: (
      asteroidBeltId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        { name: string; position: { x: number; y: number; z: number }; system_id: number },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/asteroid_belts/${asteroidBeltId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of bloodlines --- Alternate route: `/legacy/universe/bloodlines/` Alternate route: `/v1/universe/bloodlines/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseBloodlines
     * @summary Get bloodlines
     * @request GET:/universe/bloodlines/
     * @response `200` `({ bloodline_id: number, charisma: number, corporation_id: number, description: string, intelligence: number, memory: number, name: string, perception: number, race_id: number, ship_type_id?: number | null, willpower: number })[]` A list of bloodlines
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseBloodlines: (
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          bloodline_id: number;
          charisma: number;
          corporation_id: number;
          description: string;
          intelligence: number;
          memory: number;
          name: string;
          perception: number;
          race_id: number;
          ship_type_id?: number | null;
          willpower: number;
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/bloodlines/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of item categories --- Alternate route: `/legacy/universe/categories/` Alternate route: `/v1/universe/categories/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseCategories
     * @summary Get item categories
     * @request GET:/universe/categories/
     * @response `200` `(number)[]` A list of item category ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseCategories: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/categories/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information of an item category --- Alternate route: `/legacy/universe/categories/{category_id}/` Alternate route: `/v1/universe/categories/{category_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseCategoriesCategoryId
     * @summary Get item category information
     * @request GET:/universe/categories/{category_id}/
     * @response `200` `{ category_id: number, groups: (number)[], name: string, published: boolean }` Information about an item category
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Category not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseCategoriesCategoryId: (
      categoryId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { category_id: number; groups: number[]; name: string; published: boolean },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/categories/${categoryId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of constellations --- Alternate route: `/legacy/universe/constellations/` Alternate route: `/v1/universe/constellations/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseConstellations
     * @summary Get constellations
     * @request GET:/universe/constellations/
     * @response `200` `(number)[]` A list of constellation ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseConstellations: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/constellations/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a constellation --- Alternate route: `/legacy/universe/constellations/{constellation_id}/` Alternate route: `/v1/universe/constellations/{constellation_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseConstellationsConstellationId
     * @summary Get constellation information
     * @request GET:/universe/constellations/{constellation_id}/
     * @response `200` `{ constellation_id: number, name: string, position: { x: number, y: number, z: number }, region_id: number, systems: (number)[] }` Information about a constellation
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Constellation not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseConstellationsConstellationId: (
      constellationId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          constellation_id: number;
          name: string;
          position: { x: number; y: number; z: number };
          region_id: number;
          systems: number[];
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/constellations/${constellationId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of factions --- Alternate route: `/dev/universe/factions/` Alternate route: `/v2/universe/factions/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseFactions
     * @summary Get factions
     * @request GET:/universe/factions/
     * @response `200` `({ corporation_id?: number, description: string, faction_id: number, is_unique: boolean, militia_corporation_id?: number, name: string, size_factor: number, solar_system_id?: number, station_count: number, station_system_count: number })[]` A list of factions
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseFactions: (
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          corporation_id?: number;
          description: string;
          faction_id: number;
          is_unique: boolean;
          militia_corporation_id?: number;
          name: string;
          size_factor: number;
          solar_system_id?: number;
          station_count: number;
          station_system_count: number;
        }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/factions/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of graphics --- Alternate route: `/legacy/universe/graphics/` Alternate route: `/v1/universe/graphics/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseGraphics
     * @summary Get graphics
     * @request GET:/universe/graphics/
     * @response `200` `(number)[]` A list of graphic ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseGraphics: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/graphics/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a graphic --- Alternate route: `/dev/universe/graphics/{graphic_id}/` Alternate route: `/legacy/universe/graphics/{graphic_id}/` Alternate route: `/v1/universe/graphics/{graphic_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseGraphicsGraphicId
     * @summary Get graphic information
     * @request GET:/universe/graphics/{graphic_id}/
     * @response `200` `{ collision_file?: string, graphic_file?: string, graphic_id: number, icon_folder?: string, sof_dna?: string, sof_fation_name?: string, sof_hull_name?: string, sof_race_name?: string }` Information about a graphic
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Graphic not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseGraphicsGraphicId: (
      graphicId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          collision_file?: string;
          graphic_file?: string;
          graphic_id: number;
          icon_folder?: string;
          sof_dna?: string;
          sof_fation_name?: string;
          sof_hull_name?: string;
          sof_race_name?: string;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/graphics/${graphicId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of item groups --- Alternate route: `/legacy/universe/groups/` Alternate route: `/v1/universe/groups/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseGroups
     * @summary Get item groups
     * @request GET:/universe/groups/
     * @response `200` `(number)[]` A list of item group ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseGroups: (query?: { datasource?: "tranquility"; page?: number }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/groups/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on an item group --- Alternate route: `/dev/universe/groups/{group_id}/` Alternate route: `/legacy/universe/groups/{group_id}/` Alternate route: `/v1/universe/groups/{group_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseGroupsGroupId
     * @summary Get item group information
     * @request GET:/universe/groups/{group_id}/
     * @response `200` `{ category_id: number, group_id: number, name: string, published: boolean, types: (number)[] }` Information about an item group
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Group not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseGroupsGroupId: (
      groupId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { category_id: number; group_id: number; name: string; published: boolean; types: number[] },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/groups/${groupId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Resolve a set of names to IDs in the following categories: agents, alliances, characters, constellations, corporations factions, inventory_types, regions, stations, and systems. Only exact matches will be returned. All names searched for are cached for 12 hours --- Alternate route: `/dev/universe/ids/` Alternate route: `/legacy/universe/ids/` Alternate route: `/v1/universe/ids/`
     *
     * @tags Universe
     * @name PostUniverseIds
     * @summary Bulk names to IDs
     * @request POST:/universe/ids/
     * @response `200` `{ agents?: ({ id?: number, name?: string })[], alliances?: ({ id?: number, name?: string })[], characters?: ({ id?: number, name?: string })[], constellations?: ({ id?: number, name?: string })[], corporations?: ({ id?: number, name?: string })[], factions?: ({ id?: number, name?: string })[], inventory_types?: ({ id?: number, name?: string })[], regions?: ({ id?: number, name?: string })[], stations?: ({ id?: number, name?: string })[], systems?: ({ id?: number, name?: string })[] }` List of id/name associations for a set of names divided by category. Any name passed in that did not have a match will be ommitted
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postUniverseIds: (
      names: string[],
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          agents?: { id?: number; name?: string }[];
          alliances?: { id?: number; name?: string }[];
          characters?: { id?: number; name?: string }[];
          constellations?: { id?: number; name?: string }[];
          corporations?: { id?: number; name?: string }[];
          factions?: { id?: number; name?: string }[];
          inventory_types?: { id?: number; name?: string }[];
          regions?: { id?: number; name?: string }[];
          stations?: { id?: number; name?: string }[];
          systems?: { id?: number; name?: string }[];
        },
        BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/ids/`,
        method: "POST",
        query: query,
        body: names,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a moon --- Alternate route: `/legacy/universe/moons/{moon_id}/` Alternate route: `/v1/universe/moons/{moon_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseMoonsMoonId
     * @summary Get moon information
     * @request GET:/universe/moons/{moon_id}/
     * @response `200` `{ moon_id: number, name: string, position: { x: number, y: number, z: number }, system_id: number }` Information about a moon
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Moon not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseMoonsMoonId: (moonId: number, query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        { moon_id: number; name: string; position: { x: number; y: number; z: number }; system_id: number },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/moons/${moonId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Resolve a set of IDs to names and categories. Supported ID's for resolving are: Characters, Corporations, Alliances, Stations, Solar Systems, Constellations, Regions, Types, Factions --- Alternate route: `/dev/universe/names/` Alternate route: `/v3/universe/names/`
     *
     * @tags Universe
     * @name PostUniverseNames
     * @summary Get names and categories for a set of IDs
     * @request POST:/universe/names/
     * @response `200` `({ category: "alliance" | "character" | "constellation" | "corporation" | "inventory_type" | "region" | "solar_system" | "station" | "faction", id: number, name: string })[]` List of id/name associations for a set of IDs. All IDs must resolve to a name, or nothing will be returned
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Ensure all IDs are valid before resolving
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    postUniverseNames: (ids: number[], query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          category:
            | "alliance"
            | "character"
            | "constellation"
            | "corporation"
            | "inventory_type"
            | "region"
            | "solar_system"
            | "station"
            | "faction";
          id: number;
          name: string;
        }[],
        BadRequest | { error?: string } | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/names/`,
        method: "POST",
        query: query,
        body: ids,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a planet --- Alternate route: `/legacy/universe/planets/{planet_id}/` Alternate route: `/v1/universe/planets/{planet_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniversePlanetsPlanetId
     * @summary Get planet information
     * @request GET:/universe/planets/{planet_id}/
     * @response `200` `{ name: string, planet_id: number, position: { x: number, y: number, z: number }, system_id: number, type_id: number }` Information about a planet
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Planet not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniversePlanetsPlanetId: (
      planetId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          name: string;
          planet_id: number;
          position: { x: number; y: number; z: number };
          system_id: number;
          type_id: number;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/planets/${planetId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of character races --- Alternate route: `/dev/universe/races/` Alternate route: `/legacy/universe/races/` Alternate route: `/v1/universe/races/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseRaces
     * @summary Get character races
     * @request GET:/universe/races/
     * @response `200` `({ alliance_id: number, description: string, name: string, race_id: number })[]` A list of character races
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseRaces: (
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { alliance_id: number; description: string; name: string; race_id: number }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/races/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of regions --- Alternate route: `/legacy/universe/regions/` Alternate route: `/v1/universe/regions/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseRegions
     * @summary Get regions
     * @request GET:/universe/regions/
     * @response `200` `(number)[]` A list of region ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseRegions: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/regions/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a region --- Alternate route: `/legacy/universe/regions/{region_id}/` Alternate route: `/v1/universe/regions/{region_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseRegionsRegionId
     * @summary Get region information
     * @request GET:/universe/regions/{region_id}/
     * @response `200` `{ constellations: (number)[], description?: string, name: string, region_id: number }` Information about a region
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Region not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseRegionsRegionId: (
      regionId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        { constellations: number[]; description?: string; name: string; region_id: number },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/regions/${regionId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a planetary factory schematic --- Alternate route: `/dev/universe/schematics/{schematic_id}/` Alternate route: `/legacy/universe/schematics/{schematic_id}/` Alternate route: `/v1/universe/schematics/{schematic_id}/` --- This route is cached for up to 3600 seconds
     *
     * @tags Planetary Interaction
     * @name GetUniverseSchematicsSchematicId
     * @summary Get schematic information
     * @request GET:/universe/schematics/{schematic_id}/
     * @response `200` `{ cycle_time: number, schematic_name: string }` Public data about a schematic
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Schematic not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseSchematicsSchematicId: (
      schematicId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        { cycle_time: number; schematic_name: string },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/schematics/${schematicId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a stargate --- Alternate route: `/legacy/universe/stargates/{stargate_id}/` Alternate route: `/v1/universe/stargates/{stargate_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseStargatesStargateId
     * @summary Get stargate information
     * @request GET:/universe/stargates/{stargate_id}/
     * @response `200` `{ destination: { stargate_id: number, system_id: number }, name: string, position: { x: number, y: number, z: number }, stargate_id: number, system_id: number, type_id: number }` Information about a stargate
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Stargate not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseStargatesStargateId: (
      stargateId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          destination: { stargate_id: number; system_id: number };
          name: string;
          position: { x: number; y: number; z: number };
          stargate_id: number;
          system_id: number;
          type_id: number;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/stargates/${stargateId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a star --- Alternate route: `/legacy/universe/stars/{star_id}/` Alternate route: `/v1/universe/stars/{star_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseStarsStarId
     * @summary Get star information
     * @request GET:/universe/stars/{star_id}/
     * @response `200` `{ age: number, luminosity: number, name: string, radius: number, solar_system_id: number, spectral_class: "K2 V" | "K4 V" | "G2 V" | "G8 V" | "M7 V" | "K7 V" | "M2 V" | "K5 V" | "M3 V" | "G0 V" | "G7 V" | "G3 V" | "F9 V" | "G5 V" | "F6 V" | "K8 V" | "K9 V" | "K6 V" | "G9 V" | "G6 V" | "G4 VI" | "G4 V" | "F8 V" | "F2 V" | "F1 V" | "K3 V" | "F0 VI" | "G1 VI" | "G0 VI" | "K1 V" | "M4 V" | "M1 V" | "M6 V" | "M0 V" | "K2 IV" | "G2 VI" | "K0 V" | "K5 IV" | "F5 VI" | "G6 VI" | "F6 VI" | "F2 IV" | "G3 VI" | "M8 V" | "F1 VI" | "K1 IV" | "F7 V" | "G5 VI" | "M5 V" | "G7 VI" | "F5 V" | "F4 VI" | "F8 VI" | "K3 IV" | "F4 IV" | "F0 V" | "G7 IV" | "G8 VI" | "F2 VI" | "F4 V" | "F7 VI" | "F3 V" | "G1 V" | "G9 VI" | "F3 IV" | "F9 VI" | "M9 V" | "K0 IV" | "F1 IV" | "G4 IV" | "F3 VI" | "K4 IV" | "G5 IV" | "G3 IV" | "G1 IV" | "K7 IV" | "G0 IV" | "K6 IV" | "K9 IV" | "G2 IV" | "F9 IV" | "F0 IV" | "K8 IV" | "G8 IV" | "F6 IV" | "F5 IV" | "A0" | "A0IV" | "A0IV2", temperature: number, type_id: number }` Information about a star
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseStarsStarId: (starId: number, query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          age: number;
          luminosity: number;
          name: string;
          radius: number;
          solar_system_id: number;
          spectral_class:
            | "K2 V"
            | "K4 V"
            | "G2 V"
            | "G8 V"
            | "M7 V"
            | "K7 V"
            | "M2 V"
            | "K5 V"
            | "M3 V"
            | "G0 V"
            | "G7 V"
            | "G3 V"
            | "F9 V"
            | "G5 V"
            | "F6 V"
            | "K8 V"
            | "K9 V"
            | "K6 V"
            | "G9 V"
            | "G6 V"
            | "G4 VI"
            | "G4 V"
            | "F8 V"
            | "F2 V"
            | "F1 V"
            | "K3 V"
            | "F0 VI"
            | "G1 VI"
            | "G0 VI"
            | "K1 V"
            | "M4 V"
            | "M1 V"
            | "M6 V"
            | "M0 V"
            | "K2 IV"
            | "G2 VI"
            | "K0 V"
            | "K5 IV"
            | "F5 VI"
            | "G6 VI"
            | "F6 VI"
            | "F2 IV"
            | "G3 VI"
            | "M8 V"
            | "F1 VI"
            | "K1 IV"
            | "F7 V"
            | "G5 VI"
            | "M5 V"
            | "G7 VI"
            | "F5 V"
            | "F4 VI"
            | "F8 VI"
            | "K3 IV"
            | "F4 IV"
            | "F0 V"
            | "G7 IV"
            | "G8 VI"
            | "F2 VI"
            | "F4 V"
            | "F7 VI"
            | "F3 V"
            | "G1 V"
            | "G9 VI"
            | "F3 IV"
            | "F9 VI"
            | "M9 V"
            | "K0 IV"
            | "F1 IV"
            | "G4 IV"
            | "F3 VI"
            | "K4 IV"
            | "G5 IV"
            | "G3 IV"
            | "G1 IV"
            | "K7 IV"
            | "G0 IV"
            | "K6 IV"
            | "K9 IV"
            | "G2 IV"
            | "F9 IV"
            | "F0 IV"
            | "K8 IV"
            | "G8 IV"
            | "F6 IV"
            | "F5 IV"
            | "A0"
            | "A0IV"
            | "A0IV2";
          temperature: number;
          type_id: number;
        },
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/stars/${starId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a station --- Alternate route: `/dev/universe/stations/{station_id}/` Alternate route: `/v2/universe/stations/{station_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseStationsStationId
     * @summary Get station information
     * @request GET:/universe/stations/{station_id}/
     * @response `200` `{ max_dockable_ship_volume: number, name: string, office_rental_cost: number, owner?: number, position: { x: number, y: number, z: number }, race_id?: number, reprocessing_efficiency: number, reprocessing_stations_take: number, services: ("bounty-missions" | "assasination-missions" | "courier-missions" | "interbus" | "reprocessing-plant" | "refinery" | "market" | "black-market" | "stock-exchange" | "cloning" | "surgery" | "dna-therapy" | "repair-facilities" | "factory" | "labratory" | "gambling" | "fitting" | "paintshop" | "news" | "storage" | "insurance" | "docking" | "office-rental" | "jump-clone-facility" | "loyalty-point-store" | "navy-offices" | "security-offices")[], station_id: number, system_id: number, type_id: number }` Information about a station
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Station not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseStationsStationId: (
      stationId: number,
      query?: { datasource?: "tranquility" },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          max_dockable_ship_volume: number;
          name: string;
          office_rental_cost: number;
          owner?: number;
          position: { x: number; y: number; z: number };
          race_id?: number;
          reprocessing_efficiency: number;
          reprocessing_stations_take: number;
          services: (
            | "bounty-missions"
            | "assasination-missions"
            | "courier-missions"
            | "interbus"
            | "reprocessing-plant"
            | "refinery"
            | "market"
            | "black-market"
            | "stock-exchange"
            | "cloning"
            | "surgery"
            | "dna-therapy"
            | "repair-facilities"
            | "factory"
            | "labratory"
            | "gambling"
            | "fitting"
            | "paintshop"
            | "news"
            | "storage"
            | "insurance"
            | "docking"
            | "office-rental"
            | "jump-clone-facility"
            | "loyalty-point-store"
            | "navy-offices"
            | "security-offices"
          )[];
          station_id: number;
          system_id: number;
          type_id: number;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/stations/${stationId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description List all public structures --- Alternate route: `/dev/universe/structures/` Alternate route: `/legacy/universe/structures/` Alternate route: `/v1/universe/structures/` --- This route is cached for up to 3600 seconds
     *
     * @tags Universe
     * @name GetUniverseStructures
     * @summary List all public structures
     * @request GET:/universe/structures/
     * @response `200` `(number)[]` List of public structure IDs
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseStructures: (
      query?: { datasource?: "tranquility"; filter?: "market" | "manufacturing_basic" },
      params: RequestParams = {},
    ) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/structures/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns information on requested structure if you are on the ACL. Otherwise, returns "Forbidden" for all inputs. --- Alternate route: `/v2/universe/structures/{structure_id}/` --- This route is cached for up to 3600 seconds
     *
     * @tags Universe
     * @name GetUniverseStructuresStructureId
     * @summary Get structure information
     * @request GET:/universe/structures/{structure_id}/
     * @secure
     * @response `200` `{ name: string, owner_id: number, position?: { x: number, y: number, z: number }, solar_system_id: number, type_id?: number }` Data about a structure
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `401` `Unauthorized` Unauthorized
     * @response `403` `Forbidden` Forbidden
     * @response `404` `{ error?: string }` Structure not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseStructuresStructureId: (
      structureId: number,
      query?: { datasource?: "tranquility"; token?: string },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          name: string;
          owner_id: number;
          position?: { x: number; y: number; z: number };
          solar_system_id: number;
          type_id?: number;
        },
        | void
        | BadRequest
        | Unauthorized
        | Forbidden
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/structures/${structureId}/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the number of jumps in solar systems within the last hour ending at the timestamp of the Last-Modified header, excluding wormhole space. Only systems with jumps will be listed --- Alternate route: `/legacy/universe/system_jumps/` Alternate route: `/v1/universe/system_jumps/` --- This route is cached for up to 3600 seconds
     *
     * @tags Universe
     * @name GetUniverseSystemJumps
     * @summary Get system jumps
     * @request GET:/universe/system_jumps/
     * @response `200` `({ ship_jumps: number, system_id: number })[]` A list of systems and number of jumps
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseSystemJumps: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        { ship_jumps: number; system_id: number }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/system_jumps/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the number of ship, pod and NPC kills per solar system within the last hour ending at the timestamp of the Last-Modified header, excluding wormhole space. Only systems with kills will be listed --- Alternate route: `/v2/universe/system_kills/` --- This route is cached for up to 3600 seconds
     *
     * @tags Universe
     * @name GetUniverseSystemKills
     * @summary Get system kills
     * @request GET:/universe/system_kills/
     * @response `200` `({ npc_kills: number, pod_kills: number, ship_kills: number, system_id: number })[]` A list of systems and number of ship, pod and NPC kills
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseSystemKills: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        { npc_kills: number; pod_kills: number; ship_kills: number; system_id: number }[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/system_kills/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of solar systems --- Alternate route: `/dev/universe/systems/` Alternate route: `/legacy/universe/systems/` Alternate route: `/v1/universe/systems/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseSystems
     * @summary Get solar systems
     * @request GET:/universe/systems/
     * @response `200` `(number)[]` A list of solar system ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseSystems: (query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/systems/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a solar system. --- Alternate route: `/dev/universe/systems/{system_id}/` Alternate route: `/v4/universe/systems/{system_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseSystemsSystemId
     * @summary Get solar system information
     * @request GET:/universe/systems/{system_id}/
     * @response `200` `{ constellation_id: number, name: string, planets?: ({ asteroid_belts?: (number)[], moons?: (number)[], planet_id: number })[], position: { x: number, y: number, z: number }, security_class?: string, security_status: number, star_id?: number, stargates?: (number)[], stations?: (number)[], system_id: number }` Information about a solar system
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Solar system not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseSystemsSystemId: (
      systemId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          constellation_id: number;
          name: string;
          planets?: { asteroid_belts?: number[]; moons?: number[]; planet_id: number }[];
          position: { x: number; y: number; z: number };
          security_class?: string;
          security_status: number;
          star_id?: number;
          stargates?: number[];
          stations?: number[];
          system_id: number;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/systems/${systemId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of type ids --- Alternate route: `/legacy/universe/types/` Alternate route: `/v1/universe/types/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseTypes
     * @summary Get types
     * @request GET:/universe/types/
     * @response `200` `(number)[]` A list of type ids
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseTypes: (query?: { datasource?: "tranquility"; page?: number }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/universe/types/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a type --- Alternate route: `/dev/universe/types/{type_id}/` Alternate route: `/v3/universe/types/{type_id}/` --- This route expires daily at 11:05
     *
     * @tags Universe
     * @name GetUniverseTypesTypeId
     * @summary Get type information
     * @request GET:/universe/types/{type_id}/
     * @response `200` `{ capacity?: number, description: string, dogma_attributes?: ({ attribute_id: number, value: number })[], dogma_effects?: ({ effect_id: number, is_default: boolean })[], graphic_id?: number, group_id: number, icon_id?: number, market_group_id?: number, mass?: number, name: string, packaged_volume?: number, portion_size?: number, published: boolean, radius?: number, type_id: number, volume?: number }` Information about a type
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `404` `{ error?: string }` Type not found
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getUniverseTypesTypeId: (
      typeId: number,
      query?: {
        datasource?: "tranquility";
        language?: "en" | "en-us" | "de" | "fr" | "ja" | "ru" | "zh" | "ko" | "es";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          capacity?: number;
          description: string;
          dogma_attributes?: { attribute_id: number; value: number }[];
          dogma_effects?: { effect_id: number; is_default: boolean }[];
          graphic_id?: number;
          group_id: number;
          icon_id?: number;
          market_group_id?: number;
          mass?: number;
          name: string;
          packaged_volume?: number;
          portion_size?: number;
          published: boolean;
          radius?: number;
          type_id: number;
          volume?: number;
        },
        | void
        | BadRequest
        | { error?: string }
        | ErrorLimited
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/universe/types/${typeId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  wars = {
    /**
     * @description Return a list of wars --- Alternate route: `/dev/wars/` Alternate route: `/legacy/wars/` Alternate route: `/v1/wars/` --- This route is cached for up to 3600 seconds
     *
     * @tags Wars
     * @name GetWars
     * @summary List wars
     * @request GET:/wars/
     * @response `200` `(number)[]` A list of war IDs, in descending order by war_id
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getWars: (query?: { datasource?: "tranquility"; max_war_id?: number }, params: RequestParams = {}) =>
      this.request<
        number[],
        void | BadRequest | ErrorLimited | InternalServerError | ServiceUnavailable | GatewayTimeout
      >({
        path: `/wars/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return details about a war --- Alternate route: `/dev/wars/{war_id}/` Alternate route: `/legacy/wars/{war_id}/` Alternate route: `/v1/wars/{war_id}/` --- This route is cached for up to 3600 seconds
     *
     * @tags Wars
     * @name GetWarsWarId
     * @summary Get war information
     * @request GET:/wars/{war_id}/
     * @response `200` `{ aggressor: { alliance_id?: number, corporation_id?: number, isk_destroyed: number, ships_killed: number }, allies?: ({ alliance_id?: number, corporation_id?: number })[], declared: string, defender: { alliance_id?: number, corporation_id?: number, isk_destroyed: number, ships_killed: number }, finished?: string, id: number, mutual: boolean, open_for_allies: boolean, retracted?: string, started?: string }` Details about a war
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `422` `{ error?: string }` War not found
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getWarsWarId: (warId: number, query?: { datasource?: "tranquility" }, params: RequestParams = {}) =>
      this.request<
        {
          aggressor: { alliance_id?: number; corporation_id?: number; isk_destroyed: number; ships_killed: number };
          allies?: { alliance_id?: number; corporation_id?: number }[];
          declared: string;
          defender: { alliance_id?: number; corporation_id?: number; isk_destroyed: number; ships_killed: number };
          finished?: string;
          id: number;
          mutual: boolean;
          open_for_allies: boolean;
          retracted?: string;
          started?: string;
        },
        | void
        | BadRequest
        | ErrorLimited
        | { error?: string }
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/wars/${warId}/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of kills related to a war --- Alternate route: `/dev/wars/{war_id}/killmails/` Alternate route: `/legacy/wars/{war_id}/killmails/` Alternate route: `/v1/wars/{war_id}/killmails/` --- This route is cached for up to 3600 seconds
     *
     * @tags Wars
     * @name GetWarsWarIdKillmails
     * @summary List kills for a war
     * @request GET:/wars/{war_id}/killmails/
     * @response `200` `({ killmail_hash: string, killmail_id: number })[]` A list of killmail IDs and hashes
     * @response `304` `void` Not modified
     * @response `400` `BadRequest` Bad request
     * @response `420` `ErrorLimited` Error limited
     * @response `422` `{ error?: string }` War not found
     * @response `500` `InternalServerError` Internal server error
     * @response `503` `ServiceUnavailable` Service unavailable
     * @response `504` `GatewayTimeout` Gateway timeout
     */
    getWarsWarIdKillmails: (
      warId: number,
      query?: { datasource?: "tranquility"; page?: number },
      params: RequestParams = {},
    ) =>
      this.request<
        { killmail_hash: string; killmail_id: number }[],
        | void
        | BadRequest
        | ErrorLimited
        | { error?: string }
        | InternalServerError
        | ServiceUnavailable
        | GatewayTimeout
      >({
        path: `/wars/${warId}/killmails/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}
