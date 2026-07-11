import { Constant } from "./Constant.js";
import { constArray } from "./native/Array.js";
import { constBoolean } from "./native/Boolean.js";
import { constBuffer } from "./native/Buffer.js";
import { constInteger } from "./native/Integer.js";
import { constFloat } from "./native/Float.js";
import { constObject } from "./native/Object.js";
import { constString } from "./native/String.js";
import { constTimestamp } from "./native/Timestamp.js";
import { constAN } from "./native/notation/AN.js";
import { constJSON } from "./native/notation/JSON.js";

export const Constants: [string, Record<string, Constant>][] = [
	["Array", constArray],
	["Boolean", constBoolean],
	["Buffer", constBuffer],
	["Float", constFloat],
	["Integer", constInteger],
	["Object", constObject],
	["String", constString],
	["Timestamp", constTimestamp],
	["AN", constAN],
	["JSON", constJSON],
];
