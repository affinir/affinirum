import { ExprVariable } from './ExprVariable';
import { ExprFunction, orFunc, andFunc, notFunc, gtFunc, ltFunc, geFunc, leFunc, eqFunc, neFunc, likeFunc, unlikeFunc, beginofFunc, endofFunc, partofFunc,
	addFunc, subFunc, negFunc, mulFunc, divFunc, remFunc, modFunc, pctFunc, expFunc, logFunc, powFunc, rtFunc, sqFunc, sqrtFunc,
	absFunc, ceilFunc, floorFunc, roundFunc, maxFunc, minFunc, lenFunc, substrFunc } from './ExprFunction';
import { ExprState } from './ExprState';
import { ExprNode } from './ExprNode';

const orOper = orFunc.oper();
const andOper = andFunc.oper();
const notOper = notFunc.oper();
const gtOper = gtFunc.oper();
const ltOper = ltFunc.oper();
const geOper = geFunc.oper();
const leOper = leFunc.oper();
const eqOper = eqFunc.oper();
const neOper = neFunc.oper();
const likeOper = likeFunc.oper();
const unlikeOper = unlikeFunc.oper();
const beginofOper = beginofFunc.oper();
const endofOper = endofFunc.oper();
const partofOper = partofFunc.oper();
const addOper = addFunc.oper();
const subOper = subFunc.oper();
const negOper = negFunc.oper();
const mulOper = mulFunc.oper();
const divOper = divFunc.oper();
const pctOper = pctFunc.oper();
const powOper = powFunc.oper();

export class ExprEngine {

	protected _funcs = new Map<string, ExprFunction>( [
		[ 'or', orFunc ], [ 'and', andFunc ], [ 'not', notFunc ],
		[ 'gt', gtFunc ], [ 'lt', ltFunc ], [ 'ge', geFunc ], [ 'le', leFunc ],
		[ 'eq', eqFunc ], [ 'ne', neFunc ], [ 'like', likeFunc ], [ 'nlike', unlikeFunc ],
		[ 'beginof', beginofFunc ], [ 'endof', endofFunc ], [ 'partof', partofFunc ],
		[ 'add', addFunc ], [ 'sub', subFunc ], [ 'neg', negFunc ],
		[ 'mul', mulFunc ], [ 'div', divFunc ], [ 'rem', remFunc ], [ 'mod', modFunc ], [ 'pct', pctFunc ],
		[ 'exp', expFunc ], [ 'log', logFunc ], [ 'pow', powFunc ], [ 'rt', rtFunc ], [ 'sq', sqFunc ], [ 'sqrt', sqrtFunc ],
		[ 'abs', absFunc ], [ 'ceil', ceilFunc ], [ 'floor', floorFunc ], [ 'round', roundFunc ],
		[ 'max', maxFunc ], [ 'min', minFunc ], [ 'len', lenFunc ], [ 'substr', substrFunc ],
	] );
	protected _consts = new Map<string, boolean | number | string>( [
		[ 'true', true ], [ 'false', false ],
		[ 'nan', Number.NaN ], [ 'pi', 3.141592653589793 ], [ 'e', 2.718281828459045 ],
	] );
	protected readonly _expr: string;
	protected readonly _root: ExprNode;

	constructor( expr: string ) {
		this._expr = expr;
		const state = new ExprState();
		try {
			this._root = this.disjunctor( this.next( state ) );
		}
		catch ( err ) {
			throw new Error( `parser failed at position ${ state.pos }: ${ this._expr.substring( state.pos ) }\n${ ( err as Error ).message }` );
		}
		const pos = this._root.compile();
		if ( pos ) {
			throw new Error( `compiler failed at position ${ pos }: ${ this._expr.substring( pos ) }` );
		}
	}

	evaluate( vars: Record<string, boolean | number | string> ): boolean | number | string {
		return this._root.evaluate( vars );
	}

