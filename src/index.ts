import type { RequestInfo, Response } from "node-fetch";
import fetch from "node-fetch";
import crypto from "crypto";

const DATASTORE_API_BASE_ENDPOINT = "https://apis.roblox.com/datastores/v1/universes";

type Params = { 
	[key: string]: string | number | boolean
}

type ParamsKey = keyof Params;

/**
 * 8 bytes
 */
type int64 = number;

/**
 * 4 bytes
 */
type int32 = number;

type ParamsBase = {
	/**
	 * Name of the data store.
	 */
	datastoreName: string,

	/**
	 * Defaults to `global`, similar to Lua API.
	 */
	scope?: string
}

type HeadersBase = {
	/**
	 * API key
	 */
	"x-api-key": string
}

/**
 * Note: You cannot use both matchVersion and exclusiveCreate.
 */
type SetEntryParams = ParamsBase & {
	/**
	 * The key which identifies the entry.
	 */
	entryKey: string,

	/**
	 * Only update if current version matches this. Default: `null`.
	 */
	matchVersion?: string,

	/**
	 * Only create the entry if it does not exist. Default: `false`.
	 */
	exclusiveCreate?: boolean
}

type SetEntryResponse = {
	version: string,
	deleted: boolean,
	contentLength: number,
	createdTime: string,
	objectCreatedTime: string
}

type SetEntryHeaders = HeadersBase & {
	/**
	 * The base-64 encoded MD5 checksum of the content.
	 */
	"content-md5": string,

	/**
	 * Comma-separated list of Roblox user IDs the entry is tagged with. If not provided, existing user IDs are cleared.
	 */
	"roblox-entry-userids": string,

	/**
	 * If not provided, existing attributes are cleared.
	 */
	"roblox-entry-attributes": string
}

type GetEntryParams = ParamsBase & {
	/**
	 * The key which identifies the entry.
	 */
	entryKey: string,
}

type ListEntriesParams = ParamsBase & {
	/**
	 * If true, return keys from all scopes.
	 */
	AllScopes: boolean,

	/**
	 * Return only keys with this prefix.
	 */
	prefix: string,

	/**
	 * Maximum number of items to return.
	 */
	limit: int32,

	/**
	 * Provide to request the next set of data.
	 */
	cursor: string
}

type EntryKey = {
	scope: string,
	key: string
}

type ListEntriesResponse = {
	keys: EntryKey[],
	nextPageCursor: string | null
}

function buildUrl(url: string, params: Params) {
	const urlObj = new URL(url);
	Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key] as keyof ParamsKey));
	return urlObj as unknown as RequestInfo;
}

export class Game {
	public readonly apiKey: string;
	public readonly universeId: number;

	constructor(apiKey: string, universeId: int64) {
		this.apiKey = apiKey;
		this.universeId = universeId;
	}
}

// TODO: Fix updatedTime
export class DataStoreKeyInfo {
	public readonly createdTime!: number;
	//public readonly updatedTime!: number;
	public readonly version!: string;
	
	private readonly userIds!: number[];
	private readonly metadata!: Params;

	constructor(response: Response) {
		const createdTime = response.headers.get("roblox-entry-created-time") as string;
		//const updatedTime = response.headers.get("last-modified") as string;
		const version = response.headers.get("roblox-entry-version") as string;
		const metadata = response.headers.get("roblox-entry-attributes") as string;
		const userIds = response.headers.get("roblox-entry-userids") as string;

		this.createdTime = new Date(createdTime).getTime(); // "0000-00-00T00:00:00.0000000Z" -> 0000000000000
		//this.updatedTime = new Date(updatedTime).getTime(); // "0000-00-00T00:00:00.0000000Z" -> 0000000000000
		this.version = version; // "0000000000000000.0000000000.0000000000000000.00"
		this.userIds = JSON.parse(userIds); // "[]" -> []
		this.metadata = JSON.parse(metadata); // "[]" -> []
	}

	GetUserIds() {
		return this.userIds;
	}

	GetMetadata() {
		return this.metadata;
	}
}

export class DataStoreSetOptions {
	public metadata!: Record<string, string>;

	constructor(metadata: Record<string, string>) {
		this.metadata = metadata;
	}

	GetMetadata() {
		return this.metadata;
	}

	SetMetadata(metadata: Record<string, string>) {
		this.metadata = metadata;
	}
}

export class DataStoreOptions {
	public allScopes = false;
}

