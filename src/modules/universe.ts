import { int64 } from "../types/misc/datatypes.js";

/**
 * Universe is a collection of places, often referred
 * to as a game or an experience.
 */
export class Universe {
	public readonly id!: int64;
	public readonly apiKey!: string;

	/**
	 * @param id Universe's id. Do not mistake it for place id.
	 * @param apiKey API key; is used to authenticate API calls made to the universe.
	 */
	constructor(id: int64, apiKey: string) {
		this.id = id;
		this.apiKey = apiKey;
	}
}