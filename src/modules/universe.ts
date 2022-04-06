// Types
import { int64, int32 } from "../types/misc/datatypes.js";

import type * as DataStoreRequestHeaders from "../types/endpoints/datastore/request-headers.js";
import type * as DataStoreQueryParams from "../types/endpoints/datastore/query-params.js";
import type * as DataStoreResponseJSON from "../types/endpoints/datastore/response-json.js";

// Modules
import * as utils from "../utils.js";
import { Pages } from "./pages.js";

// Config
import { DATASTORE_API_BASE_ENDPOINT } from "../config/urls.js";

/**
 * Universe is a collection of places, often referred
 * to as a game or an experience.
 */
export class Universe {
	public readonly id!: int64;
	public readonly apiKey!: string;

	/**
	 * @param id Universe's id. Do not mistake it for place id.
	 * @param apiKey API key; is used to authenticate API calls made to the universe.
	 */
	constructor(id: int64, apiKey: string) {
		this.id = id;
		this.apiKey = apiKey;
	}

	/**
	 * Returns a `DataStoreListingPages` class for enumerating through all of the universe's data stores.
	 * It accepts an optional prefix parameter to only locate data stores whose names start with the provided prefix.
	 * @param prefix Prefix to enumerate data stores that start with the given prefix.
	 * @param pageSize Number of items to be returned in each page.
	 * @returns `DataStoreListingPages` class containing `DataStoreInfo` objects that provide details such as name, creation time, ~~and time last updated~~.
	 */
	async ListDataStoresAsync(prefix = "", pageSize: int32 = 50) {
		utils.mustBeString("Prefix", prefix);
		utils.mustBeInteger("PageSize", pageSize);
		if (pageSize > 50) throw Error("PageSize cannot be greater than 50");

		const rawUrl = `${DATASTORE_API_BASE_ENDPOINT}/${this.id}/standard-datastores`;

		const queryParams: DataStoreQueryParams.ListDataStores = {
			limit: pageSize,
			prefix: prefix
		};

		const headers: DataStoreRequestHeaders.ListDataStores = {
			"x-api-key": this.apiKey
		};

		return new Pages<DataStoreQueryParams.ListDataStores, DataStoreRequestHeaders.ListDataStores, DataStoreResponseJSON.DataStoreInfo>("datastores", rawUrl, queryParams, headers);
	}
}