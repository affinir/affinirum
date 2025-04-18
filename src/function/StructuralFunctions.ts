import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { Value, typeUnknown, typeBoolean } from '../ValueType.js';

export const funcCoalesce = new Constant(
	(value: Value, valueOtherwise: Value)=>
		value ?? valueOtherwise,
	new FunctionType(typeUnknown, [typeUnknown, typeUnknown], 2, 2, 0),
);

export const funcSwitch = new Constant(
	(condition: boolean, value1: Value, value2: Value)=>
		condition ? value1 : value2,
	new FunctionType(typeUnknown, [typeBoolean, typeUnknown, typeUnknown], 3, 3, 1),
);
