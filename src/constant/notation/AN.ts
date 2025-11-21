import { Constant } from "../../Constant.js";
import { Value } from "../../Value.js";
import { Type } from "../../Type.js";
import { formatReal } from "../Real.js";
import { formatBuffer } from "../Buffer.js";

export const formatAN = (value: Value, whitespace?: string): string=> {
	if (value == null) {
		return "null";
	}
	if (typeof value === "boolean") {
		return value.toString();
	}
	if (value instanceof Date) {
		return `@${value.toISOString()}`;
	}
	if (typeof value === "number") {
		return formatReal(value);
	}
	if (typeof value === "bigint") {
		return value.toString();
	}
	if (value instanceof ArrayBuffer) {
		return `#${formatBuffer(value)}`;
	}
	if (typeof value === "string") {
		return `"${value}"`;
	}
	if (Array.isArray(value)) {
		const [prefix, suffix] = whitespace ? ["\n" + whitespace, "\n"] : ["", ""];
		const lines = value.map((i)=> `${prefix}${formatAN(i, whitespace).split("\n").join(prefix)}`);
		return `[${lines.join(",")}${suffix}]`;
	}
	if (typeof value === "object") {
		const [prefix, suffix] = whitespace ? ["\n" + whitespace, "\n"] : ["", ""];
		const lines = Object.entries(value).map(([k, v])=> `${prefix}"${k}":${formatAN(v, whitespace).split("\n").join(prefix)}`);
		return `[${lines.join(",")}${suffix}]`;
	}
	return "function";
};

const funcFormatAN = new Constant(
	(value: Value, whitespace?: string)=>
		formatAN(value ?? null, whitespace),
	Type.functionType(Type.String, [Type.Unknown, Type.OptionalString]),
);

export const constAN = {
	Format: funcFormatAN,
};
