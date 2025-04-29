import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const typeBooleanOrArray = Type.union(Type.Boolean, Type.arrayType([Type.Boolean]));
const typeBooleanLogic = Type.functionType(Type.Boolean, [typeBooleanOrArray], true);

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

const funcDecodeBoolean = new Constant(
	(value: ArrayBuffer, byteOffset?: bigint)=>
		Boolean(new Uint8Array(value)[byteOffset == null ? 0 : Number(byteOffset)]),
	Type.functionType(Type.OptionalBoolean, [Type.Buffer, Type.OptionalInteger]),
);

const funcParseBoolean = new Constant(
	(value: string)=> {
		if (value == null) {
			return undefined;
		}
		const v = value.toLowerCase();
		return v === 'true' ? true : v === 'false' ? false : undefined;
	},
	Type.functionType(Type.OptionalBoolean, [Type.String]),
);

export const constBoolean = {
	Or: funcOr,
	And: funcAnd,
	Not: funcNot,
	Decode: funcDecodeBoolean,
	Parse: funcParseBoolean,
};
