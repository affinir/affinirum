import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { typeNumber, typeBuffer, typeString } from '../ValueType.js';

export const funcRandomNumber = new Constant(
	(value: number)=>
		value == null ? undefined : Math.random() * value,
	new FunctionType(typeNumber, [typeNumber], undefined, undefined, undefined, false),
);

export const funcRandomInteger = new Constant(
	(value: number)=>
		value == null ? undefined : Math.floor(Math.random() * value),
	new FunctionType(typeNumber, [typeNumber], undefined, undefined, undefined, false),
);

export const funcRandomBuffer = new Constant(
	(value: number)=>
		value == null || value < 0 ? undefined : crypto.getRandomValues(new Uint8Array(value)),
	new FunctionType(typeBuffer, [typeNumber], undefined, undefined, undefined, false),
);

export const funcRandomString = new Constant(
	(value: number)=> {
		if (value == null || value < 0) {
			return undefined;
		}
		let str = '';
		while (str.length < value) {
			str += Math.random().toString(36).slice(2);
		}
		return str.slice(0, value);
	},
	new FunctionType(typeString, [typeNumber], undefined, undefined, undefined, false),
);
