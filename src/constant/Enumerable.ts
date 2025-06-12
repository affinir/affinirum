import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { concatBuffers } from "./Buffer.js";

const aggregate = (
	value1: ArrayBuffer | string | Value[] | null | undefined,
	value2: ArrayBuffer | string | Value[] | null | undefined
)=> {
	if (value1 == null || value2 == null) {
		return undefined;
	}
	if (value1 instanceof ArrayBuffer && value2 instanceof ArrayBuffer) {
		return concatBuffers(value1, value2);
	}
	if (typeof value1 === "string" && typeof value2 === "string") {
		return value1.concat(value2);
	}
	return [value1].flat().concat([value2].flat());
};

const add = (
	value1: number | bigint | ArrayBuffer | string | Value[] | null | undefined,
	value2: number | bigint | ArrayBuffer | string | Value[] | null | undefined
)=> {
	if (typeof value1 === "bigint" && typeof value2 === "bigint") {
		return BigInt.asIntN(64, value1 + value2);
	}
	if (typeof value1 === "number" || typeof value2 === "number") {
		return Number(value1) + Number(value2);
	}
	return aggregate(value1 as ArrayBuffer | string | Value[], value2 as ArrayBuffer | string | Value[]);
};

export const funcAdd = new Constant(
	(value1: number | bigint | ArrayBuffer | string | Value[], value2: number | bigint | ArrayBuffer | string | Value[])=>
		add(value1, value2),
	Type.union(
		Type.functionType(Type.Float, [Type.Float, Type.Integer]),
		Type.functionType(Type.Float, [Type.Integer, Type.Float]),
		Type.functionType(Type.Integer, [Type.Integer, Type.Integer]),
		Type.functionType(Type.Buffer, [Type.Buffer, Type.Buffer]),
		Type.functionType(Type.String, [Type.String, Type.String]),
		Type.functionType(Type.Array, [Type.Array, Type.Array]),
	),
);

export const funcSlice = new Constant(
	(value: ArrayBuffer | string | Value[], start: bigint = 0n, end?: bigint)=>
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
	(value: ArrayBuffer | string | Value[], start: bigint, remove: bigint, ...inject: (ArrayBuffer | string | Value[] | null | undefined)[])=>
		value == null
			? undefined
			: aggregate(
				inject.reduce((acc, val)=> aggregate(acc, val), value.slice(0, Number(start))),
				value.slice(Number(start + remove)),
			),
	Type.union(
		Type.functionType(Type.Buffer, [Type.Buffer, Type.Integer, Type.Integer, Type.Enumerable], true),
		Type.functionType(Type.String, [Type.String, Type.Integer, Type.Integer, Type.Enumerable], true),
		Type.functionType(Type.Array, [Type.Array, Type.Integer, Type.Integer, Type.Enumerable], true),
	),
);

export const funcInject	= new Constant(
	(value: ArrayBuffer | string | Value[], start: bigint, ...inject: (ArrayBuffer | string | Value[] | null | undefined)[])=>
		value == null
			? undefined
			: aggregate(
				inject.reduce((acc, val)=> aggregate(acc, val), value.slice(0, Number(start))),
				value.slice(Number(start)),
			),
	Type.union(
		Type.functionType(Type.Buffer, [Type.Buffer, Type.Integer, Type.Enumerable], true),
		Type.functionType(Type.String, [Type.String, Type.Integer, Type.Enumerable], true),
		Type.functionType(Type.Array, [Type.Array, Type.Integer, Type.Enumerable], true),
	),
);