import crypto from "node:crypto";

export type Params = { 
	[key: string]: string | number | boolean
}

export type ParamsKey = keyof Params;

export function buildUrl(url: string, params: Params) {
	const urlObj = new URL(url);
	Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key] as keyof ParamsKey));
	return urlObj;
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

export function replaceOnceAfter(str: string, search: string, replace: string, afterIndex: number) {
	return str.slice(0, afterIndex) + str.slice(afterIndex).replace(search, replace);
}

export function parseJSON(text: string) {
	/*
		Replace all Roblox's inf values with 1e500
		to represent JavaScript's Infinity value,
		otherwise JSON errors will be thrown at us.
	*/
	let insideQuotes = false;
	for (let i = 0; i < text.length; i++) {
		// Make sure to catch every inf that is outside of quotes
		if (text[i] === "i" && text[i + 1] === "n" && text[i + 2] === "f" && !insideQuotes) {
			// Replace inf with 1e500
			text = replaceOnceAfter(text, "inf", "1e500", i);
		} else if (text[i - 1] !== "\\" && text[i] === "\"") {
			insideQuotes = !insideQuotes;
		}
	}
	
	// Return parsed JSON
	return JSON.parse(text);
}
