import * as http from "../../lib/http";

import { ORDERED_DATA_STORE } from "../../config/urls";

type ListObject = {
	xApiKey: string,
	universeId: string,
	orderedDataStore: string,
	scope: string,
	maxPageSize?: number,
	pageToken?: string,
	orderBy?: "asc" | "desc",
	filter?: string
}

export type ListReturn = {
	entries: {
		path: string,
		value: number,
		id: string
	}[],
	nextPageToken: string
}

/**
 * Returns a list of entries from an ordered data store.
 */
export async function listEntries({
	xApiKey,
	universeId,
	orderedDataStore,
	scope,
	maxPageSize,
	pageToken,
	orderBy,
	filter
}: ListObject) {
	const response = await http.request({
		url: `${ORDERED_DATA_STORE}/v1/universes/${universeId}/orderedDataStores/${orderedDataStore}/scopes/${scope}/entries`,
		method: "GET",
		headers: {
			"x-api-key": xApiKey
		},
		query: {
			max_page_size: maxPageSize,
			page_token: pageToken,
			order_by: orderBy,
			filter: filter
		}
	});

	return await response.json() as ListReturn;
}

/*
type CreateObject = {
	xApiKey: string,
	universeId: string,
	orderedDataStore: string,
	scope: string,
	id: string,
	value: number
}

export type CreateReturn = {
	path: string,
	id: string,
	value: number
}

Creates a new entry with the content value provided.
export async function createEntry({
	xApiKey,
	universeId,
	orderedDataStore,
	scope,
	id,
	value
}: CreateObject) {
	const response = await http.request({
		url: `${ORDERED_DATA_STORE}/v1/universes/${universeId}/orderedDataStores/${orderedDataStore}/scopes/${scope}/entries`,
		method: "POST",
		headers: {
			"x-api-key": xApiKey,
			"Content-Type": "application/json"
		},
		query: {
			id
		},
		body: JSON.stringify({
			value
		})
	});

	return await response.json() as CreateReturn;
}
*/

type GetObject = {
	xApiKey: string,
	universeId: string,
	orderedDataStore: string,
	scope: string,
	entry: string
}

export type GetReturn = {
	path: string,
	id: string,
	value: number
}

/**
 * Gets and returns the specified entry.
 */
export async function getEntry({
	xApiKey,
	universeId,
	orderedDataStore,
	scope,
	entry
}: GetObject) {
	const response = await http.request({
		url: `${ORDERED_DATA_STORE}/v1/universes/${universeId}/orderedDataStores/${orderedDataStore}/scopes/${scope}/entries/${entry}`,
		method: "GET",
		headers: {
			"x-api-key": xApiKey
		},
		query: {}
	});

	return await response.json() as GetReturn;
}

type DeleteObject = {
	xApiKey: string,
	universeId: string,
	orderedDataStore: string,
	scope: string,
	entry: string
}

/**
 * Deletes the specified entry.
 */
export async function deleteEntry({
	xApiKey,
	universeId,
	orderedDataStore,
	scope,
	entry
}: DeleteObject) {
	await http.request({
		url: `${ORDERED_DATA_STORE}/v1/universes/${universeId}/orderedDataStores/${orderedDataStore}/scopes/${scope}/entries/${entry}`,
		method: "DELETE",
		headers: {
			"x-api-key": xApiKey
		},
		query: {}
	});
}

type UpdateObject = {
	xApiKey: string,
	universeId: string,
	orderedDataStore: string,
	scope: string,
	entry: string,
	value: number,
	/**
	 * The flag to allow the creation of an entry if the entry doesn't exist.
	 */
	allowMissing: boolean
}

export type UpdateReturn = {
	path: string,
	id: string,
	value: number
}

/**
 * Updates an entry value and returns the updated entry.
 */
export async function updateEntry({
	xApiKey,
	universeId,
	orderedDataStore,
	scope,
	entry,
	value,
	allowMissing
}: UpdateObject) {
	const response = await http.request({
		url: `${ORDERED_DATA_STORE}/v1/universes/${universeId}/orderedDataStores/${orderedDataStore}/scopes/${scope}/entries/${entry}`,
		method: "PATCH",
		headers: {
			"x-api-key": xApiKey,
			"Content-Type": "application/json"
		},
		query: {
			allow_missing: allowMissing
		},
		body: JSON.stringify({
			value
		})
	});

	return await response.json() as UpdateReturn;
}

type IncrementObject = {
	xApiKey: string,
	universeId: string,
	orderedDataStore: string,
	scope: string,
	entry: string,

	/**
	 * The amount to increment by the entry value.
	 * If the input value exceeds the maximum value
	 * supported by int64,which is 9,223,372,036,854,775,807,
	 * the request fails with a 400 Bad Request error.
	 */
	amount: number,
}

export type IncrementReturn = {
	path: string,
	id: string,
	value: number
}

/**
 * Updates an entry value and returns the updated entry.
 */
export async function incrementEntry({
	xApiKey,
	universeId,
	orderedDataStore,
	scope,
	entry,
	amount
}: IncrementObject) {
	const response = await http.request({
		url: `${ORDERED_DATA_STORE}/v1/universes/${universeId}/orderedDataStores/${orderedDataStore}/scopes/${scope}/entries/${entry}:increment`,
		method: "POST",
		headers: {
			"x-api-key": xApiKey,
			"Content-Type": "application/json"
		},
		query: {},
		body: JSON.stringify({
			amount
		})
	});

	return await response.json() as IncrementReturn;
}
