import { Constant } from '../Constant.js';
import { Value } from '../Value.js';
import { Type } from '../Type.js';

export const funcCoalesce = new Constant(
	(value: Value, valueOtherwise: Value)=>
		value ?? valueOtherwise,
	Type.functionType(Type.Unknown, [Type.Unknown, Type.Unknown], { inference: 0 }),
);

export const funcSwitch = new Constant(
	(condition: boolean, value1: Value, value2: Value)=>
		condition ? value1 : value2,
	Type.functionType(Type.Unknown, [Type.Boolean, Type.Unknown, Type.Unknown], { inference: 1 }),
);
