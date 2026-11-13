import { Constant } from "../Constant.js";
import { Type } from "../Type.js";
import { isNumericSymbol } from "./Number.js";

export type TimestampEncoding = "i32" | "i32le" | "i64" | "i64le";

const minuteMilliseconds = 60000;
const typeTimestampPart = Type.functionType([[Type.Integer, [Type.Timestamp, Type.OptionalBoolean]]]);
const typeTimestampSince = Type.functionType([[Type.Float, [Type.Timestamp, Type.Timestamp]]]);

const isDateSeparatorSymbol = (c: string) => c === "-";
const isTimeSeparatorSymbol = (c: string) => c === ":";
const isDateTimeSeparatorSymbol = (c: string) => c === "T" || c === " " || c === "@";
const isDateSymbol = (c: string) => isNumericSymbol(c) || isDateSeparatorSymbol(c);
const isTimeSymbol = (c: string) => isNumericSymbol(c) || isTimeSeparatorSymbol(c);

export const encodeTimestamp = (value: Date, encoding: TimestampEncoding = "i64") => {
	const littleEndian = encoding.endsWith("le");
	switch (encoding) {
		case "i32":
		case "i32le": {
			const dv = new DataView(new Int32Array(1).buffer);
			const timer = value?.getTime() ?? 0;
			dv.setInt32(0, (Number.isNaN(timer) ? 0 : timer) / minuteMilliseconds, littleEndian);
			return dv.buffer;
		}
		case "i64":
		case "i64le": {
			const dv = new DataView(new BigInt64Array(1).buffer);
			const timer = value?.getTime() ?? 0;
			dv.setBigInt64(0, BigInt(Number.isNaN(timer) ? 0 : timer), littleEndian);
			return dv.buffer;
		}
		default: throw new Error(`${encoding} encoding not supported`);
	}
};

export const decodeTimestamp = (value?: ArrayBuffer, encoding: TimestampEncoding = "i64", byteOffset?: number) => {
	const littleEndian = encoding.endsWith("le");
	const offset = byteOffset ?? 0;
	if (!value || offset < 0) {
		return undefined;
	}
	const dv = new DataView(value);
	switch (encoding) {
		case "i32":
		case "i32le": {
			const ts = value.byteLength < offset + 4
				? undefined
				: new Date(dv.getInt32(offset, littleEndian) * minuteMilliseconds);
			return !ts || Number.isNaN(ts.getTime()) ? undefined : ts;
		}
		case "i64":
		case "i64le": {
			const ts = value.byteLength < offset + 8
				? undefined
				: new Date(Number(dv.getBigInt64(offset, littleEndian)));
			return !ts || Number.isNaN(ts.getTime()) ? undefined : ts;
		}
		default: throw new Error(`${encoding} encoding not supported`);
	}
};

export const formatTimestamp = (value: Date, template?: string) => {
	if (!template || typeof template !== "string") {
		return value.toISOString();
	}
	const map = template.includes("Z")
		? {
			YYYY: value.getUTCFullYear(),
			YY: value.getUTCFullYear() % 100,
			MM: value.getUTCMonth() + 1,
			DD: value.getUTCDate(),
			hh: value.getUTCHours(),
			mm: value.getUTCMinutes(),
			ss: value.getUTCSeconds(),
			fff: value.getUTCMilliseconds(),
		}
		: {
			YYYY: value.getFullYear(),
			YY: value.getFullYear() % 100,
			MM: value.getMonth() + 1,
			DD: value.getDate(),
			hh: value.getHours(),
			mm: value.getMinutes(),
			ss: value.getSeconds(),
			fff: value.getMilliseconds(),
		};
	return template.replaceAll("Z", "")
		.replace("YYYY", map.YYYY.toString())
		.replace("YY", map.YY.toString().padStart(2, "0"))
		.replace("MM", map.MM.toString().padStart(2, "0"))
		.replace("DD", map.DD.toString().padStart(2, "0"))
		.replace("hh", map.hh.toString().padStart(2, "0"))
		.replace("mm", map.mm.toString().padStart(2, "0"))
		.replace("ss", map.ss.toString().padStart(2, "0"))
		.replace("fff", map.fff.toString().padStart(3, "0"));
};

const parseTimestamp = (value?: number | string) => {
	if (value == null) {
		return undefined;
	}
	const date = new Date(value);
	return isNaN(date.getTime()) ? undefined : date;
};

export const formatLiteralTimestamp = (value: Date) => `@${formatTimestamp(value)}`;

