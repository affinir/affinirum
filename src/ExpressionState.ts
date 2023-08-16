import { ExpressionFunction } from './ExpressionFunction.js';
import { ExpressionVariable } from './ExpressionVariable.js';

const openSymbol = Symbol();
const closeSymbol = Symbol();
const separatorSymbol = Symbol();

export class ExpressionState {

	protected _obj: ExpressionFunction | ExpressionVariable | boolean | number | string | symbol | undefined;
	protected _pos = 0;
	protected _end = 0;

	get isFunc(): boolean {
		return this._obj instanceof ExpressionFunction;
	}

	get isVariable(): boolean {
		return this._obj instanceof ExpressionVariable;
	}

	get isValue(): boolean {
		return typeof this._obj === 'boolean' || typeof this._obj === 'number' || typeof this._obj === 'string';
	}

	get isOpen(): boolean {
		return this._obj === openSymbol;
	}

	get isClose(): boolean {
		return this._obj === closeSymbol;
	}

	get isSeparator(): boolean {
		return this._obj === separatorSymbol;
	}

	get func(): ExpressionFunction {
		return this._obj as ExpressionFunction;
	}

	get variable(): ExpressionVariable {
		return this._obj as ExpressionVariable;
	}

	get value(): boolean | number | string {
		return this._obj as boolean | number | string;
	}

	get pos(): number {
		return this._pos;
	}

	get end(): number {
		return this._end;
	}

	setOpen(): ExpressionState {
		this._obj = openSymbol;
		return this;
	}

	setClose(): ExpressionState {
		this._obj = closeSymbol;
		return this;
	}

	setSeparator(): ExpressionState {
		this._obj = separatorSymbol;
		return this;
	}

	set( value: boolean | number | string | ExpressionVariable | ExpressionFunction ): ExpressionState {
		this._obj = value;
		return this;
	}

	reset(): void {
		this._obj = undefined;
		this._pos = this._end;
	}

	advance(): number {
		return this._end++;
	}

}
