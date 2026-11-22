import { Constant } from "../Constant.js";
import { Value } from "../Value.js";
import { Type } from "../Type.js";
import { containsBuffer } from "./Buffer.js";
import { containsString } from "./String.js";
import { equals } from "./Unknown.js";

export const funcLength = new Constant(
	(value: ArrayBuffer | string | Value[] | { [ key: string ]: Value } | null | undefined) =>
		BigInt(value == null
			? 0
			:	value instanceof ArrayBuffer
				? value.byteLength
				: typeof value === "string" || Array.isArray(value)
					? value.length
					: Object.keys(value).length),
	Type.functionType([[Type.Integer, [Type.OptionalIterable]]]),
);

export const funcContains = new Constant(
	(value: ArrayBuffer | string | Value[] | { [ key: string ]: Value }, search: Value, start?: bigint, ignoreCaseSpaceEtc?: boolean) =>
		value == null
			? false
			: value instanceof ArrayBuffer
				? containsBuffer(value, search as ArrayBuffer, start == null ? undefined : Number(start))
				: typeof value === "string"
					? containsString(value, search as string, start == null ? undefined : Number(start), ignoreCaseSpaceEtc)
					: Array.isArray(value)
						? (start ? value.slice(Number(start)) : value).findIndex((item) => equals(item, search)) >= 0
						: Object.values(value).some((item) => equals(item, search)),
	Type.functionType([
		[Type.Boolean, [Type.Buffer, Type.Buffer, Type.OptionalInteger]],
		[Type.Boolean, [Type.String, Type.String, Type.OptionalInteger, Type.OptionalBoolean]],
		[Type.Boolean, [Type.Array, Type.Any, Type.OptionalInteger]],
		[Type.Boolean, [Type.Object, Type.Any]],
	]),
);
