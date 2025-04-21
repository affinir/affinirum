import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';
import { notate } from '../base/Unknown.js'

export const typeJson = new Type('void', 'boolean', 'number', 'string', 'array', 'object');

export const funcToJSON = new Constant(
	(value: undefined | boolean | number | string | [] | { [ key: string ]: Value }, whitespace?: string)=>
		value ? JSON.stringify(value, undefined, whitespace) : undefined,
	Type.functionType(Type.OptionalString, [typeJson, Type.OptionalString]),
)

export const funcFromJSON = new Constant(
	(value: undefined | string)=>
		value ? JSON.parse(value) as Value : undefined,
	Type.functionType(typeJson, [Type.OptionalString]),
)

export const funcToAN = new Constant(
	(value: Value, whitespace?: string)=> notate(value, whitespace),
	Type.functionType(Type.String, [Type.Unknown, Type.OptionalString]),
);
