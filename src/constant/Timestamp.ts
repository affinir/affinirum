import { Constant } from "../Constant.js";
import { Type } from "../Type.js";

export type TimestampEncoding = "int64" | "int64le";

const typeTimestampPart = Type.functionType(Type.Integer, [Type.Timestamp, Type.OptionalBoolean]);
const typeTimestampSince = Type.functionType(Type.Real, [Type.Timestamp, Type.Timestamp]);

export const encodeTimestamp = (value?: Date, encoding: TimestampEncoding = "int64")=> {
	const buf = new ArrayBuffer(8);
	const dv = new DataView(buf);
	dv.setBigInt64(0, BigInt(value?.getTime() ?? 0), encoding === "int64le");
	return buf;
};

export const decodeTimestamp = (value?: ArrayBuffer, encoding: TimestampEncoding = "int64", byteOffset?: bigint)=>
	value ? new Date(Number(new DataView(value).getBigInt64(byteOffset == null ? 0 : Number(byteOffset), encoding === "int64le"))) : undefined;

export const formatTimestamp = (value?: Date, radix?: number)=> {
	if (value == null) {
		return "";
	}
	const str = value.toISOString();
	switch (radix) {
		case 1: return str.slice(0, 4);
		case 2: return str.slice(5, 7);
		case 3: return str.slice(8, 10);
		case 4: return str.slice(11, 13);
		case 5: return str.slice(14, 16);
		case 6: return str.slice(17, 19);
		case 7: return str.slice(20, 23);
		default: return str;
	}
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
	(value: ArrayBuffer, encoding: "int64" | "int64le" = "int64", byteOffset?: bigint)=>
		decodeTimestamp(value, encoding, byteOffset),
	Type.functionType(Type.OptionalTimestamp, [Type.Buffer, Type.OptionalString, Type.OptionalInteger]),
);

const funcParseTimestamp = new Constant(
	(value: string)=>
		parseTimestamp(value),
	Type.functionType(Type.OptionalTimestamp, [Type.String]),
);

export const constTimestamp = {
	Now: funcNow,
	Epoch: funcEpochTimestamp,
	Decode: funcDecodeTimestamp,
	Parse: funcParseTimestamp,
};
