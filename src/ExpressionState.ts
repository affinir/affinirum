import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';

const bracketsOpenSymbol = Symbol();
const bracketsCloseSymbol = Symbol();
const parenthesesOpenSymbol = Symbol();
const parenthesesCloseSymbol = Symbol();
const separatorSymbol = Symbol();
const indexerSymbol = Symbol();

export class ExpressionState {

	protected _obj: ExpressionConstant | ExpressionFunction | string | symbol | undefined;
	protected _pos = 0;
	protected _next = 0;

	get isConstant(): boolean {
		return this._obj instanceof ExpressionConstant;
	}

	get isFunction(): boolean {
		return this._obj instanceof ExpressionFunction;
	}

	get isToken(): boolean {
		return typeof this._obj === 'string';
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

	get isIndexer(): boolean {
		return this._obj === indexerSymbol;
	}

	get constant(): ExpressionConstant {
		return this._obj as ExpressionConstant;
	}

	get func(): ExpressionFunction {
		return this._obj as ExpressionFunction;
	}

	get token(): string {
		return this._obj as string;
	}

	get pos(): number {
		return this._pos;
	}

	get next(): number {
		return this._next;
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

	setIndexer(): ExpressionState {
		this._obj = indexerSymbol;
		return this;
	}

	set( value: ExpressionConstant | ExpressionFunction | string ): ExpressionState {
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
