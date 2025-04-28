import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export const funcSlice = new Constant(
	(value: ArrayBuffer | string | Value[], start: bigint = 0n, end?: bigint)=>
		value == null
			? undefined
			: value.slice(Number(start), end == null ? undefined : Number(end)) as Value,
	Type.functionTypeInference(1, Type.Enumerable, [Type.Enumerable, Type.OptionalInteger, Type.OptionalInteger]),
);
