import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { equate } from './Unknown.js';

const typePredicate = Type.functionType(Type.Boolean, [Type.Unknown, Type.OptionalNumber, Type.OptionalArray]);
const typeItemFinder = Type.functionType(Type.Unknown, [Type.Array, typePredicate]);
const typeIndexFinder = Type.functionType(Type.Number, [Type.Array, typePredicate]);
const typeConditionFinder = Type.functionType(Type.Boolean, [Type.Array, typePredicate]);
const typeVariadicInsert = Type.functionType(Type.Array, [Type.Array, Type.Unknown], true);
const typeArrayOperator = Type.functionType(Type.Array, [Type.Array, Type.Array]);

export const funcFirst = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.find((v, i, a)=> predicate(v, i, a)),
	typeItemFinder,
);

export const funcLast = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		for (let i = value.length - 1; i >= 0; --i) {
			if (predicate(value[i], i, value)) {
				return value[i];
			}
		}
		return undefined;
	},
	typeItemFinder,
);

export const funcFirstIndex = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		const ix = value.findIndex((v, i, a)=> predicate(v, i, a));
		return ix < 0 ? Number.NaN : ix;
	},
	typeIndexFinder,
);

export const funcLastIndex = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		for (let i = value.length - 1; i >= 0; i--) {
			if (predicate(value[i], i, value)) {
				return i;
			}
		}
		return Number.NaN;
	},
	typeIndexFinder,
);

export const funcEvery = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.every((v, i, a)=> predicate(v, i, a)),
	typeConditionFinder,
);

export const funcAny = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.some((v, i, a)=> predicate(v, i, a)),
	typeConditionFinder,
);

export const funcFlatten = new Constant(
	(values: Value[], depth?: number)=>
		(values as [])?.flat(depth) as Value,
	Type.functionType(Type.Array, [Type.Array, Type.OptionalNumber]),
);

export const funcReverse = new Constant(
	(value: Value[])=>
		[...value].reverse(),
	Type.functionType(Type.Array, [Type.Array]),
);

export const funcMutate = new Constant(
	(value: Value[], transform: (v: Value, i: number, a: Value[])=> Value)=>
		value?.map(transform),
	Type.functionType(Type.Array, [Type.Array, Type.functionType(Type.Unknown, [Type.Unknown, Type.OptionalNumber, Type.OptionalArray])]),
);

export const funcFilter = new Constant(
	(value: Value[], predicate: (v: Value, i: number, a: Value[])=> boolean)=>
		value?.filter(predicate),
	Type.functionType(Type.Array, [Type.Array, typePredicate]),
);

export const funcReduce = new Constant(
	(value: Value[], reducer: (acc: Value, v: Value, i: number, arr: Value[])=> Value, initial?: Value)=>
		initial != null ? value?.reduce(reducer, initial) : value?.reduce(reducer),
	Type.functionType(Type.Unknown, [Type.Array, Type.functionType(Type.Unknown, [Type.Unknown, Type.Unknown, Type.OptionalNumber, Type.OptionalArray])]),
);

export const funcCompose = new Constant(
	(value: string[], callback: (acc: { [ key: string ]: Value }, v: string, i: number, arr: string[])=> { [ key: string ]: Value })=> {
		if (value == null) {
			return undefined;
		}
		const obj: Record<string, any> = {};
		for (let i = 0; i < value.length; ++i) {
			const key =  value[i];
			obj[key] = callback(obj, key, i, value);
		}
		return obj;
	},
	Type.functionType(Type.Object, [Type.Array, Type.functionType(Type.Unknown, [Type.Object, Type.String, Type.OptionalNumber, Type.OptionalArray])]),
);

export const funcPrepend = new Constant(
	(value: Value[], ...items: Value[])=> {
		value.unshift(items);
		return value;
	},
	typeVariadicInsert,
);

export const funcAppend = new Constant(
	(value: Value[], ...items: Value[])=> {
		value.push(items);
		return value;
	},
	typeVariadicInsert,
);

export const funcJoin = new Constant(
	(value: string[], separator: string = ' ')=>
		value.join(separator),
	Type.functionType(Type.String, [Type.Array, Type.OptionalString]),
);

const funcRange = new Constant(
	(value1: number, value2: number)=> {
		const [min, max] = [Math.floor(Math.min(value1, value2)), Math.ceil(Math.max(value1, value2))];
		return [...Array(max - min).keys()].map((i)=> i + min);
	},
	Type.functionType(Type.Array, [Type.Number, Type.Number]),
);

const funcChain = new Constant(
	(...values: (Value[] | Value[][])[])=>
		(values as []).flat(2).reduce((acc, val)=> [...acc, val], []),
	Type.functionType(Type.Array, [Type.Array], true),
);

const funcUnique = new Constant(
	(value: Value[])=> {
		const result: Value[] = [];
		value.forEach((i)=> {
			if (result.every((v)=> !equate(v, i))) {
				result.push(i);
			}
		});
		return result;
	},
	Type.functionType(Type.Array, [Type.Array]),
);

const funcIntersection = new Constant(
	(value1: Value[], value2: Value[])=>
		value1.filter((i)=> value2.some((v)=> equate(v, i))),
	typeArrayOperator,
);

const funcDifference = new Constant(
	(value1: Value[], value2: Value[])=>
		[...value1.filter((i)=> value2.every((v)=> !equate(v, i))), ...value2.filter((i)=> value1.every((v)=> !equate(v, i)))],
	typeArrayOperator,
);

export const constArray = {
	Range: funcRange,
	Chain: funcChain,
	Unique: funcUnique,
	Intersection: funcIntersection,
	Difference: funcDifference,
};