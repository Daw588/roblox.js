// Types
import type { int64 } from "../types/misc/datatypes.js";

import type * as RequestHeaders from "../types/endpoints/place-mangement/request-headers.js";
import type * as QueryParams from "../types/endpoints/place-mangement/query-params.js";
import type * as ResponseJSON from "../types/endpoints/place-mangement/response-json.js";

// Modules
import { Universe } from "../index.js";
import * as utils from "../utils.js";

// Libraries
import fetch from "node-fetch";
import fs from "fs/promises";

// Config
import { PLACE_MANAGEMENT_API_BASE_ENDPOINT } from "../config/urls.js";

/**
 * Place is a collection of environmental building blocks,
 * models, scripts, UI, game logic, and everything else related
 * to the game's experience.
 */
export class Place {
	public readonly universe!: Universe;
	public readonly id!: int64;

	private readonly url!: string;

	/**
	 * @param universe Refers to the universe to which place belongs to.
	 * @param id Place's id.
	 */
	constructor(universe: Universe, id: int64) {
		this.universe = universe;
		this.id = id;
		this.url = `${PLACE_MANAGEMENT_API_BASE_ENDPOINT}/${this.universe.id}/places/${this.id}`;
	}

	/**
	 * Uploads the place file via desired method to Roblox.
	 * @param path Path to the place file.
	 * @returns The latest version that was saved and/or published.
	 */
	private async PushVersion(path: string, versionType: "Saved" | "Published") {
		utils.mustBeString("Path", path);
		utils.mustBeString("VersionType", versionType);

		try {
			await fs.access(path);
		} catch (e) {
			throw Error("Place file either does not exist, or there is something restricting the access to it");
		}
	
		const fileInfo = await fs.stat(path);
		
		const fileSizeInBytes = fileInfo.size;
		const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
	
		// Note: The file size limit might change at anytime, so please report if there is a change to it
		if (fileSizeInMegabytes >= 100) {
			throw Error("Place file cannot be larger than 100MB");
		}
	
		const fileData = await fs.readFile(path);
	
		const queryParams: QueryParams.PushVersion = {
			versionType: versionType
		};
	
		const url = utils.buildUrl(this.url + "/versions", queryParams);
	
		const headers: RequestHeaders.PushVersion = {
			"x-api-key": this.universe.apiKey,
			"Content-Type": "application/octet-stream"
		};
	
		const response = await fetch(url, {
			method: "post",
			headers: headers,
			body: fileData
		});
	
		if (response.status !== 200) {
			return Promise.reject({
				status: response.status,
				statusText: response.statusText
			});
		}
	
		const data = utils.parseJSON(await response.text()) as ResponseJSON.PushVersion;
		return data.versionNumber;
	}

	/**
	 * Uploads and saves the place file to Roblox.
	 * 
	 * **Changes caused by this function will be
	 * only visible to the developers.**
	 * 
	 * @param path Path to the place file.
	 * @returns The latest version that was saved.
	 */
	public async SaveAs(path: string) {
		return this.PushVersion(path, "Saved");
	}

	/**
	 * Uploads, saves, and publishes the place file to Roblox.
	 * 
	 * **Changes caused by this function will be
	 * visible to both players and the developers.**
	 * 
	 * @param path Path to the place file.
	 * @returns The latest version that was saved and published.
	 */
	public async PublishAs(path: string) {
		return this.PushVersion(path, "Published");
	}
}