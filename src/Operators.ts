import { funcOr, funcAnd, funcNot } from './GlobalFunctions.js';
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual, funcEqual, funcNotEqual, funcLike, funcNotLike,
	funcCoalesce, funcSwitch } from './BaseFunctions.js';
import { funcAppend, funcAt } from './CompositeFunctions.js';
import { funcAdd, funcSubtract, funcNegate, funcMultiply, funcDivide, funcPercentage, funcPower } from './MathFunctions.js';

export const operOr = funcOr.clone();
export const operAnd = funcAnd.clone();
export const operNot = funcNot.clone();
export const operGt = funcGreaterThan.clone();
export const operLt = funcLessThan.clone();
export const operGe = funcGreaterOrEqual.clone();
export const operLe = funcLessOrEqual.clone();
export const operEqual = funcEqual.clone();
export const operNotEqual = funcNotEqual.clone();
export const operLike = funcLike.clone();
export const operNotLike = funcNotLike.clone();
export const operCoalesce = funcCoalesce.clone();
export const operSwitch = funcSwitch.clone();
export const operAppend = funcAppend.clone();
export const operAt = funcAt.clone();
export const operAdd = funcAdd.clone();
export const operSub = funcSubtract.clone();
export const operNeg = funcNegate.clone();
export const operMul = funcMultiply.clone();
export const operDiv = funcDivide.clone();
export const operPct = funcPercentage.clone();
export const operPow = funcPower.clone();
