import type { Constant } from "../Constant.js";
import { globArray } from "../native/Array.js";
import { globBoolean } from "../native/Boolean.js";
import { globBuffer } from "../native/Buffer.js";
import { globFloat } from "../native/Float.js";
import { globInteger } from "../native/Integer.js";
import { globObject } from "../native/Object.js";
import { globString } from "../native/String.js";
import { globTimestamp } from "../native/Timestamp.js";
import { globAN } from "../native/notation/AN.js";
import { globIP } from "../native/notation/IP.js";
import { globJSON } from "../native/notation/JSON.js";

export const constants: [string, Record<string, Constant>][] = [
	["Array", globArray],
	["Boolean", globBoolean],
	["Buffer", globBuffer],
	["Float", globFloat],
	["Integer", globInteger],
	["Object", globObject],
	["String", globString],
	["Timestamp", globTimestamp],
	["AN", globAN],
	["IP", globIP],
	["JSON", globJSON],
];
