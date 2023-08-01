import { ExpressionVariable } from './ExpressionVariable';
import { ExpressionFunction, orFunc, andFunc, notFunc, gtFunc, ltFunc, geFunc, leFunc, eqFunc, neFunc, likeFunc, unlikeFunc, beginofFunc, endofFunc, partofFunc,
	addFunc, subFunc, negFunc, mulFunc, divFunc, remFunc, modFunc, pctFunc, expFunc, logFunc, powFunc, rtFunc, sqFunc, sqrtFunc,
	absFunc, ceilFunc, floorFunc, roundFunc, maxFunc, minFunc, lenFunc, trimFunc, atFunc, substrFunc, concatFunc } from './ExpressionFunction';
import { ExpressionState } from './ExpressionState';
import { ExpressionNode } from './ExpressionNode';

const orOper = orFunc.clone();
const andOper = andFunc.clone();
const notOper = notFunc.clone();
const gtOper = gtFunc.clone();
const ltOper = ltFunc.clone();
const geOper = geFunc.clone();
const leOper = leFunc.clone();
const eqOper = eqFunc.clone();
const neOper = neFunc.clone();
const likeOper = likeFunc.clone();
const unlikeOper = unlikeFunc.clone();
const beginofOper = beginofFunc.clone();
const endofOper = endofFunc.clone();
const partofOper = partofFunc.clone();
const addOper = addFunc.clone();
const subOper = subFunc.clone();
const negOper = negFunc.clone();
const mulOper = mulFunc.clone();
const divOper = divFunc.clone();
const pctOper = pctFunc.clone();
const powOper = powFunc.clone();
const lenOper = lenFunc.clone();
const atOper = atFunc.clone();
const concatOper = concatFunc.clone();

export class ExpressionService {

	protected _funcs = new Map<string, ExpressionFunction>( [
		[ 'or', orFunc ], [ 'and', andFunc ], [ 'not', notFunc ],
		[ 'gt', gtFunc ], [ 'lt', ltFunc ], [ 'ge', geFunc ], [ 'le', leFunc ],
		[ 'eq', eqFunc ], [ 'ne', neFunc ], [ 'like', likeFunc ], [ 'nlike', unlikeFunc ],
		[ 'beginof', beginofFunc ], [ 'endof', endofFunc ], [ 'partof', partofFunc ],
		[ 'add', addFunc ], [ 'sub', subFunc ], [ 'neg', negFunc ],
		[ 'mul', mulFunc ], [ 'div', divFunc ], [ 'rem', remFunc ], [ 'mod', modFunc ], [ 'pct', pctFunc ],
		[ 'exp', expFunc ], [ 'log', logFunc ], [ 'pow', powFunc ], [ 'rt', rtFunc ], [ 'sq', sqFunc ], [ 'sqrt', sqrtFunc ],
		[ 'abs', absFunc ], [ 'ceil', ceilFunc ], [ 'floor', floorFunc ], [ 'round', roundFunc ], [ 'max', maxFunc ], [ 'min', minFunc ],
		[ 'len', lenFunc ], [ 'trim', trimFunc ], [ 'at', atFunc ], [ 'substr', substrFunc ], [ 'concat', concatFunc ],
	] );
	protected _consts = new Map<string, boolean | number | string>( [
		[ 'true', true ], [ 'false', false ],
		[ 'nan', Number.NaN ], [ 'e', 2.718281828459045 ], [ 'pi', 3.141592653589793 ],
	] );
	protected readonly _expr: string;
	protected readonly _root: ExpressionNode;

	/**
		Creates compiled expression.
		@param expr Math expression to compile.
		@param config Optional constants and functions to add for compilation.
	*/
	constructor( expr: string, config?: {
		constants?: {
			name: string,
			value: boolean | number | string
		}[],
		functions?: {
			name: string,
			func:( ...values: any[] ) => boolean | number | string,
			argTypes: ( 'boolean' | 'number' | 'string' | undefined )[],
			retType: 'boolean' | 'number' | 'string'
		}[]
	} ) {
		this._expr = expr;
		config?.constants?.forEach( c => this._consts.set( c.name, c.value ) );
		config?.functions?.forEach( f => this._funcs.set( f.name, new ExpressionFunction( f.func, f.argTypes, f.retType ) ) );
		const state = new ExpressionState();
		try {
			this._root = this.disjunction( this.next( state ) );
		}
		catch ( err ) {
			throw new Error( `parser failed at position ${ state.pos }: ${ this._expr.substring( state.pos ) }\n${ ( err as Error ).message }` );
		}
		const pos = this._root.compile();
		if ( pos ) {
			throw new Error( `compiler failed at position ${ pos }: ${ this._expr.substring( pos ) }` );
		}
	}

