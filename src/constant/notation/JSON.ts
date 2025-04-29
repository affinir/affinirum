import { Constant } from '../../Constant.js';
import { Type } from '../../Type.js';
import { formatFloat } from '../Float.js';

const typeJson = Type.union(Type.Void, Type.Boolean, Type.Float, Type.String, Type.Array, Type.Object);

export const replaceJSON = (_key: string, value: any)=>
	typeof value === 'number'
		? formatFloat(value)
		:	typeof value === 'bigint'
			? value.toString()
			: value as null | boolean | number | string | [] | { [ key: string ]: any };

const funcFormatJSON = new Constant(
	(value: null | boolean | number | string | [] | { [ key: string ]: any }, whitespace?: string)=>
		JSON.stringify(value ?? null, replaceJSON, whitespace),
	Type.functionType(Type.String, [typeJson, Type.OptionalString]),
)

const funcParseJSON = new Constant(
	(value: string)=>
		JSON.parse(value) as null | boolean | number | string | [] | { [ key: string ]: any },
	Type.functionType(typeJson, [Type.String]),
)

export const constJSON = {
	Format: funcFormatJSON,
	Parse: funcParseJSON,
};
