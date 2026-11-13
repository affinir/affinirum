import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";

export const funcAt = new Constant(
	(value: Value[] | { [ key: string ]: Value } | null | undefined, index: bigint | string) => {
		if (value == null) {
			return undefined;
		}
		else if (Array.isArray(value)) {
			const num = Number(index);
			const ix = num < 0 ? value.length + num : num;
			return ix >= 0 && ix < value.length ? value[ix] : undefined;
		}
		const key = String(index);
		return Object.hasOwn(value, key) ? value[key] : undefined;
	},
	Type.functionType([
		[Type.Unknown, [Type.Array, Type.Integer]],
		[Type.Unknown, [Type.Object, Type.String]],
	]),
);

export const funcHas = new Constant(
	(value: Value[] | { [ key: string ]: Value } | null | undefined, index: bigint | string) => {
		if (value == null) {
			return false;
		}
		else if (Array.isArray(value)) {
			const num = Number(index);
			const ix = num < 0 ? value.length + num : num;
			return ix >= 0 && ix < value.length;
		}
		return Object.hasOwn(value, String(index));
	},
	Type.functionType([
		[Type.Boolean, [Type.Array, Type.Integer]],
		[Type.Boolean, [Type.Object, Type.String]],
	]),
);