	/**
		Evaluates compiled expression with provided variable values.
		@param variables Record object with variable values set.
		@returns Calculated value.
	*/
	evaluate( variables: Record<string, boolean | number | string> ): boolean | number | string {
		return this._root.evaluate( variables );
	}

	protected next( state: ExpressionState ): ExpressionState {
		while ( state.end < this._expr.length ) {
			state.reset();
			const c = this._expr.charAt( state.pos );
			state.advance();
			switch ( c ) {
				case ' ': case '\t': case '\n': case '\r': break;
				case '(': return state.setOpen();
				case ')': return state.setClose();
				case ',': return state.setSeparator();
				case '|': return state.set( orOper );
				case '&': return state.set( andOper );
				case '!': switch ( this._expr.charAt( state.end ) ) {
					case '=': state.advance(); return state.set( neOper );
					case '~': state.advance(); return state.set( unlikeOper );
					default: return state.set( notOper );
				}
				case '=': switch ( this._expr.charAt( state.end ) ) {
					case '*': state.advance(); return state.set( beginofOper );
					case '=': state.advance();
					default: return state.set( eqOper );
				}
				case '>': switch ( this._expr.charAt( state.end ) ) {
					case '=': state.advance(); return state.set( geOper );
					default: return state.set( gtOper );
				}
				case '<': switch ( this._expr.charAt( state.end ) ) {
					case '=': state.advance(); return state.set( leOper );
					default: return state.set( ltOper );
				}
				case '+': return state.set( addOper );
				case '-': return state.set( subOper );
				case '*': switch ( this._expr.charAt( state.end ) ) {
					case '=': state.advance(); return state.set( endofOper );
					case '*': state.advance(); return state.set( partofOper );
					default: return state.set( mulOper );
				}
				case '~': return state.set( likeOper );
				case '/': return state.set( divOper );
				case '%': return state.set( pctOper );
				case '^': return state.set( powOper );
				case '$': return state.set( lenOper );
				case '@': return state.set( atOper );
				case '#': return state.set( concatOper )
				default:
					if ( ExpressionService.alpha( c ) ) {
						while ( ExpressionService.alphanumeric( this._expr.charAt( state.end ) ) ) {
							state.advance();
						}
						const token = this._expr.substring( state.pos, state.end );
						const func = this._funcs.get( token );
						if ( func !== undefined ) {
							return state.set( func );
						}
						const value = this._consts.get( token );
						if ( value !== undefined ) {
							return state.set( value );
						}
						return state.set( new ExpressionVariable( token ) );
					}
					else if ( ExpressionService.numeric( c ) ) {
						while ( ExpressionService.numeric( this._expr.charAt( state.end ) ) ) {
							state.advance();
						}
						return state.set( parseFloat( this._expr.substring( state.pos, state.end ) ) );
					}
					else if ( ExpressionService.quotation( c ) ) {
						const pos = state.end;
						while ( this._expr.charAt( state.end ) !== '' && this._expr.charAt( state.end ) !== c ) {
							state.advance();
						}
						return state.set( this._expr.substring( pos, state.advance() ) );
					}
					throw new Error();
			}
		}
		return state;
	}

	protected disjunction( state: ExpressionState ): ExpressionNode {
		let node = this.conjunction( state );
		while ( state.func === orOper ) {
			node = new ExpressionNode( state.pos, state.func, [ node, this.conjunction( this.next( state ) ) ] );
		}
		return node;
	}

	protected conjunction( state: ExpressionState ): ExpressionNode {
		let node = this.comparison( state );
		while ( state.func === andOper ) {
			node = new ExpressionNode( state.pos, state.func, [ node, this.comparison( this.next( state ) ) ] );
		}
		return node;
	}

