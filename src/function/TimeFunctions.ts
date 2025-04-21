import { Constant } from '../Constant.js';
import { Type } from '../Type.js';
import { parseTimestamp } from '../base/Timestamp.js';

export const typeNumberOrString = new Type('number', 'string');

export const funcNow = new Constant(
	()=>
		new Date().getTime(),
	Type.functionType(Type.Number, [], { impure: true }),
);

export const funcToUniversalTime = new Constant(
	(value: number | string)=> {
		const v = parseTimestamp(value);
		return v ? [v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate(),
			v.getUTCHours(), v.getUTCMinutes(), v.getUTCSeconds(), v.getUTCMilliseconds()] : undefined;
	},
	Type.functionType(Type.Array, [typeNumberOrString]),
);

export const funcFromUniversalTime = new Constant(
	(value: number[])=>
		Date.UTC(value[0] ?? 1970, (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0, value[6] ?? 0),
	Type.functionType(Type.Number, [Type.Array]),
);

export const funcToLocalTime = new Constant(
	(value: number | string)=> {
		const v = parseTimestamp(value);
		return v ? [v.getFullYear(), v.getMonth() + 1, v.getDate(),
			v.getHours(), v.getMinutes(), v.getSeconds(), v.getMilliseconds()] : undefined;
	},
	Type.functionType(Type.Array, [typeNumberOrString]),
);

export const funcFromLocalTime = new Constant(
	(value: number[])=>
		new Date(value[0] ?? 1970, (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0, value[6] ?? 0).getTime(),
	Type.functionType(Type.Number, [Type.Array]),
);

export const funcToUniversalTimeMonthIndex = new Constant(
	(value: number | string)=> parseTimestamp(value)?.getUTCMonth(),
	Type.functionType(Type.Number, [typeNumberOrString]),
);

export const funcToLocalTimeMonthIndex = new Constant(
	(value: number | string)=> parseTimestamp(value)?.getMonth(),
	Type.functionType(Type.Number, [typeNumberOrString]),
);

export const funcToUniversalTimeWeekdayIndex = new Constant(
	(value: number | string)=> parseTimestamp(value)?.getUTCDay(),
	Type.functionType(Type.Number, [typeNumberOrString]),
);

export const funcToLocalTimeWeekdayIndex = new Constant(
	(value: number | string)=> parseTimestamp(value)?.getDay(),
	Type.functionType(Type.Number, [typeNumberOrString]),
);

export const funcToTimeString = new Constant(
	(value: number | string)=> parseTimestamp(value)?.toISOString(),
	Type.functionType(Type.String, [typeNumberOrString]),
);

export const funcFromTimeString = new Constant(
	(value: string)=> parseTimestamp(value)?.getTime(),
	Type.functionType(Type.Number, [Type.String]),
);
