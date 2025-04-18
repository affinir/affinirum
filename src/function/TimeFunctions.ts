import { parseDate } from '../base/Timestamp.js';
import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { typeNumber, typeString, typeArray, typeNumberOrString } from '../ValueType.js';
	
export const funcNow = new Constant(
	()=>
		new Date().getTime(),
	new FunctionType(typeNumber, [], undefined, undefined, undefined, false),
);

export const funcToUniversalTime = new Constant(
	(value: number | string)=> {
		const v = parseDate(value);
		return v ? [v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate(),
			v.getUTCHours(), v.getUTCMinutes(), v.getUTCSeconds(), v.getUTCMilliseconds()] : undefined;
	},
	new FunctionType(typeArray, [typeNumberOrString]),
);

export const funcFromUniversalTime = new Constant(
	(value: number[])=>
		Date.UTC(value[0] ?? 1970, (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0, value[6] ?? 0),
	new FunctionType(typeNumber, [typeArray]),
);

export const funcToLocalTime = new Constant(
	(value: number | string)=> {
		const v = parseDate(value);
		return v ? [v.getFullYear(), v.getMonth() + 1, v.getDate(),
			v.getHours(), v.getMinutes(), v.getSeconds(), v.getMilliseconds()] : undefined;
	},
	new FunctionType(typeArray, [typeNumberOrString]),
);

export const funcFromLocalTime = new Constant(
	(value: number[])=>
		new Date(value[0] ?? 1970, (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0, value[6] ?? 0).getTime(),
	new FunctionType(typeNumber, [typeArray]),
);

export const funcToUniversalTimeMonthIndex = new Constant(
	(value: number | string)=> parseDate(value)?.getUTCMonth(),
	new FunctionType(typeNumber, [typeNumberOrString]),
);

export const funcToLocalTimeMonthIndex = new Constant(
	(value: number | string)=> parseDate(value)?.getMonth(),
	new FunctionType(typeNumber, [typeNumberOrString]),
);

export const funcToUniversalTimeWeekdayIndex = new Constant(
	(value: number | string)=> parseDate(value)?.getUTCDay(),
	new FunctionType(typeNumber, [typeNumberOrString]),
);

export const funcToLocalTimeWeekdayIndex = new Constant(
	(value: number | string)=> parseDate(value)?.getDay(),
	new FunctionType(typeNumber, [typeNumberOrString]),
);

export const funcToTimeString = new Constant(
	(value: number | string)=> parseDate(value)?.toISOString(),
	new FunctionType(typeString, [typeNumberOrString]),
);

export const funcFromTimeString = new Constant(
	(value: string)=> parseDate(value)?.getTime(),
	new FunctionType(typeNumber, [typeString]),
);
