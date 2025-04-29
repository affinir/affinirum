import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export const funcSlice = new Constant(
	(value: ArrayBuffer | string | Value[], start: bigint = 0n, end?: bigint)=>
		value == null
			? undefined
			: value.slice(Number(start), end == null ? undefined : Number(end)) as Value,
	Type.union(
		Type.functionType(Type.Buffer, [Type.Buffer, Type.OptionalInteger, Type.OptionalInteger]),
		Type.functionType(Type.String, [Type.String, Type.OptionalInteger, Type.OptionalInteger]),
		Type.functionType(Type.Array, [Type.Array, Type.OptionalInteger, Type.OptionalInteger]),
	),
);
