import type {
	ContentLength,
	ContentMD5,
	LastModified,
	RobloxEntryAttributes,
	RobloxEntryCreatedTime,
	RobloxEntryUserIds,
	RobloxEntryVersion,
	XApiKey
} from "./headers.js";

export type ListDataStores =
	XApiKey;

export type ListEntries =
	XApiKey;

export type GetEntry =
	XApiKey;

export type SetEntry =
	XApiKey &
	RobloxEntryUserIds &
	RobloxEntryAttributes &
	ContentMD5;

export type IncrementEntry =
	XApiKey &
	RobloxEntryUserIds &
	RobloxEntryAttributes &
	ContentMD5 &
	ContentLength &
	RobloxEntryVersion &
	RobloxEntryCreatedTime &
	LastModified;

export type DeleteEntry =
	XApiKey;

export type ListEntryVersions =
	XApiKey;

export type GetEntryVersion =
	XApiKey;