import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const funcRandomNumber = new Constant(
	(value: number)=>
		value == null ? undefined : Math.random() * value,
	Type.functionType(Type.Number, [Type.Number], { impure: true }),
);

const funcRandomInteger = new Constant(
	(value: number)=>
		value == null ? undefined : Math.floor(Math.random() * value),
	Type.functionType(Type.Number, [Type.Number], { impure: true }),
);

const funcRandomBuffer = new Constant(
	(value: number)=>
		value == null || value < 0 ? undefined : crypto.getRandomValues(new Uint8Array(value)),
	Type.functionType(Type.Buffer, [Type.Number], { impure: true }),
);

const funcRandomString = new Constant(
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
	Type.functionType(Type.String, [Type.Number], { impure: true }),
);

export const constRandom = new Constant({
	Number: funcRandomNumber.value,
	Integer: funcRandomInteger.value,
	Buffer: funcRandomBuffer.value,
	String: funcRandomString.value,
});
