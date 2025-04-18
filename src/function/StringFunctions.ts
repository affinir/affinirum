import { parseBuffer, toBufferString } from '../base/Buffer.js';
import { isCaseSpaceEtc } from '../base/String.js';
import { FunctionType, FUNCTION_ARG_MAX } from '../FunctionType.js';
import { Constant } from '../Constant.js';
import { typeString, typeArray, typeOptionalBoolean, typeOptionalNumber, typeOptionalBuffer, typeOptionalString } from '../ValueType.js';

export const funcAlphanum = new Constant(
	(value: string)=> {
		const lowerCase = value.toLowerCase();
		let result = '';
		for (let i = 0; i < lowerCase.length; ++i) {
			if (!isCaseSpaceEtc(value[i])) {
				result += value[i];
			}
		}
		return result;
	},
	new FunctionType(typeString, [typeString]),
);

export const funcTrim = new Constant(
	(value: string)=>
		value.trim(),
	new FunctionType(typeString, [typeString]),
);

export const funcTrimStart = new Constant(
	(value: string)=>
		value.trimStart(),
	new FunctionType(typeString, [typeString]),
);

export const funcTrimEnd = new Constant(
	(value: string)=>
		value.trimEnd(),
	new FunctionType(typeString, [typeString]),
);

export const funcLowerCase = new Constant(
	(value: string)=>
		value.toLowerCase(),
	new FunctionType(typeString, [typeString]),
);

export const funcUpperCase = new Constant(
	(value: string)=>
		value.toUpperCase(),
	new FunctionType(typeString, [typeString]),
);

export const funcJoin = new Constant(
	(value: string[], separator: string = ' ')=>
		value.join(separator),
	new FunctionType(typeString, [typeArray, typeOptionalString], 1, 2),
);

export const funcSplit = new Constant(
	(value: string, separator: string = ' ')=>
		value.split(separator),
	new FunctionType(typeArray, [typeString, typeOptionalString], 1, 2),
);

export const funcToBooleanString = new Constant(
	(value: boolean | undefined)=>
		value?.toString(),
	new FunctionType(typeOptionalString, [typeOptionalBoolean]),
);

export const funcFromBooleanString = new Constant(
	(value: string | undefined)=>
		value ? value.toLowerCase() === 'true' : undefined,
	new FunctionType(typeOptionalBoolean, [typeOptionalString]),
);

export const funcToNumberString = new Constant(
	(value: number | undefined, radix?: number)=>
		value?.toString(radix),
	new FunctionType(typeOptionalString, [typeOptionalNumber], 1, 2),
);

export const funcFromNumberString = new Constant(
	(value: string | undefined)=>
		value ? Number.parseFloat(value) : undefined,
	new FunctionType(typeOptionalNumber, [typeOptionalString]),
);

export const funcToBufferString = new Constant(
	(value: ArrayBuffer | undefined)=>
		toBufferString(value),
	new FunctionType(typeOptionalString, [typeOptionalBuffer]),
);

export const funcFromBufferString = new Constant(
	(value: string)=>
		parseBuffer(value),
	new FunctionType(typeOptionalBuffer, [typeOptionalString]),
);
