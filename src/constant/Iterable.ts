import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { FunctionSubtype } from '../subtype/FunctionSubype.js';

export const funcLength = new Constant(
	(value: ArrayBuffer | string | Value[] | { [ key: string ]: Value })=>
		value == null
			? undefined
			:	value instanceof ArrayBuffer
				? value.byteLength
				: typeof value === 'string' || Array.isArray(value)
					? value.length
					: Object.keys(value).length,
	Type.functionType(Type.Number, [Type.Iterable]),
);

export const funcAt = new Constant(
	(value: Value[] | { [ key: string ]: Value } | undefined, index: number | string)=> {
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
	new Type(
		new FunctionSubtype(Type.Unknown, [Type.Array, Type.Number]),
		new FunctionSubtype(Type.Unknown, [Type.Object, Type.String])
	),
);
