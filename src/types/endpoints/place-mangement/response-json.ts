import { int32 } from "../../misc/datatypes.js";

type VersionNumber = {
	/**
	 * Indicates the latest version that was saved and/or published.
	 * 
	 * *Note: Its defined as `int32`, however, this is just a guess
	 * as Roblox has never (at least to my knowledge) defined
	 * what specific type of value the API returns except that its an integer.*
	 */
	versionNumber: int32
}

export type PushVersion = VersionNumber;