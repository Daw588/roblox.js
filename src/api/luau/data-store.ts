import type { int32, int64 } from "../../types/misc/datatypes";
import type { SortDirection } from "../../types/misc/custom";

import type * as RequestHeaders from "../../types/endpoints/datastore/request-headers";
import type * as QueryParams from "../../types/endpoints/datastore/query-params";
import type * as ResponseJSON from "../../types/endpoints/datastore/response-json";

import { Pages } from "./pages";
import { Universe } from "../../index";
import * as utils from "../../lib/utils";

import { DATA_STORE } from "../../config/urls";

// TODO: Fix updatedTime
export class DataStoreKeyInfo {
	public readonly createdTime!: number;
	//public readonly updatedTime!: number;
	public readonly version!: string;
	
	private readonly userIds!: number[];
	private readonly metadata!: utils.Params;

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

/**
 * Lets you store data that needs to persist between sessions,
 * such as items in a player's inventory or skill points. DataStores
 * are shared per experience, so any place in an experience, including
 * places on different servers, can access and change the same data.
 */
export class DataStore {
	public readonly universe: Universe;
	public readonly name: string;
	public readonly scope: string;
	public readonly options: DataStoreOptions;

	private readonly url: string;

	/**
	 * @param universe Universe from which DataStore will be retrieved.
	 * @param name Name of the data store.
	 * @param scope A string specifying the scope.
	 */
	constructor(universe: Universe, name: string, scope = "global", options?: DataStoreOptions) {
		this.universe = universe;
		this.name = name;
		this.scope = scope;
		this.options = options || new DataStoreOptions();
		this.url = `${DATA_STORE}/${this.universe.id}/standard-datastores/datastore`;
	}