	protected next( state: ExprState ): ExprState {
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
				default:
					if ( ExprEngine.alpha( c ) ) {
						while ( ExprEngine.alphanumeric( this._expr.charAt( state.end ) ) ) {
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
						return state.set( new ExprVariable( token ) );
					}
					else if ( ExprEngine.numeric( c ) ) {
						while ( ExprEngine.numeric( this._expr.charAt( state.end ) ) ) {
							state.advance();
						}
						return state.set( parseFloat( this._expr.substring( state.pos, state.end ) ) );
					}
					else if ( ExprEngine.quotation( c ) ) {
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

	protected disjunctor( state: ExprState ): ExprNode {
		let node = this.conjunctor( state );
		while ( state.func === orOper ) {
			node = new ExprNode( state.pos, state.func, [ node, this.conjunctor( this.next( state ) ) ] );
		}
		return node;
	}

	protected conjunctor( state: ExprState ): ExprNode {
		let node = this.comparator( state );
		while ( state.func === andOper ) {
			node = new ExprNode( state.pos, state.func, [ node, this.comparator( this.next( state ) ) ] );
		}
		return node;
	}

	protected comparator( state: ExprState ): ExprNode {
		let not = false;
		let pos = -1;
		while ( state.func === notOper ) {
			not = !not;
			pos = state.pos;
			this.next( state );
		}
		let node = this.summator( state );
		while ( state.func === gtOper || state.func === ltOper || state.func === geOper || state.func === leOper ||
			state.func === eqOper || state.func === neOper || state.func === likeOper || state.func === unlikeOper ||
			state.func === beginofOper || state.func === endofOper || state.func === partofOper ) {
			node = new ExprNode( state.pos, state.func, [ node, this.summator( this.next( state ) ) ] );
		}
		if ( not ) {
			node = new ExprNode( pos, notOper, [ node ] );
		}
		return node;
	}

	protected summator( state: ExprState ): ExprNode {
		let node = this.product( state );
		while ( state.func === addOper || state.func === subOper ) {
			node = new ExprNode( state.pos, state.func, [ node, this.product( this.next( state ) ) ] );
		}
		return node;
	}

	protected product( state: ExprState ): ExprNode {
		let node = this.factor( state );
		while ( state.func === mulOper || state.func === divOper || state.func === pctOper ) {
			node = new ExprNode( state.pos, state.func, [ node, this.factor( this.next( state ) ) ] );
		}
		return node;
	}

	protected factor( state: ExprState ): ExprNode {
		let neg = false;
		let pos = -1;
		while ( state.func === subOper ) {
			neg = !neg;
			pos = state.pos;
			this.next( state );
		}
		let node = this.atom( state );
		while ( state.func === powOper ) {
			node = new ExprNode( state.pos, state.func, [ node, this.atom( this.next( state ) ) ] );
		}
		if ( neg ) {
			node = new ExprNode( pos, negOper, [ node ] );
		}
		return node;
	}

	protected atom( state: ExprState ) : ExprNode {
		const pos = state.pos;
		if ( state.isFunc ) {
			const func = state.func;
			const subs = [];
			this.next( state );
			if ( state.isOpen ) {
				do {
					subs.push( this.disjunctor( this.next( state ) ) );
				}
				while ( state.isSeparator );
				if ( state.isClose ) {
					if ( subs.length >= func.arity ) {
						this.next( state );
						return new ExprNode( pos, func, subs );
					}
				}
				else {
					throw new Error( `missing closing parenthesis` );
				}
			}
		}
		else if ( state.isVariable ) {
			const variable = state.variable;
			this.next( state );
			return new ExprNode( pos, variable );
		}
		else if ( state.isValue ) {
			const value = state.value;
			this.next( state );
			return new ExprNode( pos, value );
		}
		else if ( state.isOpen ) {
			const node = this.disjunctor( this.next( state ) );
			if ( state.isClose ) {
				this.next( state );
				return node;
			}
			else {
				throw new Error( `missing closing parenthesis` );
			}
		}
		throw new Error( `unknown state ${ JSON.stringify( state ) }` );
	}

	protected static alpha = ( c: string ) => ( c >= 'a' && c <= 'z' ) || ( c >= 'A' && c <= 'Z' ) || ( c === '_' ) || ( c === '$' );
	protected static numeric = ( c: string ) => ( c >= '0' && c <= '9' ) || ( c === '.' );
	protected static alphanumeric = ( c: string ) => ( ExprEngine.alpha( c ) || ExprEngine.numeric( c ) );
	protected static quotation = ( c: string ) => ( c === '\'' || c === '\"' || c === '\`' );

}
