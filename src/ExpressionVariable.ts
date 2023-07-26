export class ExpressionVariable {

	constructor(
		protected _name: string,
		protected _type: 'boolean' | 'number' | 'string' | undefined = undefined,
	) {}

	get name(): string {
		return this._name;
	}

	get type(): 'boolean' | 'number' | 'string' | undefined {
		return this._type;
	}

	set type( type: 'boolean' | 'number' | 'string' | undefined ) {
		this._type = type;
	}

}
