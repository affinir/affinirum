import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { concatBuffers } from './Buffer.js';

export const funcAppend = new Constant(
	(...values: (ArrayBuffer | string | Value[])[])=>
		values[0] instanceof ArrayBuffer
			? (values as ArrayBuffer[]).reduce((acc, val)=> concatBuffers(acc, val), new ArrayBuffer(0))
			: typeof values[0] === 'string'
				? (values as string[]).reduce((acc, val)=> acc + val, '')
				: (values as Value[][]).reduce((acc, val)=> [...acc, ...val], []),
	Type.functionTypeInference(1, Type.Enumerable, [Type.Enumerable], { variadic: true }),
);

export const funcSlice = new Constant(
	(value: ArrayBuffer | string | Value[], start: number = 0, end?: number)=>
		value == null
			? undefined
			: value.slice(start, end) as Value,
	Type.functionTypeInference(1, Type.Enumerable, [Type.Enumerable, Type.OptionalNumber, Type.OptionalNumber]),
);
