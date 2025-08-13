import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { equate } from "./Unknown.js";

const typePredicate = Type.functionType(Type.Boolean, [Type.Unknown, Type.OptionalInteger, Type.OptionalArray]);
const typeItemFinder = Type.functionType(Type.Unknown, [Type.Array, typePredicate]);
const typeIndexFinder = Type.functionType(Type.OptionalInteger, [Type.Array, typePredicate]);
const typeConditionSet = Type.functionType(Type.Boolean, [Type.Array, typePredicate]);
const typeVariadicInsert = Type.functionType(Type.Array, [Type.Array, Type.Unknown], true);
const typeArrayOperator = Type.functionType(Type.Array, [Type.Array, Type.Array]);

export const funcFirst = new Constant(
	(value: Value[], predicate: (v: Value, i: bigint, a: Value[])=> boolean)=>
		value?.find((v, i, a)=> predicate(v, BigInt(i), a)),
	typeItemFinder,
);

export const funcLast = new Constant(
	(value: Value[], predicate: (v: Value, i: bigint, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		for (let i = value.length - 1; i >= 0; --i) {
			if (predicate(value[i], BigInt(i), value)) {
				return value[i];
			}
		}
		return undefined;
	},
	typeItemFinder,
);

export const funcFirstIndex = new Constant(
	(value: Value[], predicate: (v: Value, i: bigint, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		const ix = value.findIndex((v, i, a)=> predicate(v, BigInt(i), a));
		return ix < 0 ? undefined : BigInt.asIntN(64, BigInt(ix));
	},
	typeIndexFinder,
);

export const funcLastIndex = new Constant(
	(value: Value[], predicate: (v: Value, i: bigint, a: Value[])=> boolean)=> {
		if (value == null) {
			return undefined;
		}
		for (let i = value.length - 1; i >= 0; i--) {
			if (predicate(value[i], BigInt(i), value)) {
				return BigInt.asIntN(64, BigInt(i));
			}
		}
		return undefined;
	},
	typeIndexFinder,
);

export const funcEvery = new Constant(
	(value: Value[], predicate: (v: Value, i: bigint, a: Value[])=> boolean)=>
		value?.every((v, i, a)=> predicate(v, BigInt(i), a)) ?? false,
	typeConditionSet,
);

export const funcAny = new Constant(
	(value: Value[], predicate: (v: Value, i: bigint, a: Value[])=> boolean)=>
		value?.some((v, i, a)=> predicate(v, BigInt(i), a)) ?? false,
	typeConditionSet,
);

export const funcFlatten = new Constant(
	(values: Value[], depth: bigint = 1n)=>
		values ? (values as [])?.flat(Number(depth)) as Value : undefined,
	Type.functionType(Type.Array, [Type.Array, Type.OptionalInteger]),
);

export const funcReverse = new Constant(
	(value: Value[])=>
		value ? [...value].reverse() : undefined,
	Type.functionType(Type.Array, [Type.Array]),
);

export const funcMutate = new Constant(
	(value: Value[], transform: (v: Value, i: bigint, a: Value[])=> Value)=>
		value?.map((v, i, a)=> transform(v, BigInt(i), a)),
	Type.functionType(Type.Array, [Type.Array, Type.functionType(Type.Unknown, [Type.Unknown, Type.OptionalInteger, Type.OptionalArray])]),
);

export const funcFilter = new Constant(
	(value: Value[], predicate: (v: Value, i: bigint, a: Value[])=> boolean)=>
		value?.filter((v, i, a)=> predicate(v, BigInt(i), a)),
	Type.functionType(Type.Array, [Type.Array, typePredicate]),
);

export const funcReduce = new Constant(
	(value: Value[], reducer: (acc: Value, v: Value, i: bigint, arr: Value[])=> Value, initial?: Value)=>
		initial != null
			? value?.reduce((p, v, i, a)=> reducer(p, v, BigInt(i), a), initial)
			: value?.reduce((p, v, i, a)=> reducer(p, v, BigInt(i), a)),
	Type.functionType(Type.Unknown, [Type.Array, Type.functionType(Type.Unknown, [Type.Unknown, Type.Unknown, Type.OptionalInteger, Type.OptionalArray])]),
);

export const funcCompose = new Constant(
	(value: string[], callback: (acc: { [ key: string ]: Value }, v: string, i: bigint, arr: string[])=> { [ key: string ]: Value })=> {
		if (value == null) {
			return undefined;
		}
		const obj: Record<string, any> = {};
		for (let i = 0; i < value.length; ++i) {
			const key =  value[i];
			obj[key] = callback(obj, key, BigInt(i), value);
		}
		return obj;
	},
	Type.functionType(Type.Object, [Type.Array, Type.functionType(Type.Unknown, [Type.Object, Type.String, Type.OptionalInteger, Type.OptionalArray])]),
);

export const funcPrepend = new Constant(
	(value: Value[], ...items: Value[])=> {
		value?.unshift(items);
		return value;
	},
	typeVariadicInsert,
);

export const funcAppend = new Constant(
	(value: Value[], ...items: Value[])=> {
		value?.push(items);
		return value;
	},
	typeVariadicInsert,
);

const funcJoin = new Constant(
	(...values: (Value[] | Value[][])[])=>
		(values as []).flat(Infinity).reduce((acc, val)=> [...acc, val], []),
	Type.functionType(Type.Array, [Type.Array], true),
);

const funcRange = new Constant(
	(value1: bigint, value2: bigint)=> {
		const min = value1 < value2 ? value1 : value2;
		const max = value1 > value2 ? value1 : value2;
		return [...Array(Number(max - min)).keys()].map((i)=> BigInt(i) + min);
	},
	Type.functionType(Type.Array, [Type.Integer, Type.Integer]),
);

const funcUnique = new Constant(
	(value: Value[])=> {
		const result: Value[] = [];
		value?.forEach((i)=> {
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
		value1?.filter((i)=> value2?.some((v)=> equate(v, i))) ?? [],
	typeArrayOperator,
);

const funcDifference = new Constant(
	(value1: Value[], value2: Value[])=>
		[...value1?.filter((i)=> value2?.every((v)=> !equate(v, i))) ?? [], ...value2?.filter((i)=> value1?.every((v)=> !equate(v, i))) ?? []],
	typeArrayOperator,
);

export const constArray = {
	Join: funcJoin,
	Range: funcRange,
	Unique: funcUnique,
	Intersection: funcIntersection,
	Difference: funcDifference,
};