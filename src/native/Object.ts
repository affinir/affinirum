import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";

const typeAccessor = Type.functionType([[Type.Array, [Type.Object]]]);

export const funcEntries = new Constant(
	(value: { [ key: string ]: Value }) =>
		value ? Object.entries(value) : undefined,
	typeAccessor,
);

export const funcKeys = new Constant(
	(value: { [ key: string ]: Value }) =>
		value ? Object.keys(value) : undefined,
	Type.functionType([[Type.arrayType(Type.String), [Type.Object]]]),
);

export const funcValues = new Constant(
	(value: { [ key: string ]: Value }) =>
		value ? Object.values(value) : undefined,
	typeAccessor,
);

const funcMerge = new Constant(
	(...values: { [ key: string ]: Value }[]) =>
		values.reduce((acc, val) => Object.assign(acc, val), Object.create(null) as { [ key: string ]: Value }),
	Type.functionType([[Type.Object, [Type.arrayType(Type.Object)], true]]),
);

export const globObject = Object.assign(Object.create(null), {
	Merge: funcMerge,
});
