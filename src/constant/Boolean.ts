import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const typeBooleanOrArray = Type.union(Type.Boolean, Type.Array);
const typeBooleanLogic = Type.functionType(Type.Boolean, [typeBooleanOrArray], { variadic: true });

export const funcOr = new Constant(
	(...values: (boolean | boolean[])[])=>
		values.flat().some((v)=> v),
	typeBooleanLogic,
);

export const funcAnd = new Constant(
	(...values: (boolean | boolean[])[])=>
		values.flat().every((v)=> v),
	typeBooleanLogic,
);

export const funcNot = new Constant(
	(value: boolean)=>
		!value,
	Type.functionType(Type.Boolean, [Type.Boolean]),
);

const funcFormatBoolean = new Constant(
	(value: boolean | undefined)=>
		value?.toString(),
	Type.functionType(Type.OptionalString, [Type.OptionalBoolean]),
);

const funcParseBoolean = new Constant(
	(value: string | undefined)=>
		value ? value.toLowerCase() === 'true' : undefined,
	Type.functionType(Type.OptionalBoolean, [Type.OptionalString]),
);

export const constBoolean = new Constant({
	Or: funcOr.value,
	And: funcAnd.value,
	Not: funcNot.value,
	Format: funcFormatBoolean.value,
	Parse: funcParseBoolean.value,
}, Type.objectType({
	Or: funcOr.type,
	And: funcAnd.type,
	Not: funcNot.type,
	Format: funcFormatBoolean.type,
	Parse: funcParseBoolean.type,
}));
