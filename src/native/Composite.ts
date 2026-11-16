import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";

const arrayAt = (value: Value[], index: number) => {
	const ix = index < 0 ? value.length + index : index;
	return ix >= 0 && ix < value.length ? value[ix] : undefined;
};

const objectAt = (value: { [ key: string ]: Value }, key: string) => {
	return Object.hasOwn(value, key) ? value[key] : undefined;
};

const arrayHas = (value: Value[], index: number) => {
	const ix = index < 0 ? value.length + index : index;
	return ix >= 0 && ix < value.length;
};

const objectHas = (value: { [ key: string ]: Value }, key: string) => {
	return Object.hasOwn(value, key);
};

export const funcAt = new Constant(
	(value: Value[] | { [ key: string ]: Value }, index: bigint | string) =>
		Array.isArray(value) ? arrayAt(value, Number(index)) : objectAt(value, String(index)),
	Type.functionType([
		[Type.Unknown, [Type.Array, Type.Integer]],
		[Type.Unknown, [Type.Object, Type.String]],
	]),
);

export const funcOptionalAt = new Constant(
	(value: Value[] | { [ key: string ]: Value } | null | undefined, index: bigint | string) =>
		value == null ? undefined : Array.isArray(value) ? arrayAt(value, Number(index)) : objectAt(value, String(index)),
	Type.functionType([
		[Type.Unknown, [Type.OptionalArray, Type.Integer]],
		[Type.Unknown, [Type.OptionalObject, Type.String]],
	]),
);

export const funcHas = new Constant(
	(value: Value[] | { [ key: string ]: Value }, index: bigint | string) =>
		Array.isArray(value) ? arrayHas(value, Number(index)) : objectHas(value, String(index)),
	Type.functionType([
		[Type.Boolean, [Type.Array, Type.Integer]],
		[Type.Boolean, [Type.Object, Type.String]],
	]),
);

export const funcOptionalHas = new Constant(
	(value: Value[] | { [ key: string ]: Value } | null | undefined, index: bigint | string) =>
		value == null ? undefined : Array.isArray(value) ? arrayHas(value, Number(index)) : objectHas(value, String(index)),
	Type.functionType([
		[Type.OptionalBoolean, [Type.OptionalArray, Type.Integer]],
		[Type.OptionalBoolean, [Type.OptionalObject, Type.String]],
	]),
);
