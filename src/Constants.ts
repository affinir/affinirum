import { Constant } from './Constant.js';
import { constArray } from './constant/Array.js';
import { constBoolean } from './constant/Boolean.js';
import { constBuffer } from './constant/Buffer.js';
import { constInteger } from './constant/Integer.js';
import { constNumber } from './constant/Number.js';
import { constObject } from './constant/Object.js';
import { constString } from './constant/String.js';
import { constTimestamp } from './constant/Timestamp.js';
import { constAVN } from './constant/notation/AVN.js';
import { constJSON } from './constant/notation/JSON.js';

export const Constants: [string, Constant][] = [
	['Array', constArray],
	['Boolean', constBoolean],
	['Buffer', constBuffer],
	['Integer', constInteger],
	['Number', constNumber],
	['Object', constObject],
	['String', constString],
	['Timestamp', constTimestamp],
	['AVN', constAVN],
	['JSON', constJSON],
];
