import { Constant } from "./Constant.js";
import { funcAdd } from "./native/Aggregable.js";
import { funcFirst, funcLast, funcFirstIndex, funcLastIndex, funcEvery, funcAny,
	funcFlatten, funcReverse, funcDerive, funcFilter, funcReduce, funcCompose, funcPrepend, funcAppend } from "./native/Array.js";
import { funcByte } from "./native/Buffer.js";
import { funcSlice, funcSplice, funcInject } from "./native/Enumerable.js";
import { funcLength, funcContains, funcAt, funcHas } from "./native/Iterable.js";
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual, funcSubtract, funcMultiply, funcDivide, funcRemainder, funcModulo,
	funcPower, funcRoot, funcNegate, funcCast, funcCastToFloat, funcCastToInteger } from "./native/Number.js";
import { funcEntries, funcKeys, funcValues } from "./native/Object.js";
import { funcLike, funcUnlike, funcStartsWith, funcEndsWith,
	funcChar, funcCharCode, funcTrim, funcTrimStart, funcTrimEnd, funcLowerCase, funcUpperCase, funcSplit, funcReplaceWith } from "./native/String.js";
import { funcYear, funcMonth, funcMonthIndex, funcWeekdayIndex, funcDay, funcHour, funcMinute, funcSecond, funcMillisecond, funcEpochTime,
	funcDaysSince, funcHoursSince, funcMinutesSince, funcSecondsSince } from "./native/Timestamp.js";
import { funcCoalesce, funcEqual, funcNotEqual, funcEncode, funcFormat } from "./native/Unknown.js";

export const Functions: [string, Constant][] = [
	// Aggregable
	["Add", funcAdd],
	// Array
	["First", funcFirst],
	["Last", funcLast],
	["FirstIndex", funcFirstIndex],
	["LastIndex", funcLastIndex],
	["Any", funcAny],
	["Every", funcEvery],
	["Flatten", funcFlatten],
	["Reverse", funcReverse],
	["Derive", funcDerive],
	["Filter", funcFilter],
	["Reduce", funcReduce],
	["Compose", funcCompose],
	["Prepend", funcPrepend],
	["Append", funcAppend],
	// Buffer
	["Byte", funcByte],
	// Enumerable
	["Slice", funcSlice],
	["Splice", funcSplice],
	["Inject", funcInject],
	// Iterable
	["Length", funcLength],
	["Contains", funcContains],
	["At", funcAt],
	["Has", funcHas],
	// Number
	["GreaterThan", funcGreaterThan],
	["LessThan", funcLessThan],
	["GreaterOrEqual", funcGreaterOrEqual],
	["LessOrEqual", funcLessOrEqual],
	["Subtract", funcSubtract],
	["Multiply", funcMultiply],
	["Divide", funcDivide],
	["Remainder", funcRemainder],
	["Modulo", funcModulo],
	["Power", funcPower],
	["Root", funcRoot],
	["Negate", funcNegate],
	["Cast", funcCast],
	["CastToFloat", funcCastToFloat],
	["CastToInteger", funcCastToInteger],
	// Object
	["Entries", funcEntries],
	["Keys", funcKeys],
	["Values", funcValues],
	// String
	["Like", funcLike],
	["Unlike", funcUnlike],
	["StartsWith", funcStartsWith],
	["EndsWith", funcEndsWith],
	["Char", funcChar],
	["CharCode", funcCharCode],
	["Trim", funcTrim],
	["TrimStart", funcTrimStart],
	["TrimEnd", funcTrimEnd],
	["LowerCase", funcLowerCase],
	["UpperCase", funcUpperCase],
	["Split", funcSplit],
	["ReplaceWith", funcReplaceWith],
	// Timestamp
	["Year", funcYear],
	["Month", funcMonth],
	["MonthIndex", funcMonthIndex],
	["WeekdayIndex", funcWeekdayIndex],
	["Day", funcDay],
	["Hour", funcHour],
	["Minute", funcMinute],
	["Second", funcSecond],
	["Millisecond", funcMillisecond],
	["EpochTime", funcEpochTime],
	["DaysSince", funcDaysSince],
	["HoursSince", funcHoursSince],
	["MinutesSince", funcMinutesSince],
	["SecondsSince", funcSecondsSince],
	// Unknown
	["Coalesce", funcCoalesce],
	["Equal", funcEqual],
	["Unequal", funcNotEqual],
	["Encode", funcEncode],
	["Format", funcFormat],
];
