import { Constant } from "./Constant.js";
import { constArray } from "./constant/Array.js";
import { constBoolean } from "./constant/Boolean.js";
import { constBuffer } from "./constant/Buffer.js";
import { constInteger } from "./constant/Integer.js";
import { constFloat } from "./constant/Float.js";
import { constObject } from "./constant/Object.js";
import { constString } from "./constant/String.js";
import { constTimestamp } from "./constant/Timestamp.js";
import { constAN } from "./constant/notation/AN.js";
import { constJSON } from "./constant/notation/JSON.js";

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
