import { Constant } from "../../Constant.js";
import { Value } from "../../Value.js";
import { Type } from "../../Type.js";

const typeJson = Type.union(Type.Void, Type.Boolean, Type.Timestamp, Type.Float, Type.Integer, Type.String, Type.Array, Type.Object);

export const formatJSON = (value: Value, whitespace?: string): string=>
	value == null ? "" : JSON.stringify(value, (_key: string, value: any)=> typeof value === "bigint" ? `"${value.toString()}"` : value as unknown, whitespace);

const funcFormatJSON = new Constant(
	(value: Value, whitespace?: string)=>
		formatJSON(value, whitespace),
	Type.functionType(Type.String, [typeJson, Type.OptionalString]),
);

const funcParseJSON = new Constant(
	(value: string | undefined)=>
		value == null ? undefined : JSON.parse(value) as Value,
	Type.functionType(typeJson, [Type.OptionalString]),
);

export const constJSON = {
	Format: funcFormatJSON,
	Parse: funcParseJSON,
};
