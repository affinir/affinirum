import { ExpressionFunction } from './ExpressionFunction.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionConstant } from './ExpressionConstant.js';

const bracketsOpenSymbol = Symbol();
const bracketsCloseSymbol = Symbol();
const parenthesesOpenSymbol = Symbol();
const parenthesesCloseSymbol = Symbol();
const separatorSymbol = Symbol();

export class ExpressionState {

	protected _obj: ExpressionFunction | ExpressionVariable | ExpressionConstant | symbol | undefined;
	protected _access: boolean = false;
	protected _pos = 0;
	protected _next = 0;

	get isFunction(): boolean {
		return this._obj instanceof ExpressionFunction;
	}

	get isVariable(): boolean {
		return this._obj instanceof ExpressionVariable;
	}

	get isConstant(): boolean {
		return this._obj instanceof ExpressionConstant;
	}

	get isBracketsOpen(): boolean {
		return this._obj === bracketsOpenSymbol;
	}

	get isBracketsClose(): boolean {
		return this._obj === bracketsCloseSymbol;
	}

	get isParenthesesOpen(): boolean {
		return this._obj === parenthesesOpenSymbol;
	}

	get isParenthesesClose(): boolean {
		return this._obj === parenthesesCloseSymbol;
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

	get constant(): ExpressionConstant {
		return this._obj as ExpressionConstant;
	}

	get pos(): number {
		return this._pos;
	}

	get next(): number {
		return this._next;
	}

	setAccess(): void {
		this._access = true;
	}

	resetAccess(): boolean {
		if ( this._access ) {
			this._access = false;
			return true;
		}
		return false;
	}

	setBracketsOpen(): ExpressionState {
		this._obj = bracketsOpenSymbol;
		return this;
	}

	setBracketsClose(): ExpressionState {
		this._obj = bracketsCloseSymbol;
		return this;
	}

	setParenthesesOpen(): ExpressionState {
		this._obj = parenthesesOpenSymbol;
		return this;
	}

	setParenthesesClose(): ExpressionState {
		this._obj = parenthesesCloseSymbol;
		return this;
	}

	setSeparator(): ExpressionState {
		this._obj = separatorSymbol;
		return this;
	}

	set( value: ExpressionFunction | ExpressionVariable | ExpressionConstant ): ExpressionState {
		this._obj = value;
		return this;
	}

	reset(): void {
		this._obj = undefined;
		this._pos = this._next;
	}

	advance(): number {
		return this._next++;
	}

}
