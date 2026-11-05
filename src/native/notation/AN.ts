import { Constant } from "../../Constant.js";
import { ParserState } from "../../ParserState.js";
import { Value } from "../../Value.js";
import { Type } from "../../Type.js";
import { funcAdd } from "../Aggregable.js";
import { boundInteger } from "../Integer.js";
import { formatLiteralNumber, funcSubtract } from "../Number.js";
import { formatLiteralBuffer } from "../Buffer.js";
import { formatLiteralString } from "../String.js";
import { formatLiteralTimestamp } from "../Timestamp.js";

const typeAN = Type.union(
	Type.Void,
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
	if (typeof value === "bigint" || typeof value === "number") {
		return formatLiteralNumber(value);
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
	while (!state.isEmpty) {
		if (state.isBracketsClose) {
			state.next();
			return arr;
		}
		if (!state.isComma) {
			state.throwError("missing array value separator");
		}
		state.next();
		if (state.isBracketsClose) {
			state.next();
			return arr;
		}
		if (state.isComma) {
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
	while (!state.isEmpty) {
		if (!state.isColon) {
			state.throwError("missing object key separator");
		}
		state.next();
		obj[key] = state.isComma || state.isBracketsClose ? undefined : parseLiteral(state);
		if (state.isBracketsClose) {
			state.next();
			return obj;
		}
		if (!state.isComma) {
			state.throwError("missing object property separator");
		}
		state.next();
		if (state.isBracketsClose) {
			state.next();
			return obj;
		}
		const nextKey = parseLiteral(state);
		if (typeof nextKey !== "string") {
			state.throwError("object key must be a string");
		}
		key = nextKey;
	}
	state.throwError("missing closing object bracket");
};

const parseLiteral = (state: ParserState): Value => {
	if (state.isLiteral) {
		const value = state.literal.value;
		if (value instanceof Date && Number.isNaN(value.getTime())) {
			state.throwError("invalid timestamp");
		}
		state.next();
		return value;
	}
	if (state.isType && state.type.isVoid) {
		state.next();
		return undefined;
	}
	if (state.isToken) {
		const token = state.token;
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
	if (state.isOperator && (state.operator === funcAdd || state.operator === funcSubtract)) {
		const negative = state.operator === funcSubtract;
		state.next();
		if (state.isToken && state.token === "Infinity") {
			state.next();
			return negative ? -Infinity : Infinity;
		}
		if (!state.isLiteral || typeof state.literal.value !== "number" && typeof state.literal.value !== "bigint") {
			state.throwError("numeric literal expected after sign");
		}
		const value = state.literal.value;
		state.next();
		return negative
			? typeof value === "bigint" ? boundInteger(-value) : -value
			: value;
	}
	if (state.isBracketsOpen) {
		state.next();
		if (state.isBracketsClose) {
			state.next();
			return [];
		}
		if (state.isColon) {
			state.next();
			if (!state.isBracketsClose) {
				state.throwError("missing closing object bracket");
			}
			state.next();
			return Object.create(null) as { [key: string]: Value };
		}
		if (state.isComma) {
			return parseArray(state, undefined);
		}
		const first = parseLiteral(state);
		if (state.isColon) {
			if (typeof first !== "string") {
				state.throwError("object key must be a string");
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
	if (state.isEmpty) {
		return undefined;
	}
	const result = parseLiteral(state);
	if (!state.isEmpty) {
		state.throwError("unexpected token");
	}
	return result;
};

const funcFormatAN = new Constant(
	(value: Value, whitespace?: string) =>
		formatAN(value, whitespace),
	Type.functionType(Type.String, [Type.Unknown, Type.OptionalString]),
);

const funcParseAN = new Constant(
	(value: string | undefined) =>
		parseAN(value),
	Type.functionType(typeAN, [Type.OptionalString]),
);

export const constAN = Object.assign(Object.create(null), {
	Format: funcFormatAN,
	Parse: funcParseAN,
});
