import type { int32 } from "../../types/misc/datatypes";
import * as utils from "../../lib/utils";

type PaginationParams<ExtendType> = ExtendType & {
	cursor?: string,
	limit?: int32
}

// TODO: Fix this type to take ResponseData type instead of ItemData type
type PaginationData<ExtendType> = {
	[key: string]: ExtendType[]
} & {
	nextPageCursor: string | null
}

type PaginationHeader<ExtendType> = ExtendType & Record<string, string>;

export class Pages<QueryParams, Headers, ItemData> {
	/**
	 * Whether or not the current page is the last page available.
	 */
	public isFinished = false;

	private keys!: ItemData[];
	private params!: PaginationParams<QueryParams>;
	private readonly keyName!: string;
	private readonly rawUrl!: string;
	private readonly headers!: PaginationHeader<Headers>;

	/*
		Type Structure Help

		QueryParams
		{
			datastoreName: string,
			scope: string,
			AllScopes: boolean,
			limit: string,
			prefix: string,
			cursor: string
		}

		Headers
		{
			x-api-key
		}

		Response Data
		{
			keys: ItemData[],
			nextPageCursor: string | null
		}

		ItemData
		{
			key: string,
			scope: string
		}
	*/

	constructor(keyName: string, rawUrl: string, params: PaginationParams<QueryParams>, headers: PaginationHeader<Headers>) {
		this.rawUrl = rawUrl;
		this.params = params;
		this.headers = headers;
		this.keyName = keyName;
	}

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

		const url = utils.buildUrl(this.rawUrl, this.params);
		
		const response = await fetch(url, {
			method: "get",
			headers: this.headers
		});

		if (response.status !== 200) {
			return Promise.reject({
				status: response.status,
				statusText: response.statusText
			});
		}

		const data = utils.parseJSON(await response.text()) as PaginationData<ItemData>;

		// Update the keys
		const newKeys = data[this.keyName];
		if (newKeys) {
			this.keys = newKeys;
		}

		if (!data.nextPageCursor) {
			this.isFinished = true;
			return;
		}
		
		// Go to the next page via cursor
		this.params.cursor = data.nextPageCursor;
		return;
	}
}
