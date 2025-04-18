import { notate } from '../base/String.js'
import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { Value, typeUnknown, typeString, typeOptionalString, typeJson } from '../ValueType.js';

export const funcToJSON = new Constant(
	(value: undefined | boolean | number | string | [] | { [ key: string ]: Value }, whitespace?: string)=>
		value ? JSON.stringify(value, undefined, whitespace) : undefined,
	new FunctionType(typeOptionalString, [typeJson, typeOptionalString], 1, 2),
)

export const funcFromJSON = new Constant(
	(value: undefined | string)=>
		value ? JSON.parse(value) as Value : undefined,
	new FunctionType(typeJson, [typeOptionalString]),
)

export const funcToAN = new Constant(
	(value: Value, whitespace?: string)=> notate(value, whitespace),
	new FunctionType(typeString, [typeUnknown], 1, 2),
);
