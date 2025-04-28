import { Constant } from '../../Constant.js';
import { Type } from '../../Type.js';

const typeJson = Type.union(Type.Void, Type.Boolean, Type.Float, Type.String, Type.Array, Type.Object);

export const replacerJSON = (_key: string, value: any)=>
	typeof value === 'bigint' ? value.toString() : value;

const funcFormatJSON = new Constant(
	(value: undefined | null | boolean | number | string | [] | { [ key: string ]: any }, whitespace?: string)=>
		value ? JSON.stringify(value, replacerJSON, whitespace) : undefined,
	Type.functionType(Type.OptionalString, [typeJson, Type.OptionalString]),
)

const funcParseJSON = new Constant(
	(value: undefined | string)=>
		value ? JSON.parse(value) as any : undefined,
	Type.functionType(typeJson, [Type.OptionalString]),
)

export const constJSON = {
	Format: funcFormatJSON,
	Parse: funcParseJSON,
};
