import { FunctionSignature } from './FunctionSignature.js';
import { Type, Value } from './Type.js';

export const FUNCTION_ARG_MAX = 16536;

export class FunctionDefinition {

	protected readonly _signature: FunctionSignature;

	constructor(
		protected readonly _value: (...values: any[])=> Value,
		type: Type,
		argTypes: Type[],
		minArity?: number,
		maxArity?: number,
		typeInference?: number,
	) {
		this._signature = new FunctionSignature(type, argTypes, minArity, maxArity, typeInference);
	}

	get evaluate(): (...values: any[])=> Value {
		return this._value;
	}

	get signature(): FunctionSignature {
		return this._signature
	}

}
