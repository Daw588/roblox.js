import type {
	ContentLength,
	ContentMD5,
	RobloxEntryAttributes,
	RobloxEntryCreatedTime,
	RobloxEntryUserIds,
	RobloxEntryVersion,
	DateHeader,
	ContentType,
	RobloxEntryVersionCreatedTime
} from "./headers";

export type ListDataStores =
	DateHeader &
	ContentType &
	ContentLength;

export type ListEntries =
	DateHeader &
	ContentType &
	ContentLength;

export type GetEntry =
	DateHeader &
	ContentType &
	ContentLength &
	ContentMD5 &
	RobloxEntryVersion &
	RobloxEntryCreatedTime &
	RobloxEntryVersionCreatedTime &
	RobloxEntryUserIds;

export type SetEntry =
	DateHeader &
	ContentType &
	ContentLength;

export type IncrementEntry =
	DateHeader &
	ContentType &
	ContentLength &
	ContentMD5 &
	RobloxEntryVersion &
	RobloxEntryCreatedTime &
	RobloxEntryVersionCreatedTime &
	RobloxEntryUserIds;

export type DeleteEntry =
	DateHeader;

export type ListEntryVersions =
	DateHeader &
	ContentType &
	ContentLength &
	ContentMD5 &
	RobloxEntryVersion &
	RobloxEntryCreatedTime &
	RobloxEntryVersionCreatedTime &
	RobloxEntryUserIds;

export type GetEntryVersion =
	DateHeader &
	ContentType &
	ContentLength &
	ContentMD5 &
	RobloxEntryVersion &
	RobloxEntryCreatedTime &
	RobloxEntryVersionCreatedTime &
	RobloxEntryAttributes &
	RobloxEntryUserIds;
