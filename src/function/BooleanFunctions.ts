import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const typeBooleanOrArray = new Type('boolean', 'array');
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
