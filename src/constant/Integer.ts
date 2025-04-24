import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const funcRandomInteger = new Constant(
	(value: number)=>
		value == null ? undefined : Math.floor(Math.random() * value),
	Type.functionType(Type.Number, [Type.Number], { unstable: true }),
);

export const constInteger = new Constant({
	Random: funcRandomInteger.value,
}, Type.objectType({
	Random: funcRandomInteger.type,
}));