	protected comparison( state: ExpressionState ): ExpressionNode {
		let not = false;
		let pos = -1;
		while ( state.func === notOper ) {
			not = !not;
			pos = state.pos;
			this.next( state );
		}
		let node = this.aggregate( state );
		while ( state.func === gtOper || state.func === ltOper || state.func === geOper || state.func === leOper ||
			state.func === eqOper || state.func === neOper || state.func === likeOper || state.func === unlikeOper ||
			state.func === beginofOper || state.func === endofOper || state.func === partofOper ) {
			node = new ExpressionNode( state.pos, state.func, [ node, this.aggregate( this.next( state ) ) ] );
		}
		if ( not ) {
			node = new ExpressionNode( pos, notOper, [ node ] );
		}
		return node;
	}

	protected aggregate( state: ExpressionState ): ExpressionNode {
		let node = this.product( state );
		while ( state.func === concatOper || state.func === addOper || state.func === subOper ) {
			node = new ExpressionNode( state.pos, state.func, [ node, this.product( this.next( state ) ) ] );
		}
		return node;
	}

	protected product( state: ExpressionState ): ExpressionNode {
		let node = this.factor( state );
		while ( state.func === atOper || state.func === mulOper || state.func === divOper || state.func === pctOper ) {
			node = new ExpressionNode( state.pos, state.func, [ node, this.factor( this.next( state ) ) ] );
		}
		return node;
	}

	protected factor( state: ExpressionState ): ExpressionNode {
		let neg = false;
		let pos = -1;
		while ( state.func === subOper ) {
			neg = !neg;
			pos = state.pos;
			this.next( state );
		}
		let node = this.term( state );
		while ( state.func === powOper ) {
			node = new ExpressionNode( state.pos, state.func, [ node, this.term( this.next( state ) ) ] );
		}
		if ( neg ) {
			node = new ExpressionNode( pos, negOper, [ node ] );
		}
		return node;
	}

	protected term( state: ExpressionState ): ExpressionNode {
		let node = this.atom( state );
		while ( state.func === atOper ) {
			node = new ExpressionNode( state.pos, state.func, [ node, this.atom( this.next( state ) ) ] );
		}
		if ( state.func === lenOper ) {
			node = new ExpressionNode( state.pos, state.func, [ node ] );
			this.next( state );
			if ( state.func === lenOper ) {
				throw new Error( `unexpected operator` );
			}
		}
		return node;
	}

	protected atom( state: ExpressionState ): ExpressionNode {
		const pos = state.pos;
		if ( state.isFunc ) {
			const func = state.func;
			const subs = [];
			this.next( state );
			if ( state.isOpen ) {
				do {
					subs.push( this.disjunction( this.next( state ) ) );
				}
				while ( state.isSeparator );
				if ( state.isClose ) {
					if ( subs.length >= func.arity ) {
						this.next( state );
						return new ExpressionNode( pos, func, subs );
					}
					throw new Error( `missing function arguments` );
				}
				throw new Error( `missing closing parenthesis` );
			}
			throw new Error( `unexpected operator or missing opening parenthesis` );
		}
		else if ( state.isVariable ) {
			const variable = state.variable;
			this.next( state );
			return new ExpressionNode( pos, variable );
		}
		else if ( state.isValue ) {
			const value = state.value;
			this.next( state );
			return new ExpressionNode( pos, value );
		}
		else if ( state.isOpen ) {
			const node = this.disjunction( this.next( state ) );
			if ( state.isClose ) {
				this.next( state );
				return node;
			}
			throw new Error( `missing closing parenthesis` );
		}
		throw new Error( `unknown state ${ JSON.stringify( state ) }` );
	}

	protected static alpha = ( c: string ) => ( c >= 'a' && c <= 'z' ) || ( c >= 'A' && c <= 'Z' ) || ( c === '_' );
	protected static numeric = ( c: string ) => ( c >= '0' && c <= '9' ) || ( c === '.' );
	protected static alphanumeric = ( c: string ) => ( ExpressionService.alpha( c ) || ExpressionService.numeric( c ) );
	protected static quotation = ( c: string ) => ( c === '\'' || c === '\"' || c === '\`' );

}
