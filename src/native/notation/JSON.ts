import { Constant } from "../../Constant.js";
import { normalize, Value } from "../../Value.js";
import { Type } from "../../Type.js";

const typeJson = Type.union(Type.Null, Type.Boolean, Type.Timestamp, Type.Float, Type.Integer, Type.String, Type.Array, Type.Object);

export const formatJSON = (value: Value, whitespace?: string): string =>
	value == null ? "null" : JSON.stringify(
		value,
		(_key: string, value: any) => typeof value === "bigint" ? value.toString() : value as unknown ?? null,
		whitespace,
	);

const parseJSON = (value: string | undefined): Value =>
	value == null ? undefined : normalize(JSON.parse(value) as Value);

const funcFormatJSON = new Constant(
	formatJSON,
	Type.functionType([[Type.String, [typeJson, Type.OptionalString]]]),
);

const funcParseJSON = new Constant(
	parseJSON,
	Type.functionType([[typeJson, [Type.OptionalString]]]),
);

const funcParseJSONObject = new Constant(
	(value: string | undefined) => {
		const result = parseJSON(value);
		if (!Type.Object.acceptsValue(result)) {
			throw new TypeError(`parsed value type ${Type.of(result)} mismatch with expected type ${Type.Object}`);
		}
		return result;
	},
	Type.functionType([[Type.Object, [Type.OptionalString]]]),
);

const funcParseJSONArray = new Constant(
	(value: string | undefined) => {
		const result = parseJSON(value);
		if (!Array.isArray(result)) {
			throw new TypeError(`parsed value type ${Type.of(result)} mismatch with expected type ${Type.Array}`);
		}
		return result;
	},
	Type.functionType([[Type.Array, [Type.OptionalString]]]),
);

export const globJSON = Object.assign(Object.create(null), {
	Format: funcFormatJSON,
	Parse: funcParseJSON,
	ParseObject: funcParseJSONObject,
	ParseArray: funcParseJSONArray,
});
