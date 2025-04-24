import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

const typeArrayOrObject = Type.union(Type.Array, Type.Object);
const typeAccessor = Type.functionType(Type.Array, [Type.Object]);

export const funcEntries = new Constant(
	(value: { [ key: string ]: Value })=> Object.entries(value),
	typeAccessor,
);

export const funcKeys = new Constant(
	(value: { [ key: string ]: Value })=> Object.keys(value),
	typeAccessor,
);

export const funcValues = new Constant(
	(value: { [ key: string ]: Value })=> Object.values(value),
	typeAccessor,
);

const funcMerge = new Constant(
	(...values: ({ [ key: string ]: Value } | { [ key: string ]: Value }[])[])=>
		values.flat().reduce((acc, val)=> Object.assign(acc, val), {}),
	Type.functionType(Type.Object, [typeArrayOrObject], { variadic: true }),
);

export const constObject = new Constant({
	Merge: funcMerge.value,
}, Type.objectType({
	Merge: funcMerge.type,
}));