export class DataStoreKeyPages {
	/**
	 * Whether or not the current page is the last page available.
	 */
	public isFinished = false;

	private keys!: EntryKey[];
	private params!: ListEntriesParams;
	private readonly rawUrl!: string;
	private readonly headers!: HeadersBase;

	constructor(rawUrl: string, params: ListEntriesParams, headers: HeadersBase) {
		this.rawUrl = rawUrl;
		this.params = params;
		this.headers = headers;
	}

	// NOTE: Should we rename "key" to "keyName", is it worth the overhead?
	async GetCurrentPageAsync() {
		// Have we gotten our first page yet?
		if (!this.params.cursor) {
			// Get the initial/first page
			await this.AdvanceToNextPageAsync();
			return this.keys;
		}
		return this.keys;
	}

	/**
	 * Iterates to the next page in the pages object, if possible.
	 */
	async AdvanceToNextPageAsync() {
		if (this.isFinished) throw Error("Next page was not found");

		const url = buildUrl(this.rawUrl, this.params);
		
		const response = await fetch(url, {
			method: "get",
			headers: this.headers
		});

		if (response.status !== 200) {
			throw Error(`${response.status}: ${response.statusText}`);
		}

		const data = await response.json() as ListEntriesResponse;

		// Update the keys
		this.keys = data.keys;

		if (!data.nextPageCursor) {
			this.isFinished = true;
			return;
		}
		
		// Go to the next page via cursor
		this.params.cursor = data.nextPageCursor;
	}
}

export class DataStore {
	private game: Game;
	private name: string;
	private scope: string;
	private url: string;
	private options: DataStoreOptions;

	/**
	 * Lets you store data that needs to persist between sessions, such as items in a player’s inventory or skill points. Data stores are shared per experience, so any place in an experience, including places on different servers, can access and change the same data.
	 * @param game Game from which DataStore will be retrieved.
	 * @param name Name of the data store.
	 * @param scope A string specifying the scope.
	 */
	constructor(game: Game, name: string, scope = "global", options?: DataStoreOptions) {
		this.game = game;
		this.name = name;
		this.scope = scope;
		this.options = options || new DataStoreOptions();
		this.url = `${DATASTORE_API_BASE_ENDPOINT}/${this.game.universeId}/standard-datastores/datastore`;
	}

	/**
	 * This function returns the latest value of the provided key and a `DataStoreKeyInfo` class. If the key does not exist or if the latest version has been marked as deleted, both return values will be `null`.
	 * @param key The key name for which the value is requested.
	 * @returns The value of the entry in the data store with the given key and a `DataStoreKeyInfo` class that includes the version number, date and time the version was created, and functions to retrieve UserIds and metadata.
	 */
	async GetAsync<T>(key: string): Promise<[T, DataStoreKeyInfo]> {
		if (!key) throw Error("Key cannot be empty");

		const params: GetEntryParams = {
			datastoreName: this.name,
			entryKey: key,
		};

		const url = buildUrl(this.url + "/entries/entry", params);

		const headers: HeadersBase = {
			"x-api-key": this.game.apiKey
		};

		const response = await fetch(url, {
			method: "get",
			headers: headers
		});

		if (response.status !== 200) {
			throw Error(`${response.status}: ${response.statusText}`);
		}

		const data = await response.json() as T;
		return [data, new DataStoreKeyInfo(response)];
	}

