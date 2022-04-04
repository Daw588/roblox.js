import { int32 } from "../../misc/datatypes.js";

export type EntryVersionInfo = {
	version: string,
	deleted: boolean,
	contentLength: int32,
	createdTime: string,
	objectCreatedTime: string
}

export type DataStoreInfo = {
	name: string,
	createdTime: string
}

export type EntryKeyInfo = {
	scope: string,
	key: string
}

export type EntryValue = {
	[key: string]: string | number | boolean | EntryValue
}

export type ListDataStores = {
	datastores: DataStoreInfo[],
	nextPageCursor: string | null
}

export type ListEntries = {
	keys: EntryKeyInfo[],
	nextPageCursor: string | null
}

export type GetEntry = EntryValue;

export type ListEntryVersions = {
	versions: EntryVersionInfo[],
	nextPageCursor: string | null
}