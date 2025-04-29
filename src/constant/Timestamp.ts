import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const typeTimestampPart = Type.functionType(Type.Integer, [Type.Timestamp, Type.OptionalBoolean]);

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
		BigInt(utc ? value.getUTCFullYear() : value.getFullYear()),
	typeTimestampPart,
);

export const funcMonth = new Constant(
	(value: Date, utc = false)=>
		BigInt(1 + (utc ? value.getUTCMonth() : value.getMonth())),
	typeTimestampPart,
);

export const funcMonthIndex = new Constant(
	(value: Date, utc = false)=>
		BigInt(utc ? value.getUTCMonth() : value.getMonth()),
	typeTimestampPart,
);

export const funcWeekdayIndex = new Constant(
	(value: Date, utc = false)=>
		BigInt(utc ? value.getUTCDay() : value.getDay()),
	typeTimestampPart,
);

export const funcDay = new Constant(
	(value: Date, utc = false)=>
		BigInt(utc ? value.getUTCDate() : value.getDate()),
	typeTimestampPart,
);

export const funcHour = new Constant(
	(value: Date, utc = false)=>
		BigInt(utc ? value.getUTCHours() : value.getHours()),
	typeTimestampPart,
);

export const funcMinute = new Constant(
	(value: Date, utc = false)=>
		BigInt(utc ? value.getUTCMinutes() : value.getMinutes()),
	typeTimestampPart,
);

export const funcSecond = new Constant(
	(value: Date, utc = false)=>
		BigInt(utc ? value.getUTCSeconds() : value.getSeconds()),
	typeTimestampPart,
);

export const funcMillisecond = new Constant(
	(value: Date, utc = false)=>
		BigInt(utc ? value.getUTCMilliseconds() : value.getMilliseconds()),
	typeTimestampPart,
);

export const funcEpochTime = new Constant(
	(value: Date, epoch = new Date(0))=>
		BigInt.asIntN(64, BigInt(value.getTime() - epoch.getTime())),
	Type.functionType(Type.Integer, [Type.Timestamp, Type.OptionalTimestamp]),
);

const funcEpochTimestamp = new Constant(
	(value: number | bigint, epoch = new Date(0))=>
		new Date(Number(value) + epoch.getTime()),
	Type.functionType(Type.Timestamp, [Type.union(Type.Float, Type.Integer), Type.OptionalTimestamp]),
);

const funcParseTimestamp = new Constant(
	(value: string)=> parseTimestamp(value),
	Type.functionType(Type.OptionalTimestamp, [Type.String]),
);

export const constTimestamp = {
	Now: funcNow,
	Epoch: funcEpochTimestamp,
	Parse: funcParseTimestamp,
};
