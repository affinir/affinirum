import { Constant } from "../Constant.js";
import { Type } from "../Type.js";

export type TimestampEncoding = "i64" | "i64le";

const typeTimestampPart = Type.functionType(Type.Integer, [Type.Timestamp, Type.OptionalBoolean]);
const typeTimestampSince = Type.functionType(Type.Float, [Type.Timestamp, Type.Timestamp]);

export const encodeTimestamp = (value: Date, encoding: TimestampEncoding = "i64")=> {
	switch (encoding) {
		case "i64": break;
		case "i64le": break;
		default: throw new Error(`${encoding} encoding not supported`);
	}
	const dv = new DataView(new BigInt64Array(1).buffer);
	const littleEndian = encoding.endsWith("le");
	dv.setBigInt64(0, BigInt(value?.getTime() ?? 0), littleEndian);
	return dv.buffer;
};

export const decodeTimestamp = (value?: ArrayBuffer, encoding: TimestampEncoding = "i64", byteOffset?: bigint)=> {
	switch (encoding) {
		case "i64": break;
		case "i64le": break;
		default: throw new Error(`${encoding} encoding not supported`);
	}
	const offset = byteOffset == null ? 0 : Number(byteOffset);
	if (!value || offset < 0 || value.byteLength < offset + 8) {
		return undefined;
	}
	const littleEndian = encoding.endsWith("le");
	return new Date(Number(new DataView(value).getBigInt64(offset, littleEndian)));
};

export const formatTimestamp = (value: Date, template?: string)=> {
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

const parseTimestamp = (value?: number | string)=> {
	if (value == null) {
		return undefined;
	}
	const date = new Date(value);
	return isNaN(date.getTime()) ? undefined : date;
};

const funcNow = new Constant(
	()=>
		new Date(),
	Type.functionType(Type.Timestamp, []),
	false,
);

export const funcYear = new Constant(
	(value: Date, utc = false)=>
		value ? BigInt(utc ? value.getUTCFullYear() : value.getFullYear()) : undefined,
	typeTimestampPart,
);

export const funcMonth = new Constant(
	(value: Date, utc = false)=>
		value ? BigInt(1 + (utc ? value.getUTCMonth() : value.getMonth())) : undefined,
	typeTimestampPart,
);

export const funcMonthIndex = new Constant(
	(value: Date, utc = false)=>
		value ? BigInt(utc ? value.getUTCMonth() : value.getMonth()) : undefined,
	typeTimestampPart,
);

export const funcWeekdayIndex = new Constant(
	(value: Date, utc = false)=>
		value ? BigInt(utc ? value.getUTCDay() : value.getDay()) : undefined,
	typeTimestampPart,
);

export const funcDay = new Constant(
	(value: Date, utc = false)=>
		value ? BigInt(utc ? value.getUTCDate() : value.getDate()) : undefined,
	typeTimestampPart,
);

export const funcHour = new Constant(
	(value: Date, utc = false)=>
		value ? BigInt(utc ? value.getUTCHours() : value.getHours()) : undefined,
	typeTimestampPart,
);

export const funcMinute = new Constant(
	(value: Date, utc = false)=>
		value ? BigInt(utc ? value.getUTCMinutes() : value.getMinutes()) : undefined,
	typeTimestampPart,
);

export const funcSecond = new Constant(
	(value: Date, utc = false)=>
		value ? BigInt(utc ? value.getUTCSeconds() : value.getSeconds()) : undefined,
	typeTimestampPart,
);

export const funcMillisecond = new Constant(
	(value: Date, utc = false)=>
		value ? BigInt(utc ? value.getUTCMilliseconds() : value.getMilliseconds()) : undefined,
	typeTimestampPart,
);

export const funcEpochTime = new Constant(
	(value: Date, epoch = new Date(0))=>
		value ? BigInt.asIntN(64, BigInt(value.getTime() - epoch.getTime())) : undefined,
	Type.functionType(Type.Integer, [Type.Timestamp, Type.OptionalTimestamp]),
);

export const funcDaysSince = new Constant(
	(value1: Date, value2: Date)=>
		(value1?.getTime() - value2?.getTime()) / 86400000.0,
	typeTimestampSince,
);

export const funcHoursSince = new Constant(
	(value1: Date, value2: Date)=>
		(value1?.getTime() - value2?.getTime()) / 3600000.0,
	typeTimestampSince,
);

export const funcMinutesSince = new Constant(
	(value1: Date, value2: Date)=>
		(value1?.getTime() - value2?.getTime()) / 60000.0,
	typeTimestampSince,
);

export const funcSecondsSince = new Constant(
	(value1: Date, value2: Date)=>
		(value1?.getTime() - value2?.getTime()) / 1000.0,
	typeTimestampSince,
);

const funcEpochTimestamp = new Constant(
	(value: number | bigint, epoch = new Date(0))=>
		new Date(Number(value ?? 0) + epoch?.getTime()),
	Type.functionType(Type.Timestamp, [Type.Number, Type.OptionalTimestamp]),
);

const funcDecodeTimestamp = new Constant(
	(value: ArrayBuffer, encoding: TimestampEncoding = "i64", byteOffset?: bigint)=>
		decodeTimestamp(value, encoding, byteOffset),
	Type.functionType(Type.OptionalTimestamp, [Type.OptionalBuffer, Type.OptionalString, Type.OptionalInteger]),
);

const funcParseTimestamp = new Constant(
	(value: string | undefined)=>
		parseTimestamp(value),
	Type.functionType(Type.OptionalTimestamp, [Type.OptionalString]),
);

export const constTimestamp = {
	Now: funcNow,
	Epoch: funcEpochTimestamp,
	Decode: funcDecodeTimestamp,
	Parse: funcParseTimestamp,
};
