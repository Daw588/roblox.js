import type { RequestInfo } from "node-fetch";

import crypto from "crypto";

export type Params = { 
	[key: string]: string | number | boolean
}

export type ParamsKey = keyof Params;

export function buildUrl(url: string, params: Params) {
	const urlObj = new URL(url);
	Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key] as keyof ParamsKey));
	return urlObj as unknown as RequestInfo;
}

export function checksum(value: crypto.BinaryLike) {
	return crypto.createHash("md5").update(value).digest("base64");
}

export function mustBeInteger(what: string, value: number) {
	if (typeof(value) !== "number" || !Number.isInteger(value)) {
		throw Error(`${what} must be an integer`);
	}
}

export function mustBeString(what: string, value: string) {
	if (typeof(value) !== "string") {
		throw Error(`${what} must be a string`);
	}
}