export const parseLiteralTimestamp = (value: string, offset = 0) => {
	let i = offset + 1;
	while (isDateSymbol(value.charAt(i))) {
		++i;
	}
	if (isDateTimeSeparatorSymbol(value.charAt(i))) {
		++i;
		while (isTimeSymbol(value.charAt(i))) {
			++i;
		}
		if (value.charAt(i) === "."
			&& isNumericSymbol(value.charAt(i + 1))) {
			++i;
			while (isNumericSymbol(value.charAt(i))) {
				++i;
			}
			if (value.charAt(i) === "Z") {
				++i;
			}
		}
	}
	return [new Date(value.slice(offset + 1, i)), i] as const;
};

const funcNow = new Constant(
	() =>
		new Date(),
	Type.functionType([[Type.Timestamp, []]], true),
);

export const funcYear = new Constant(
	(value: Date, utc = false) =>
		value ? BigInt(utc ? value.getUTCFullYear() : value.getFullYear()) : undefined,
	typeTimestampPart,
);

export const funcMonth = new Constant(
	(value: Date, utc = false) =>
		value ? BigInt(1 + (utc ? value.getUTCMonth() : value.getMonth())) : undefined,
	typeTimestampPart,
);

export const funcMonthIndex = new Constant(
	(value: Date, utc = false) =>
		value ? BigInt(utc ? value.getUTCMonth() : value.getMonth()) : undefined,
	typeTimestampPart,
);

export const funcWeekdayIndex = new Constant(
	(value: Date, utc = false) =>
		value ? BigInt(utc ? value.getUTCDay() : value.getDay()) : undefined,
	typeTimestampPart,
);

export const funcDay = new Constant(
	(value: Date, utc = false) =>
		value ? BigInt(utc ? value.getUTCDate() : value.getDate()) : undefined,
	typeTimestampPart,
);

export const funcHour = new Constant(
	(value: Date, utc = false) =>
		value ? BigInt(utc ? value.getUTCHours() : value.getHours()) : undefined,
	typeTimestampPart,
);

export const funcMinute = new Constant(
	(value: Date, utc = false) =>
		value ? BigInt(utc ? value.getUTCMinutes() : value.getMinutes()) : undefined,
	typeTimestampPart,
);

export const funcSecond = new Constant(
	(value: Date, utc = false) =>
		value ? BigInt(utc ? value.getUTCSeconds() : value.getSeconds()) : undefined,
	typeTimestampPart,
);

export const funcMillisecond = new Constant(
	(value: Date, utc = false) =>
		value ? BigInt(utc ? value.getUTCMilliseconds() : value.getMilliseconds()) : undefined,
	typeTimestampPart,
);

export const funcEpochTime = new Constant(
	(value: Date, epoch = new Date(0)) =>
		value ? BigInt(value.getTime() - epoch.getTime()) : undefined,
	Type.functionType([[Type.Integer, [Type.Timestamp, Type.OptionalTimestamp]]]),
);

export const funcDaysSince = new Constant(
	(value1: Date, value2: Date) =>
		(value1?.getTime() - value2?.getTime()) / 86400000.0,
	typeTimestampSince,
);

export const funcHoursSince = new Constant(
	(value1: Date, value2: Date) =>
		(value1?.getTime() - value2?.getTime()) / 3600000.0,
	typeTimestampSince,
);

export const funcMinutesSince = new Constant(
	(value1: Date, value2: Date) =>
		(value1?.getTime() - value2?.getTime()) / 60000.0,
	typeTimestampSince,
);

export const funcSecondsSince = new Constant(
	(value1: Date, value2: Date) =>
		(value1?.getTime() - value2?.getTime()) / 1000.0,
	typeTimestampSince,
);

const funcEpochTimestamp = new Constant(
	(value: number | bigint, epoch = new Date(0)) => {
		const ts = new Date(Number(value ?? 0) + epoch?.getTime());
		return Number.isNaN(ts.getTime()) ? undefined : ts;
	},
	Type.functionType([[Type.Timestamp, [Type.Number, Type.OptionalTimestamp]]]),
);

const funcDecodeTimestamp = new Constant(
	(value: ArrayBuffer | undefined, encoding: TimestampEncoding = "i64", byteOffset?: bigint) =>
		decodeTimestamp(value, encoding, byteOffset == null ? undefined : Number(byteOffset)),
	Type.functionType([[Type.OptionalTimestamp, [Type.OptionalBuffer, Type.OptionalString, Type.OptionalInteger]]]),
);

const funcParseTimestamp = new Constant(
	(value: string | undefined) =>
		parseTimestamp(value),
	Type.functionType([[Type.OptionalTimestamp, [Type.OptionalString]]]),
);

export const constTimestamp = Object.assign(Object.create(null), {
	Now: funcNow,
	Epoch: funcEpochTimestamp,
	Decode: funcDecodeTimestamp,
	Parse: funcParseTimestamp,
});
