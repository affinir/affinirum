import { Constant } from "../../Constant.js";
import { Value } from "src/Value.js";
import { Type } from "../../Type.js";

const typeJson = Type.union(Type.Void, Type.Boolean, Type.Timestamp, Type.Real, Type.Integer, Type.String, Type.Array, Type.Object);

export const formatJSON = (value: Value, whitespace?: string): string=>
	JSON.stringify(value, (_key: string, value: any)=> typeof value === "bigint" ? `"${value.toString()}"` : value as unknown, whitespace);

const funcFormatJSON = new Constant(
	(value: Value, whitespace?: string)=>
		formatJSON(value ?? null, whitespace),
	Type.functionType(Type.String, [typeJson, Type.OptionalString]),
);

const funcParseJSON = new Constant(
	(value: string)=>
		JSON.parse(value) as Value,
	Type.functionType(typeJson, [Type.String]),
);

export const constJSON = {
	Format: funcFormatJSON,
	Parse: funcParseJSON,
};
