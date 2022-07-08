// Types
import { int64, int32 } from "../types/misc/datatypes.js";

import type * as DataStoreRequestHeaders from "../types/endpoints/datastore/request-headers.js";
import type * as DataStoreQueryParams from "../types/endpoints/datastore/query-params.js";
import type * as DataStoreResponseJSON from "../types/endpoints/datastore/response-json.js";

import type * as MessagingServiceRequestHeaders from "../types/endpoints/messaging-service/request-headers.js";

// Modules
import * as utils from "../utils.js";
import { Pages } from "./pages.js";

// Config
import {
	DATASTORE_API_BASE_ENDPOINT,
	MESSAGING_SERVICE_API_BASE_ENDPOINT
} from "../config/urls.js";

// Libraries
import fetch from "node-fetch";

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

		return new Pages<DataStoreQueryParams.ListDataStores,
			DataStoreRequestHeaders.ListDataStores,
			DataStoreResponseJSON.DataStoreInfo>("datastores", rawUrl, queryParams, headers);
	}

	/**
	 * This function sends the provided message to all subscribers to the topic,
	 * triggering their registered callbacks to be invoked.
	 * 
	 * Same as MessagingService:PublishAsync()
	 * @param topic Determines where the message is sent.
	 * @param message The data to include in the message.
	 */
	async PublishMessageAsync(topic: string, message: string) {
		utils.mustBeString("Topic", topic);
		utils.mustBeString("Message", message);

		// Disallow the use of non-alphanumeric characters in a topic name (as written in API restrictions)
		if (!topic.match(new RegExp("^[a-zA-Z0-9]*$"))) {
			throw Error("Topic name cannot contain non-alphanumeric characters");
		}

		// Disallow topic name if it contains more than 80 characters (as written in API restrictions)
		if (topic.length > 80) {
			throw Error("Topic name cannot contain more than 80 characters");
		}

		const url = `${MESSAGING_SERVICE_API_BASE_ENDPOINT}/${this.id}/topics/${topic}`;

		const valueJSON = JSON.stringify({
			message: message
		});

		const headers: MessagingServiceRequestHeaders.PublishAsync = {
			"x-api-key": this.apiKey,
			"Content-Type": "application/json"
		};

		const response = await fetch(url, {
			method: "post",
			headers: headers,
			body: valueJSON
		});

		if (response.status !== 200) {
			return Promise.reject({
				status: response.status,
				statusText: response.statusText
			});
		}

		return await response.text(); // If successful, it will return empty response body
	}
}