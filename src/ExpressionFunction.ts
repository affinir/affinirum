import { Type, Value } from './Type.js';

export const FUNCTION_ARG_MAX = 16536;

export class ExpressionFunction {

	constructor(
		protected _function: (...values: any[])=> Value,
		protected _type: Type,
		protected _argTypes: Type[],
		protected _minArity?: number,
		protected _maxArity?: number,
		protected _typeInference?: (index: number, type: string, mask: string)=> boolean
	) {}

	clone(): ExpressionFunction {
		return new ExpressionFunction(this._function, this._type, this._argTypes, this._minArity, this._maxArity, this._typeInference);
	}

	get evaluate(): (...values: any[])=> Value {
		return this._function;
	}

	get minArity(): number {
		return this._minArity ?? this._argTypes.length;
	}

	get maxArity(): number {
		return this._maxArity ?? this._argTypes.length;
	}

	get argTypes(): Type[] {
		return this._argTypes;
	}

	get type(): Type {
		return this._type;
	}

	typeInference(index: number): (type: string, mask: string)=> boolean {
		return (t: string, m: string)=> this._typeInference ? this._typeInference(index, t, m) : true;
	}

}

export const isCaseSpaceEtc = (c: string)=> (c < 'a' || c > 'z') && (c < '0' || c > '9');
