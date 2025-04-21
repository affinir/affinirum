import { Constant } from '../Constant.js';
import { Type } from '../Type.js';
import { parseBuffer, formatBuffer } from '../base/Buffer.js';
import { isCaseSpaceEtc } from '../base/String.js';

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
	Type.functionType(Type.String, [Type.String]),
);

export const funcTrim = new Constant(
	(value: string)=>
		value.trim(),
	Type.functionType(Type.String, [Type.String]),
);

export const funcTrimStart = new Constant(
	(value: string)=>
		value.trimStart(),
	Type.functionType(Type.String, [Type.String]),
);

export const funcTrimEnd = new Constant(
	(value: string)=>
		value.trimEnd(),
	Type.functionType(Type.String, [Type.String]),
);

export const funcLowerCase = new Constant(
	(value: string)=>
		value.toLowerCase(),
	Type.functionType(Type.String, [Type.String]),
);

export const funcUpperCase = new Constant(
	(value: string)=>
		value.toUpperCase(),
	Type.functionType(Type.String, [Type.String]),
);

export const funcJoin = new Constant(
	(value: string[], separator: string = ' ')=>
		value.join(separator),
	Type.functionType(Type.String, [Type.Array, Type.OptionalString]),
);

export const funcSplit = new Constant(
	(value: string, separator: string = ' ')=>
		value.split(separator),
	Type.functionType(Type.Array, [Type.String, Type.OptionalString]),
);

export const funcToBooleanString = new Constant(
	(value: boolean | undefined)=>
		value?.toString(),
	Type.functionType(Type.OptionalString, [Type.OptionalBoolean]),
);

export const funcFromBooleanString = new Constant(
	(value: string | undefined)=>
		value ? value.toLowerCase() === 'true' : undefined,
	Type.functionType(Type.OptionalBoolean, [Type.OptionalString]),
);

export const funcToNumberString = new Constant(
	(value: number | undefined, radix?: number)=>
		value?.toString(radix),
	Type.functionType(Type.OptionalString, [Type.OptionalNumber]),
);

export const funcFromNumberString = new Constant(
	(value: string | undefined)=>
		value ? Number.parseFloat(value) : undefined,
	Type.functionType(Type.OptionalNumber, [Type.OptionalString]),
);

export const funcToBufferString = new Constant(
	(value: ArrayBuffer | undefined)=>
		formatBuffer(value),
	Type.functionType(Type.OptionalString, [Type.OptionalBuffer]),
);

export const funcFromBufferString = new Constant(
	(value: string)=>
		parseBuffer(value),
	Type.functionType(Type.OptionalBuffer, [Type.OptionalString]),
);
