import { Universe } from "./universe";
import * as raw from "../cloud/ordered-data-store";

type DataStoreListingInfo = {
	universe: Universe,
	name: string,
	scope: string,
	ascending: boolean,
	pageSize: number
}

export class DataStorePages {
	private entries: {
		path: string;
		value: number;
		id: string;
	}[];

	private readonly info: DataStoreListingInfo;
	private nextPageToken: string;
	public IsFinished: boolean;

	public constructor(info: DataStoreListingInfo, data: raw.ListReturn) {
		this.info = info;
		this.entries = data.entries;
		this.nextPageToken = data.nextPageToken;
		this.IsFinished = this.nextPageToken === "";
	}

	public GetCurrentPage() {
		return this.entries.map(v => {
			return {
				key: v.id,
				value: v.value
			};
		});
	}

	public async AdvanceToNextPageAsync() {
		if (this.IsFinished) return;
		
		const response = await raw.listEntries({
			xApiKey: this.info.universe.apiKey,
			universeId: this.info.universe.id.toString(),
			orderedDataStore: this.info.name,
			scope: this.info.scope,
			orderBy: this.info.ascending ? "asc" : "desc",
			maxPageSize: this.info.pageSize,
			pageToken: this.nextPageToken
		});

		this.entries = response.entries;
		this.nextPageToken = response.nextPageToken;
		this.IsFinished = this.nextPageToken === "";
	}
}

export class OrderedDataStore {
	public readonly universe: Universe;
	private readonly name: string;
	private readonly scope: string;

	public constructor(universe: Universe, name: string, scope = "global") {
		this.universe = universe;
		this.name = name;
		this.scope = scope;
	}

	public async GetSortedAsync(ascending: boolean, pageSize: number) {
		const data = await raw.listEntries({
			xApiKey: this.universe.apiKey,
			universeId: this.universe.id.toString(),
			orderedDataStore: this.name,
			scope: this.scope,
			orderBy: ascending ? "asc" : "desc",
			maxPageSize: pageSize,
		});

		const info: DataStoreListingInfo = {
			universe: this.universe,
			name: this.name,
			scope: this.scope,
			ascending,
			pageSize
		};
		
		return new DataStorePages(info, data);
	}

	public async SetAsync(key: string, value: number) {
		await raw.updateEntry({
			xApiKey: this.universe.apiKey,
			universeId: this.universe.id.toString(),
			orderedDataStore: this.name,
			scope: this.scope,
			entry: key,
			value,
			allowMissing: true
		});
	}

	public async GetAsync(key: string) {
		const data = await raw.getEntry({
			xApiKey: this.universe.apiKey,
			universeId: this.universe.id.toString(),
			orderedDataStore: this.name,
			scope: this.scope,
			entry: key
		});
		
		return data.value;
	}

	public async RemoveAsync(key: string) {
		await raw.deleteEntry({
			xApiKey: this.universe.apiKey,
			universeId: this.universe.id.toString(),
			orderedDataStore: this.name,
			scope: this.scope,
			entry: key
		});
	}

	public async UpdateAsync(
		key: string,
		transformFunction: (currentValue: number) => number | undefined | null | void
	): Promise<number | void> {
		const getResponse = await raw.getEntry({
			xApiKey: this.universe.apiKey,
			universeId: this.universe.id.toString(),
			orderedDataStore: this.name,
			scope: this.scope,
			entry: key,
		});
		
		const returnedValue = transformFunction(getResponse.value);
		if (typeof(returnedValue) === "number") {
			const updateResponse = await raw.updateEntry({
				xApiKey: this.universe.apiKey,
				universeId: this.universe.id.toString(),
				orderedDataStore: this.name,
				scope: this.scope,
				entry: key,
				value: returnedValue,
				allowMissing: false
			});

			return updateResponse.value;
		}
	}

	public async IncrementAsync(key: string, delta: number) {
		const data = await raw.incrementEntry({
			xApiKey: this.universe.apiKey,
			universeId: this.universe.id.toString(),
			orderedDataStore: this.name,
			scope: this.scope,
			entry: key,
			amount: delta
		});
		
		return data.value;
	}
}
