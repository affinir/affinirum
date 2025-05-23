import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { containsBuffer } from './Buffer.js';
import { containsString } from './String.js';

export const funcLength = new Constant(
	(value: ArrayBuffer | string | Value[] | { [ key: string ]: Value })=>
		BigInt.asIntN(64, BigInt(value == null
			? 0
			:	value instanceof ArrayBuffer
				? value.byteLength
				: typeof value === 'string' || Array.isArray(value)
					? value.length
					: Object.keys(value).length)),
	Type.functionType(Type.Integer, [Type.Iterable]),
);

export const funcContains = new Constant(
	(value: ArrayBuffer | string | Value[] | { [ key: string ]: Value }, search: Value, start?: bigint, ignoreCaseSpaceEtc?: boolean)=>
		value == null
			? undefined
			: value instanceof ArrayBuffer
				? containsBuffer(value, search as ArrayBuffer, start == null ? undefined : Number(start))
				: typeof value === 'string'
					? containsString(value, search as string, start == null ? undefined : Number(start), ignoreCaseSpaceEtc)
					: Array.isArray(value)
						? value.includes(search, start == null ? undefined : Number(start))
						: Object.values(value).includes(search),
	Type.union(
		Type.functionType(Type.Boolean, [Type.Buffer, Type.Buffer, Type.OptionalInteger]),
		Type.functionType(Type.Boolean, [Type.String, Type.String, Type.OptionalInteger, Type.OptionalBoolean]),
		Type.functionType(Type.Boolean, [Type.Array, Type.Unknown, Type.OptionalInteger]),
		Type.functionType(Type.Boolean, [Type.Object, Type.Unknown]),
	),
);

export const funcAt = new Constant(
	(value: Value[] | { [ key: string ]: Value } | null | undefined, index: bigint | string)=> {
		if (value == null) {
			return undefined;
		}
		else if (Array.isArray(value)) {
			const ix = Number(index);
			return value[ix < 0 ? value.length + ix : ix];
		}
		return value[String(index)];
	},
	Type.union(
		Type.functionType(Type.Unknown, [Type.Array, Type.Integer]),
		Type.functionType(Type.Unknown, [Type.Object, Type.String])
	),
);

export const funcHas = new Constant(
	(value: Value[] | { [ key: string ]: Value } | null | undefined, index: bigint | string)=> {
		if (value == null) {
			return undefined;
		}
		else if (Array.isArray(value)) {
			const ix = Number(index);
			return ix < value.length;
		}
		return Object.hasOwn(value, String(index));
	},
	Type.union(
		Type.functionType(Type.Boolean, [Type.Array, Type.Integer]),
		Type.functionType(Type.Boolean, [Type.Object, Type.String])
	),
);
