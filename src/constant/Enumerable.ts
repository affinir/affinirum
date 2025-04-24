import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export const funcSlice = new Constant(
	(value: ArrayBuffer | string | Value[], start: number = 0, end?: number)=>
		value == null
			? undefined
			: value.slice(start, end) as Value,
	Type.functionTypeInference(1, Type.Enumerable, [Type.Enumerable, Type.OptionalNumber, Type.OptionalNumber]),
);
