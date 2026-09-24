import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { aggregate } from "./Aggregable.js";

const typeEnumerableArray = Type.arrayType([Type.Enumerable]);

export const funcSlice = new Constant(
	(value: ArrayBuffer | string | Value[], start: bigint = 0n, end?: bigint) =>
		value == null
			? undefined
			: value.slice(Number(start), end == null ? undefined : Number(end)),
	Type.union(
		Type.functionType(Type.Buffer, [Type.Buffer, Type.OptionalInteger, Type.OptionalInteger]),
		Type.functionType(Type.String, [Type.String, Type.OptionalInteger, Type.OptionalInteger]),
		Type.functionType(Type.Array, [Type.Array, Type.OptionalInteger, Type.OptionalInteger]),
	),
);

export const funcSplice = new Constant(
	(value: ArrayBuffer | string | Value[], start: bigint, remove: bigint, inject: (ArrayBuffer | string | Value[] | null | undefined)[]) =>
		value == null
			? undefined
			: aggregate(
				inject.reduce((acc, val) => aggregate(acc, val), value.slice(0, Number(start))),
				value.slice(Number(start + remove)),
			),
	Type.union(
		Type.functionType(Type.Buffer, [Type.Buffer, Type.Integer, Type.Integer, typeEnumerableArray], true),
		Type.functionType(Type.String, [Type.String, Type.Integer, Type.Integer, typeEnumerableArray], true),
		Type.functionType(Type.Array, [Type.Array, Type.Integer, Type.Integer, typeEnumerableArray], true),
	),
);

export const funcInject	= new Constant(
	(value: ArrayBuffer | string | Value[], start: bigint, inject: (ArrayBuffer | string | Value[] | null | undefined)[]) =>
		value == null
			? undefined
			: aggregate(
				inject.reduce((acc, val) => aggregate(acc, val), value.slice(0, Number(start))),
				value.slice(Number(start)),
			),
	Type.union(
		Type.functionType(Type.Buffer, [Type.Buffer, Type.Integer, typeEnumerableArray], true),
		Type.functionType(Type.String, [Type.String, Type.Integer, typeEnumerableArray], true),
		Type.functionType(Type.Array, [Type.Array, Type.Integer, typeEnumerableArray], true),
	),
);
