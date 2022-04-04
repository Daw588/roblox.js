export type XApiKey = {
	/**
	 * The API key
	 */
	"x-api-key": string
}

export type RobloxEntryCreatedTime = {
	/**
	 * The (ISO datetime, UTC) time at which the entry was created.
	 * @example "2022-02-02T23:30:06.5388799Z"
	 */
	"roblox-entry-created-time"?: string
}

export type RobloxEntryVersion = {
	/**
	 * Version of the entry being read.
	 * @example "08D9E6A3F2188CFF.0000000009.08D9E6DF74AC5F42.01"
	 */
	"roblox-entry-version"?: string
}

export type RobloxEntryAttributes = {
	/**
	 * Custom metadata in JSON format.
	 * @example "{}"
	 */
	"roblox-entry-attributes"?: string
}

export type RobloxEntryUserIds = {
	/**
	 * Array of UserIds. (JSON array of numbers).
	 * @example "[269323]"
	 */
	"roblox-entry-userids"?: string
}

export type LastModified = {
	/**
	 * The (ISO datetime, UTC) time at which this particular version was created.
	 * @example "2022-02-02T23:30:06.5388799Z"
	 */
	"last-modified"?: string
}

export type ContentMD5 = {
	/**
	 * The base-64 encoded MD5 checksum of the content.
	 * @example "zuYxEhwuySMvOi8CitXImw=="
	 */
	"content-md5"?: string
}

export type ContentLength = {
	/**
	 * The content length in bytes.
	 * @example "83"
	 */
	"contentLength"?: string
}

export type DateHeader = {
	/**
	 * @example "Thu, 03 Feb 2022 05:32:09 GMT"
	 */
	"date"?: string
}

export type ContentType = {
	/**
	 * @example "application/json; charset=utf-8"
	 */
	"content-type"?: string
}

export type RobloxEntryVersionCreatedTime = {
	/**
	 * @example "2022-02-02T23:30:06.5388799Z"
	 */
	"roblox-entry-version-created-time"?: string
}