	/**
	 * This function returns the latest value of the provided key and a `DataStoreKeyInfo` class.
	 * If the key does not exist or if the latest version has been marked as deleted, both return values will be `null`.
	 * @param key The key name for which the value is requested.
	 * @returns The value of the entry in the data store with the given key and a `DataStoreKeyInfo`
	 * class that includes the version number, date and time the version was created, and functions to retrieve UserIds and metadata.
	 */
	async GetAsync<CustomDataType>(key: string): Promise<[CustomDataType, DataStoreKeyInfo]> {
		utils.mustBeString("Key", key);

		const queryParams: QueryParams.GetEntry = {
			datastoreName: this.name,
			entryKey: key,
		};

		const url = utils.buildUrl(this.url + "/entries/entry", queryParams);

		const headers: RequestHeaders.GetEntry = {
			"x-api-key": this.universe.apiKey
		};

		const response = await fetch(url, {
			method: "get",
			headers: headers
		});

		if (response.status !== 200) {
			return Promise.reject({
				status: response.status,
				statusText: response.statusText
			});
		}

		const data = utils.parseJSON(await response.text()) as CustomDataType;
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
	async SetAsync<CustomDataType>(key: string, value: CustomDataType, userIds: int64[] = [], options?: DataStoreSetOptions) {
		utils.mustBeString("Key", key);
		if (value == undefined || null) throw Error("Value cannot be empty");

		const queryParams: QueryParams.SetEntry = {
			datastoreName: this.name,
			scope: this.scope,
			entryKey: key,
		};

		const url = utils.buildUrl(this.url + "/entries/entry", queryParams);

		const valueJSON = JSON.stringify(value);

		// Possibly not accurate, but should prevent files from hitting the size limit
		const dataSizeMB = Buffer.from(valueJSON).byteLength / 1e+6;
		if (dataSizeMB >= 4) throw Error("Value cannot be larger than 4MB");

		const headers: RequestHeaders.SetEntry = {
			"x-api-key": this.universe.apiKey,
			"content-md5": utils.checksum(valueJSON),
			"roblox-entry-userids": JSON.stringify(userIds),
			"roblox-entry-attributes": (options) ? JSON.stringify(options.GetMetadata()) : ""
		};

		const response = await fetch(url, {
			method: "post",
			headers: headers,
			body: valueJSON // Must be in JSON format
		});

		if (response.status !== 200) {
			return Promise.reject({
				status: response.status,
				statusText: response.statusText
			});
		}

		const data = utils.parseJSON(await response.text()) as ResponseJSON.EntryVersionInfo;
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
	async IncrementAsync<CustomDataType>(key: string, delta: int32, userIds: int64[] = [], options?: DataStoreSetOptions) {
		utils.mustBeString("Key", key);
		utils.mustBeInteger("Delta", delta);

		const queryParams: QueryParams.IncrementEntry = {
			datastoreName: this.name,
			scope: this.scope,
			entryKey: key,
			incrementBy: delta
		};

		const url = utils.buildUrl(this.url + "/entries/entry/increment", queryParams);

		const headers: RequestHeaders.IncrementEntry = {
			"x-api-key": this.universe.apiKey,
			"roblox-entry-userids": JSON.stringify(userIds),
			"roblox-entry-attributes": (options) ? JSON.stringify(options.GetMetadata()) : ""
		};

		const response = await fetch(url, {
			method: "post",
			headers: headers
		});

		if (response.status !== 200) {
			return Promise.reject({
				status: response.status,
				statusText: response.statusText
			});
		}

		const data = await this.GetAsync<CustomDataType>(key);
		return data;
	}

	/**
	 * This function marks the specified key as deleted by creating a new "tombstone" version of the key.
	 * @param key Key name to be removed.
	 * @returns The value of the data store prior to deletion and a `DataStoreKeyInfo` class.
	 */
	async RemoveAsync(key: string) {
		utils.mustBeString("Key", key);

		const previousData = await this.GetAsync(key);

		const queryParams: QueryParams.DeleteEntry = {
			datastoreName: this.name,
			scope: this.scope,
			entryKey: key
		};

		const url = utils.buildUrl(this.url + "/entries/entry", queryParams);

		const headers: RequestHeaders.DeleteEntry = {
			"x-api-key": this.universe.apiKey
		};

		const response = await fetch(url, {
			method: "delete",
			headers: headers
		});

		if (response.status !== 204) {
			return Promise.reject({
				status: response.status,
				statusText: response.statusText
			});
		}

		return previousData;
	}

	/**
	 * This function returns a `DataStoreKeyPages` object for enumerating through keys of a data store.
	 * It accepts an optional `prefix` parameter to only locate keys whose names start with the provided `prefix`.
	 * @param prefix Prefix to use for locating keys.
	 * @param pageSize Number of items to be returned in each page.
	 * @returns A `DataStoreKeyPages` instance that enumerates the keys as DataStoreKey instances.
	 */
	async ListKeysAsync(prefix = "", pageSize: int32 = 50) {
		utils.mustBeString("Prefix", prefix);
		utils.mustBeInteger("PageSize", pageSize);
		if (pageSize > 50) throw Error("PageSize cannot be greater than 50");

		const rawUrl = this.url + "/entries";

		const queryParams: QueryParams.ListEntries = {
			datastoreName: this.name,
			scope: this.scope,
			AllScopes: this.options.allScopes,
			limit: pageSize,
			prefix: prefix
		};

		const headers: RequestHeaders.ListEntries = {
			"x-api-key": this.universe.apiKey
		};

		// TODO: Create class that extends Pages class, so that this line can be used: new DataStoreKeyPages(rawUrl, queryParams, headers);
		return new Pages<QueryParams.ListEntries, RequestHeaders.ListEntries, ResponseJSON.EntryKeyInfo>("keys", rawUrl, queryParams, headers);
	}

	/**
	 * This function enumerates versions of the specified key in either ascending or descending order specified by a SortDirection parameter.
	 * It can optionally filter the returned versions by minimum and maximum timestamp.
	 * @param key Key name for the versions to list.
	 * @param sortDirection Sort order of the versions.
	 * @param minDate Date after which the versions should be listed.
	 * @param maxDate Date up to which the versions should be listed.
	 * @param pageSize Number of items to be returned in each page.
	 * @returns A `DataStoreVersionPages` class that enumerates all the versions of the key as `DataStoreObjectVersionInfo` classes.
	 */
	async ListVersionsAsync(key: string, sortDirection: SortDirection = "Ascending", minDate: int64 = 0, maxDate: int64 = 0, pageSize: int32 = 50) {
		utils.mustBeString("Key", key);
		utils.mustBeString("SortDirection", sortDirection);
		utils.mustBeInteger("MinDate", minDate);
		utils.mustBeInteger("MaxDate", maxDate);
		utils.mustBeInteger("PageSize", pageSize);
		if (sortDirection !== "Ascending" && sortDirection !== "Descending") {
			throw Error("SortDirection must be either Ascending or Descending");
		}

		const rawUrl = this.url + "/entries/entry/versions";

		const queryParams: QueryParams.ListEntryVersions = {
			datastoreName: this.name,
			scope: this.scope,
			entryKey: key,
			sortOrder: sortDirection,
			limit: pageSize
		};

		if (minDate !== 0) queryParams.startTime = new Date(minDate).toISOString();
		if (maxDate !== 0) queryParams.endTime =  new Date(maxDate).toISOString();

		const headers: RequestHeaders.ListEntryVersions = {
			"x-api-key": this.universe.apiKey
		};

		return new Pages<QueryParams.ListEntryVersions, RequestHeaders.ListEntryVersions, ResponseJSON.EntryVersionInfo>("versions", rawUrl, queryParams, headers);
	}

	/**
	 * This function retrieves the specified key version as well as a `DataStoreKeyInfo` instance.
	 * @param key Key name for which the version info is requested.
	 * @param version Version number of the key for which the version info is requested.
	 * @returns The value of the entry in the data store with the given key and a `DataStoreKeyInfo`
	 * class that includes the version number, date and time the version was created, and functions to retrieve UserIds and metadata.
	 */
	async GetVersionAsync<CustomDataType>(key: string, version: string) {
		utils.mustBeString("Key", key);
		utils.mustBeString("Version", version);

		const queryParams: QueryParams.GetEntryVersion = {
			datastoreName: this.name,
			entryKey: key,
			versionId: version
		};

		const url = utils.buildUrl(this.url + "/entries/entry/versions/version", queryParams);

		const headers: RequestHeaders.GetEntryVersion = {
			"x-api-key": this.universe.apiKey
		};

		const response = await fetch(url, {
			method: "get",
			headers: headers
		});

		if (response.status !== 200) {
			return Promise.reject({
				status: response.status,
				statusText: response.statusText
			});
		}

		const data = utils.parseJSON(await response.text()) as CustomDataType;
		return [data, new DataStoreKeyInfo(response)];
	}
}
