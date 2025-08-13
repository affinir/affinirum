import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";

const typeAccessor = Type.functionType(Type.Array, [Type.Object]);

export const funcEntries = new Constant(
	(value: { [ key: string ]: Value })=>
		value ? Object.entries(value) : undefined,
	typeAccessor,
);

export const funcKeys = new Constant(
	(value: { [ key: string ]: Value })=>
		value ? Object.keys(value) : undefined,
	Type.functionType(Type.arrayType([Type.String]), [Type.Object]),
);

export const funcValues = new Constant(
	(value: { [ key: string ]: Value })=>
		value ? Object.values(value) : undefined,
	typeAccessor,
);

const funcMerge = new Constant(
	(...values: ({ [ key: string ]: Value } | { [ key: string ]: Value }[])[])=>
		values.flat().reduce((acc, val)=> Object.assign(acc, val), {}),
	Type.functionType(Type.Object, [Type.union(Type.arrayType([Type.Object]), Type.Object)], true),
);

export const constObject = {
	Merge: funcMerge,
};
