import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { concatBuffers } from "./Buffer.js";

export const aggregate = (
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
	if ((typeof value1 === "number" || typeof value1 === "bigint") && (typeof value2 === "number" || typeof value2 === "bigint")) {
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
