import { int32 } from "../../misc/datatypes";

type Prefix = {
	/**
	 * Return only data stores with this prefix.
	 */
	prefix?: string
}

type Cursor = {
	/**
	 * Provide to request the next set of data.
	 * 
	 * **The format of cursor strings is not defined. You should not interpret or parse them as they may change at any time.**
	 */
	cursor?: string
}

type Limit = {
	/**
	 * Maximum number of items to return.
	 */
	limit?: int32
}

type DataStoreName = {
	/**
	 * Name of the data store.
	 */
	datastoreName: string
}

type Scope = {
	/**
	 * Defaults to global, similar to Lua API.
	 */
	scope?: string
}

type EntryKey = {
	/**
	 * The key which identifies the entry.
	 * 
	 * *Roblox's documentation does not state whether its required or not, so for now its marked as required.*
	 */
	entryKey: string
}

type MatchVersion = {
	/**
	 * Only update if current version matches this. Default: `null`.
	 */
	matchVersion?: string,
}

type ExclusiveCreate = {
	/**
	 * Only create the entry if it does not exist. Default: `false`.
	 */
	exclusiveCreate?: boolean
}

type IncrementBy = {
	/**
	 * The amount by which the entry should be incremented, or the starting value if it does not exist.
	 */
	incrementBy?: int32
}

type StartTime = {
	/**
	 * Time string in (ISO datetime, UTC) format. Don't consider versions older than this.
	 */
	startTime?: string
}

type EndTime = {
	/**
	 * Time string in (ISO datetime, UTC) format. Don't consider versions younger than this.
	 */
	endTime?: string
}

type SortOrder = {
	/**
	 * Either Ascending (older first) or Descending (younger first).
	 */
	sortOrder?: string
}

type VersionId = {
	/**
	 * The version to inspect.
	 */
	versionId: string
}

type AllScopes = {
	/**
	 * If true, return keys from all scopes.
	 */
	AllScopes?: boolean
}

export type ListDataStores =
	Prefix &
	Limit &
	Cursor;

export type ListEntries =
	DataStoreName &
	Scope &
	AllScopes &
	Prefix &
	Limit &
	Cursor;

export type GetEntry =
	DataStoreName &
	Scope &
	EntryKey;

/**
 * **Note: You cannot use both matchVersion and exclusiveCreate.**
 */
export type SetEntry =
	DataStoreName &
	Scope &
	EntryKey &
	MatchVersion &
	ExclusiveCreate;

export type IncrementEntry =
	DataStoreName &
	Scope &
	EntryKey &
	IncrementBy;

export type DeleteEntry =
	DataStoreName &
	Scope &
	EntryKey;

export type ListEntryVersions =
	Limit &
	Cursor &
	DataStoreName &
	Scope &
	EntryKey &
	StartTime &
	EndTime &
	SortOrder;

export type GetEntryVersion =
	DataStoreName &
	Scope &
	EntryKey &
	VersionId;
	