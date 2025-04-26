import { Constant } from '../Constant.js';
import { Type } from '../Type.js';

const typeTimestampPart = Type.functionType(Type.Number, [Type.Timestamp, Type.OptionalBoolean]);

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
	Type.functionType(Type.Timestamp, [], false, false),
);

export const funcYear = new Constant(
	(value: Date, utc = false)=> utc ? value.getUTCFullYear() : value.getFullYear(),
	typeTimestampPart,
);

export const funcMonth = new Constant(
	(value: Date, utc = false)=> 1 + (utc ? value.getUTCMonth() : value.getMonth()),
	typeTimestampPart,
);

export const funcMonthIndex = new Constant(
	(value: Date, utc = false)=> utc ? value.getUTCMonth() : value.getMonth(),
	typeTimestampPart,
);

export const funcWeekdayIndex = new Constant(
	(value: Date, utc = false)=> utc ? value.getUTCDay() : value.getDay(),
	typeTimestampPart,
);

export const funcDay = new Constant(
	(value: Date, utc = false)=> utc ? value.getUTCDate() : value.getDate(),
	typeTimestampPart,
);

export const funcHour = new Constant(
	(value: Date, utc = false)=> utc ? value.getUTCHours() : value.getHours(),
	typeTimestampPart,
);

export const funcMinute = new Constant(
	(value: Date, utc = false)=> utc ? value.getUTCMinutes() : value.getMinutes(),
	typeTimestampPart,
);

export const funcSecond = new Constant(
	(value: Date, utc = false)=> utc ? value.getUTCSeconds() : value.getSeconds(),
	typeTimestampPart,
);

export const funcMillisecond = new Constant(
	(value: Date, utc = false)=> utc ? value.getUTCMilliseconds() : value.getMilliseconds(),
	typeTimestampPart,
);

export const funcEpochTime = new Constant(
	(value: Date, epoch = new Date(0))=> value.getTime() - epoch.getTime(),
	Type.functionType(Type.Number, [Type.Timestamp, Type.OptionalTimestamp]),
);

const funcFormatTimestamp = new Constant(
	(value: Date)=> value?.toISOString(),
	Type.functionType(Type.String, [Type.Timestamp]),
);

const funcParseTimestamp = new Constant(
	(value: string)=> parseTimestamp(value),
	Type.functionType(Type.Timestamp, [Type.String]),
);

export const constTimestamp = new Constant({
	Now: funcNow.value,
	Format: funcFormatTimestamp.value,
	Parse: funcParseTimestamp.value,
}, Type.objectType({
	Now: funcNow.type,
	Format: funcFormatTimestamp.type,
	Parse: funcParseTimestamp.type,
}));
