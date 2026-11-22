import { Constant } from "../../Constant.js";
import { ParserState } from "../../ParserState.js";
import { Value } from "../../Value.js";
import { Type } from "../../Type.js";
import { formatLiteralFloat } from "../Float.js";
import { formatLiteralInteger, int64 } from "../Integer.js";
import { formatLiteralBuffer } from "../Buffer.js";
import { formatLiteralString } from "../String.js";
import { formatLiteralTimestamp } from "../Timestamp.js";

const typeAN = Type.union(
	Type.Null,
	Type.Boolean,
	Type.Timestamp,
	Type.Float,
	Type.Integer,
	Type.Buffer,
	Type.String,
	Type.Array,
	Type.Object,
);

export const formatAN = (value: Value, whitespace?: string): string => {
	if (value == null) {
		return "null";
	}
	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}
	if (value instanceof Date) {
		return formatLiteralTimestamp(value);
	}
	if (typeof value === "number") {
		return formatLiteralFloat(value);
	}
	if (typeof value === "bigint") {
		return formatLiteralInteger(value);
	}
	if (value instanceof ArrayBuffer) {
		return formatLiteralBuffer(value);
	}
	if (typeof value === "string") {
		return formatLiteralString(value);
	}
	if (Array.isArray(value)) {
		const [prefix, suffix] = whitespace ? ["\n" + whitespace, "\n"] : ["", ""];
		const lines = Array.from(value, (i) =>
			`${prefix}${formatAN(i, whitespace)?.split("\n").join(prefix) ?? ""}`
		);
		return lines.length ? `[${lines.join(",")}${suffix}]` : "[]";
	}
	if (typeof value === "object") {
		const [prefix, suffix, separator] = whitespace ? ["\n" + whitespace, "\n", ": "] : ["", "", ":"];
		const lines = Object.entries(value).map(([k, v]) =>
			`${prefix}${formatLiteralString(k)}${separator}${formatAN(v, whitespace).split("\n").join(prefix) ?? ""}`
		);
		return lines.length ? `[${lines.join(",")}${suffix}]` : "[:]";
	}
	return "function";
};

const parseArray = (state: ParserState, firstValue: Value): Value[] => {
	const arr = [firstValue];
	while (!state.isEnded) {
		if (state.equals("]")) {
			state.next();
			return arr;
		}
		if (!state.equals(",")) {
			state.throwError("missing array value separator");
		}
		state.next();
		if (state.equals("]")) {
			state.next();
			return arr;
		}
		if (state.equals(",")) {
			arr.push(undefined);
			continue;
		}
		arr.push(parseLiteral(state));
	}
	state.throwError("missing closing array bracket");
};

const parseObject = (state: ParserState, firstKey: string): { [key: string]: Value } => {
	const obj = Object.create(null) as { [key: string]: Value };
	let key = firstKey;
	while (!state.isEnded) {
		if (!state.equals(":")) {
			state.throwError("missing object key separator");
		}
		state.next();
		obj[key] = state.equals(",") || state.equals("]") ? undefined : parseLiteral(state);
		if (state.equals("]")) {
			state.next();
			return obj;
		}
		if (!state.equals(",")) {
			state.throwError("missing object property separator");
		}
		state.next();
		if (state.equals("]")) {
			state.next();
			return obj;
		}
		const span = state.start();
		const nextKey = parseLiteral(state);
		if (typeof nextKey !== "string") {
			return span.throwError("object key must be a string");
		}
		key = nextKey;
	}
	state.throwError("missing closing object bracket");
};

const parseLiteral = (state: ParserState): Value => {
	if (state.isLiteral) {
		const value = state.literal.value;
		state.next();
		return value;
	}
	if (state.isType && state.type.isNull) {
		state.next();
		return undefined;
	}
	if (state.isIdentifier) {
		const token = state.identifier;
		if (token === "NaN") {
			state.next();
			return NaN;
		}
		if (token === "Infinity") {
			state.next();
			return Infinity;
		}
		state.throwError(`invalid value ${token}`);
	}
	if (state.equals("+", "-")) {
		const negative = state.equals("-");
		state.next();
		if (state.isIdentifier && state.identifier === "Infinity") {
			state.next();
			return negative ? -Infinity : Infinity;
		}
		if (!state.isLiteral || typeof state.literal.value !== "number" && typeof state.literal.value !== "bigint") {
			state.throwError("numeric literal expected after sign");
		}
		const value = state.literal.value;
		state.next();
		return negative
			? typeof value === "bigint" ? int64(-value) : -value
			: value;
	}
	if (state.equals("[")) {
		state.next();
		if (state.equals("]")) {
			state.next();
			return [];
		}
		if (state.equals(":")) {
			state.next();
			if (!state.equals("]")) {
				state.throwError("missing closing object bracket");
			}
			state.next();
			return Object.create(null) as { [key: string]: Value };
		}
		if (state.equals(",")) {
			return parseArray(state, undefined);
		}
		const span = state.start();
		const first = parseLiteral(state);
		if (state.equals(":")) {
			if (typeof first !== "string") {
				return span.throwError("object key must be a string");
			}
			return parseObject(state, first);
		}
		return parseArray(state, first);
	}
	state.throwError("missing value");
};

export const parseAN = (value: string | undefined): Value => {
	if (value == null) {
		return undefined;
	}
	const state = new ParserState(value).next();
	if (state.isEnded) {
		return undefined;
	}
	const result = parseLiteral(state);
	if (!state.isEnded) {
		state.throwError("unexpected token");
	}
	return result;
};

const funcFormatAN = new Constant(
	(value: Value, whitespace?: string) =>
		formatAN(value, whitespace),
	Type.functionType([[Type.String, [Type.Any, Type.OptionalString]]]),
);

const funcParseAN = new Constant(
	(value: string | undefined) =>
		parseAN(value),
	Type.functionType([[typeAN, [Type.OptionalString]]]),
);

export const globAN = Object.assign(Object.create(null), {
	Format: funcFormatAN,
	Parse: funcParseAN,
});