	/**
	 * This function sets the latest value, UserIds, and metadata for the given key.
	 * 
	 * **Metadata definitions must always be updated with a value, even if there are no changes to the current value; otherwise the current value will be lost.**
	 * @param key Key name for which the value should be set.
	 * @param value The value that the data store key will be set to.
	 * @param userIds Table of `UserIds`, highly recommended to assist with GDPR tracking/removal.
	 * @param options Class that allows for metadata specification on the key.
	 * @returns The version identifier of the newly created version
	 */
	async SetAsync(key: string, value: unknown, userIds: int64[] = [], options?: DataStoreSetOptions) {
		if (!key) throw Error("Key cannot be empty");
		if (value == undefined || null) throw Error("Value cannot be empty");
		if (!userIds) throw Error("UserIds cannot be empty");

		const url = buildUrl(this.url + "/entries/entry", {
			datastoreName: this.name,
			scope: this.scope,
			entryKey: key,
		} as SetEntryParams);

		let rawValue = "";

		switch (typeof(value)) {
			case "number":
				rawValue = value.toString();
				break;
			case "object":
				rawValue = JSON.stringify(value);
				break;
			case "string":
				rawValue = value;
				break;
			case "boolean":
				rawValue = (value) ? "true" : "false";
				break;
			case "bigint":
				rawValue = value.toString();
				break;
			case "undefined":
				throw Error("Value cannot be undefined");
			case "symbol":
				throw Error("Value cannot be a symbol");
			case "function":
				throw Error("Value cannot be a function");
			default:
				throw Error("Couldn't recognize the type of the given value");
		}

		const dataSizeMB = Buffer.from(rawValue).byteLength / 1e+6;
		if (dataSizeMB >= 4) throw Error("Value cannot be larger than 4MB");

		console.log(userIds, JSON.stringify(userIds));

		const headers: SetEntryHeaders = {
			"x-api-key": this.game.apiKey,
			"content-md5": crypto.createHash("md5").update(rawValue).digest("base64"),
			"roblox-entry-userids": JSON.stringify(userIds),
			"roblox-entry-attributes": (options) ? JSON.stringify(options.GetMetadata()) : ""
		};

		const response = await fetch(url, {
			method: "post",
			headers: headers,
			body: rawValue
		});

		if (response.status !== 200) {
			throw Error(`${response.status}: ${response.statusText}`);
		}

		const data = await response.json() as SetEntryResponse;
		return data.version;
	}

	/**
	 * This function increments the value of a key by the provided amount (both must be integers).
	 * @param key Key name for which the value should be updated.
	 * @param delta Amount to increment the current value by.
	 * @param userIds A table of `UserIds` to associate with the key.
	 * @param options Class that combines multiple additional parameters as custom metadata and allows for future extensibility.
	 * @returns The updated value of the entry in the data store with the given key.
	 */
	async IncrementAsync(key: string, delta: int32, userIds: int64[] = [], options?: DataStoreSetOptions) {
		if (!key) throw Error("Key cannot be empty");
		if (delta == undefined || null) throw Error("Delta cannot be empty");
		if (!userIds) throw Error("UserIds cannot be empty");

		const params = {
			datastoreName: this.name,
			scope: this.scope,
			entryKey: key,
			incrementBy: delta
		};

		const url = buildUrl(this.url + "/entries/entry/increment", params);

		const headers = {
			"x-api-key": this.game.apiKey,
			"roblox-entry-userids": JSON.stringify(userIds),
			"roblox-entry-attributes": (options) ? JSON.stringify(options.GetMetadata()) : ""
		} as HeadersBase; // TODO: Implement specific HeaderType

		const response = await fetch(url, {
			method: "post",
			headers: headers
		});

		if (response.status !== 200) {
			throw Error(`${response.status}: ${response.statusText}`);
		}

		const data = await this.GetAsync(key);
		return data;
	}

	/**
	 * This function marks the specified key as deleted by creating a new "tombstone" version of the key.
	 * @param key Key name to be removed.
	 * @returns The value of the data store prior to deletion and a `DataStoreKeyInfo` class.
	 */
	async RemoveAsync(key: string) {
		if (!key) throw Error("Key cannot be empty");

		const previousData = await this.GetAsync(key);

		const url = buildUrl(this.url + "/entries/entry", {
			datastoreName: this.name,
			scope: this.scope,
			entryKey: key
		});

		const headers: HeadersBase = {
			"x-api-key": this.game.apiKey
		};

		const response = await fetch(url, {
			method: "delete",
			headers: headers
		});

		if (response.status !== 204) {
			throw Error(`${response.status}: ${response.statusText}`);
		}

		return previousData;
	}

	/**
	 * This function returns a `DataStoreKeyPages` object for enumerating through keys of a data store. It accepts an optional `prefix` parameter to only locate keys whose names start with the provided `prefix`.
	 * @param prefix Prefix to use for locating keys.
	 * @param pageSize Number of items to be returned in each page.
	 * @returns A `DataStoreKeyPages` instance that enumerates the keys as DataStoreKey instances.
	 */
	async ListKeysAsync(prefix = "", pageSize: int32 = 50) {
		if (pageSize > 50) throw Error("PageSize cannot be greater than 50");

		const rawUrl = this.url + "/entries";

		const params = {
			datastoreName: this.name,
			scope: this.scope,
			AllScopes: this.options.allScopes,
			limit: pageSize,
			prefix: prefix
		} as ListEntriesParams;

		const headers: HeadersBase = {
			"x-api-key": this.game.apiKey
		};

		return new DataStoreKeyPages(rawUrl, params, headers);
	}
}