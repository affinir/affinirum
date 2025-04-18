import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { typeBoolean, typeBooleanOrArray } from '../ValueType.js';

export const funcOr = new Constant(
	(...values: (boolean | boolean[])[])=>
		values.flat(FUNCTION_ARG_MAX).some((v)=> v),
	new FunctionType(typeBoolean, [typeBooleanOrArray], 2, FUNCTION_ARG_MAX),
);

export const funcAnd = new Constant(
	(...values: (boolean | boolean[])[])=>
		values.flat(FUNCTION_ARG_MAX).every((v)=> v),
	new FunctionType(typeBoolean, [typeBooleanOrArray], 2, FUNCTION_ARG_MAX),
);

export const funcNot = new Constant(
	(value: boolean)=>
		!value,
	new FunctionType(typeBoolean, [typeBoolean]),
);
