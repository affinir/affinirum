import { ExpressionValueType, ExpressionType, typeAny } from './ExpressionType.js';

export class ExpressionVariable {

	constructor(
		protected _value: ExpressionValueType | undefined = undefined,
		protected _type: ExpressionType = typeAny
	) {}

	get value(): ExpressionValueType | undefined {
		return this._value!;
	}

	set value( value: ExpressionValueType | undefined ) {
		this._value = value;
	}

	get type(): ExpressionType {
		return this._type;
	}

	set type( type: ExpressionType ) {
		this._type = type;
	}

}
