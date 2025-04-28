import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export const funcLength = new Constant(
	(value: ArrayBuffer | string | Value[] | { [ key: string ]: Value })=>
		BigInt(value == null
			? 0
			:	value instanceof ArrayBuffer
				? value.byteLength
				: typeof value === 'string' || Array.isArray(value)
					? value.length
					: Object.keys(value).length),
	Type.functionType(Type.Integer, [Type.Iterable]),
);

export const funcAt = new Constant(
	(value: Value[] | { [ key: string ]: Value } | undefined, index: bigint | string)=> {
		if (value == null) {
			return undefined;
		}
		else if (Array.isArray(value)) {
			const ix = Number(index);
			return value[ix < 0 ? value.length + ix : ix];
		}
		else {
			return value[String(index)];
		}
	},
	Type.union(
		Type.functionType(Type.Unknown, [Type.Array, Type.Integer]),
		Type.functionType(Type.Unknown, [Type.Object, Type.String])
	),
);
