export class ExpressionVariable {

	protected _value: boolean | number | string | undefined = undefined;
	protected _type: 'boolean' | 'number' | 'string' | undefined = undefined;

	get value(): boolean | number | string | undefined {
		return this._value!;
	}

	set value( v: boolean | number | string | undefined ) {
		this._value = v;
	}

	get type(): 'boolean' | 'number' | 'string' | undefined {
		return this._type;
	}

	set type( t: 'boolean' | 'number' | 'string' | undefined ) {
		this._type = t;
	}

}
