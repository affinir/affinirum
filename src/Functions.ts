import { Constant } from "./Constant.js";
import { funcFirst, funcLast, funcFirstIndex, funcLastIndex, funcEvery, funcAny,
	funcFlatten, funcReverse, funcMutate, funcFilter, funcReduce, funcCompose, funcPrepend, funcAppend } from "./constant/Array.js";
import { funcByte } from "./constant/Buffer.js";
import { funcAdd, funcSlice, funcSplice, funcInject } from "./constant/Enumerable.js";
import { funcLength, funcContains, funcAt, funcHas } from "./constant/Iterable.js";
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual, funcSubtract, funcMultiply, funcDivide, funcRemainder, funcModulo,
	funcPower, funcRoot, funcNegate, funcCast } from "./constant/Number.js";
import { funcEntries, funcKeys, funcValues } from "./constant/Object.js";
import { funcLike, funcUnlike, funcStartsWith, funcEndsWith,
	funcChar, funcCharCode, funcTrim, funcTrimStart, funcTrimEnd, funcLowerCase, funcUpperCase, funcSplit } from "./constant/String.js";
import { funcYear, funcMonth, funcMonthIndex, funcWeekdayIndex, funcDay,
	funcHour, funcMinute, funcSecond, funcMillisecond, funcEpochTime } from "./constant/Timestamp.js";
import { funcCoalesce, funcEqual, funcNotEqual, funcEncode, funcFormat } from "./constant/Unknown.js";

export const Functions: [string, Constant][] = [
	// Array
	["First", funcFirst],
	["Last", funcLast],
	["FirstIndex", funcFirstIndex],
	["LastIndex", funcLastIndex],
	["Any", funcAny],
	["Every", funcEvery],
	["Flatten", funcFlatten],
	["Reverse", funcReverse],
	["Mutate", funcMutate],
	["Filter", funcFilter],
	["Reduce", funcReduce],
	["Compose", funcCompose],
	["Prepend", funcPrepend],
	["Append", funcAppend],
	// Buffer
	["Byte", funcByte],
	// Enumerable
	["Add", funcAdd],
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
	// Unknown
	["Coalesce", funcCoalesce],
	["Equal", funcEqual],
	["Unequal", funcNotEqual],
	["Encode", funcEncode],
	["Format", funcFormat],
];
