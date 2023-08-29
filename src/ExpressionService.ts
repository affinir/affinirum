import { ExpressionConstant,
	constTrue, constFalse, constNan, constPi, constEpsilon } from './ExpressionConstant.js';
import { ExpressionFunction, funcOr, funcAnd, funcNot, funcGt, funcLt, funcGe, funcLe, funcEq, funcNe,
	funcLike, funcUnlike, funcBeginof, funcEndof, funcPartof,
	funcAdd, funcSub, funcNeg, funcMul, funcDiv, funcRem, funcMod, funcPct, funcExp, funcLog, funcPow, funcRt, funcSq, funcSqrt,
	funcAbs, funcCeil, funcFloor, funcRound, funcMax, funcMin,
	funcLen, funcTrim, funcLowercase, funcUppercase, funcSubstr, funcConcat, funcAt } from './ExpressionFunction.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEq, operNe,
	operLike, operUnlike, operBeginof, operEndof, operPartof,
	operAdd, operSub, operNeg, operMul, operDiv, operPct, operPow, operConcat, operAt } from './ExpressionOperator.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionValueType, ExpressionValueTypename, ExpressionType, typeAny } from './ExpressionType.js';
import { ExpressionState } from './ExpressionState.js';
import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionFunctionNode } from './ExpressionFunctionNode.js';
import { ExpressionVariableNode } from './ExpressionVariableNode.js';

export class ExpressionService {

	protected _constants = new Map<string, ExpressionConstant>( [
		[ 'true', constTrue ], [ 'false', constFalse ], [ 'nan', constNan ], [ 'pi', constPi ], [ 'epsilon', constEpsilon ],
	] );
	protected _functions = new Map<string, ExpressionFunction>( [
		[ 'or', funcOr ], [ 'and', funcAnd ], [ 'not', funcNot ],
		[ 'gt', funcGt ], [ 'lt', funcLt ], [ 'ge', funcGe ], [ 'le', funcLe ],
		[ 'eq', funcEq ], [ 'ne', funcNe ], [ 'like', funcLike ], [ 'nlike', funcUnlike ],
		[ 'beginof', funcBeginof ], [ 'endof', funcEndof ], [ 'partof', funcPartof ],
		[ 'add', funcAdd ], [ 'sub', funcSub ], [ 'neg', funcNeg ],
		[ 'mul', funcMul ], [ 'div', funcDiv ], [ 'rem', funcRem ], [ 'mod', funcMod ], [ 'pct', funcPct ],
		[ 'exp', funcExp ], [ 'log', funcLog ], [ 'pow', funcPow ], [ 'rt', funcRt ], [ 'sq', funcSq ], [ 'sqrt', funcSqrt ],
		[ 'abs', funcAbs ], [ 'ceil', funcCeil ], [ 'floor', funcFloor ], [ 'round', funcRound ], [ 'max', funcMax ], [ 'min', funcMin ],
		[ 'len', funcLen ], [ 'trim', funcTrim ], [ 'lowercase', funcLowercase ], [ 'uppercase', funcUppercase ],
		[ 'substr', funcSubstr ], [ 'at', funcAt ], [ 'concat', funcConcat ],
	] );
	protected _variables = new Map<string, ExpressionVariable>();
	protected readonly _expr: string;
	protected readonly _root: ExpressionNode;

	/**
		Creates compiled expression. Any parsed token not recognized as a constant or a function will be compiled as a variable.
		@param expr Math expression to compile.
		@param config Optional constants and functions to add for the compilation.
	*/
	constructor( expr: string, config?: {
		type?: ExpressionType,
		constants?: {
			name: string,
			value: ExpressionValueType
		}[],
		functions?: {
			name: string,
			func:( ...values: any[] ) => ExpressionValueType,
			argTypes: ExpressionType[],
			type: ExpressionType
		}[],
		variables?: {
			name: string,
			type: ExpressionType
		}[],
	} ) {
		this._expr = expr;
		const type = config?.type ?? typeAny;
		config?.constants?.forEach( c => this._constants.set( c.name, new ExpressionConstant( c.value ) ) );
		config?.functions?.forEach( f => this._functions.set( f.name, new ExpressionFunction( f.func, f.argTypes, f.type ) ) );
		config?.variables?.forEach( v => this._variables.set( v.name, new ExpressionVariable( undefined, v.type ) ) );
		const state = new ExpressionState();
		try {
			this._root = this.disjunction( this.next( state ) );
		}
		catch ( err ) {
			throw new Error( `compilation error on ${ ( err as Error ).message } at position ${ state.pos }:\n` +
				`${ this._expr.substring( state.pos ) }` );
		}
		try {
			this._root = this._root.compile( type );
		}
		catch ( errnode: any ) {
			throw new TypeError( `compilation error on unexpected type ${ errnode.type } at position ${ errnode.pos }:\n` +
				`${ this._expr.substring( errnode.pos ) }` );
		}
	}

	/**
		Returns compiled expression return value type.
	*/
	get type(): ExpressionType {
		return this._root.type;
	}

	/**
		Returns record with compiled variable names and expected types.
		@returns Record with variable names and types.
	*/
	variables(): Record<string, ExpressionType> {
		const variables: Record<string, ExpressionType> = {};
		for ( const [ name, variable ] of this._variables ) {
			variables[ name ] = variable.type;
		}
		return variables;
	}

	/**
		Evaluates compiled expression using provided variable values.
		@param variables Record with variable names and values.
		@returns Calculated value.
	*/
	evaluate( variables: Record<string, ExpressionValueType> ): ExpressionValueType {
		for ( const [ name, variable ] of this._variables ) {
			if ( variables[ name ] == null ) {
				throw new Error( `evaluation error on undefined variable ${ name }` );
			}
			if ( variable.type.infer( ExpressionType.of( variables[ name ] ) ).invalid ) {
				throw new TypeError( `evaluation error on unexpected type ${ typeof variables[ name ] } for ${ variable.type } variable ${ name }` );
			}
			variable.value = variables[ name ];
		}
		return this._root.evaluate();
	}

	protected next( state: ExpressionState ): ExpressionState {
		while ( state.next < this._expr.length ) {
			state.reset();
			const c = this._expr.charAt( state.pos );
			state.advance();
			switch ( c ) {
				case ' ': case '\t': case '\n': case '\r': break;
				case '[': return state.setBracketsOpen();
				case ']': return state.setBracketsClose();
				case '(': return state.setParenthesesOpen();
				case ')': return state.setParenthesesClose();
				case ',': return state.setSeparator();
				case '.': return state.setIndexer();
				case '|': return state.set( operOr );
				case '&': return state.set( operAnd );
				case '!': switch ( this._expr.charAt( state.next ) ) {
					case '=': state.advance(); return state.set( operNe );
					case '~': state.advance(); return state.set( operUnlike );
					default: return state.set( operNot );
				}
				case '=': switch ( this._expr.charAt( state.next ) ) {
					case '*': state.advance(); return state.set( operBeginof );
					case '=': state.advance(); return state.set( operEq );
					default: return state.set( operEq );
				}
				case '>': switch ( this._expr.charAt( state.next ) ) {
					case '=': state.advance(); return state.set( operGe );
					default: return state.set( operGt );
				}
				case '<': switch ( this._expr.charAt( state.next ) ) {
					case '=': state.advance(); return state.set( operLe );
					default: return state.set( operLt );
				}
				case '+': return state.set( operAdd );
				case '-': return state.set( operSub );
				case '*': switch ( this._expr.charAt( state.next ) ) {
					case '=': state.advance(); return state.set( operEndof );
					case '*': state.advance(); return state.set( operPartof );
					default: return state.set( operMul );
				}
				case '~': return state.set( operLike );
				case '/': return state.set( operDiv );
				case '%': return state.set( operPct );
				case '^': return state.set( operPow );
				case '#': return state.set( operConcat );
				default:
					if ( ExpressionService.alpha( c ) ) {
						while ( ExpressionService.alphanumeric( this._expr.charAt( state.next ) ) ) {
							state.advance();
						}
						const token = this._expr.substring( state.pos, state.next );
						const constant = this._constants.get( token );
						if ( constant != null ) {
							return state.set( constant );
						}
						const func = this._functions.get( token );
						if ( func != null ) {
							return state.set( func );
						}
						return state.set( token );
					}
					else if ( ExpressionService.numeric( c ) ) {
						while ( ExpressionService.decinumeric( this._expr.charAt( state.next ) ) ) {
							state.advance();
						}
						return state.set( new ExpressionConstant( parseFloat( this._expr.substring( state.pos, state.next ) ) ) );
					}
					else if ( ExpressionService.quotation( c ) ) {
						const pos = state.next;
						while ( this._expr.charAt( state.next ) !== '' && this._expr.charAt( state.next ) !== c ) {
							state.advance();
						}
						return state.set( new ExpressionConstant( this._expr.substring( pos, state.advance() ) ) );
					}
					throw new Error( `unknown symbol ${ c }` );
			}
		}
		return state;
	}

	protected disjunction( state: ExpressionState ): ExpressionNode {
		let node = this.conjunction( state );
		while ( state.func === operOr ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.conjunction( this.next( state ) ) ] );
		}
		return node;
	}

	protected conjunction( state: ExpressionState ): ExpressionNode {
		let node = this.comparison( state );
		while ( state.func === operAnd ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.comparison( this.next( state ) ) ] );
		}
		return node;
	}

	protected comparison( state: ExpressionState ): ExpressionNode {
		let not = false;
		let pos = -1;
		while ( state.func === operNot ) {
			not = !not;
			pos = state.pos;
			this.next( state );
		}
		let node = this.aggregate( state );
		while ( state.func === operGt || state.func === operLt || state.func === operGe || state.func === operLe ||
			state.func === operEq || state.func === operNe || state.func === operLike || state.func === operUnlike ||
			state.func === operBeginof || state.func === operEndof || state.func === operPartof ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.aggregate( this.next( state ) ) ] );
		}
		if ( not ) {
			node = new ExpressionFunctionNode( pos, operNot, [ node ] );
		}
		return node;
	}

	protected aggregate( state: ExpressionState ): ExpressionNode {
		let node = this.product( state );
		while ( state.func === operConcat || state.func === operAdd || state.func === operSub ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.product( this.next( state ) ) ] );
		}
		return node;
	}

	protected product( state: ExpressionState ): ExpressionNode {
		let node = this.factor( state );
		while ( state.func === operMul || state.func === operDiv || state.func === operPct ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.factor( this.next( state ) ) ] );
		}
		return node;
	}

	protected factor( state: ExpressionState ): ExpressionNode {
		let neg = false;
		let pos = -1;
		while ( state.func === operSub ) {
			neg = !neg;
			pos = state.pos;
			this.next( state );
		}
		let node = this.index( state );
		while ( state.func === operPow ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.index( this.next( state ) ) ] );
		}
		if ( neg ) {
			node = new ExpressionFunctionNode( pos, operNeg, [ node ] );
		}
		return node;
	}

	protected index( state: ExpressionState ): ExpressionNode {
		let node = this.term( state );
		while ( state.isIndexer || state.isBracketsOpen ) {
			if ( state.isIndexer ) {
				node = new ExpressionFunctionNode( state.pos, operAt,
					[ node, new ExpressionConstantNode( state.pos, new ExpressionConstant( this.next( state ).token ) ) ] );
				if ( state.isToken ) {
					this.next( state );
				}
				else {
					throw new Error( `missing property name` );
				}
			}
			else {
				node = new ExpressionFunctionNode( state.pos, operAt,
					[ node, this.disjunction( this.next( state ) ) ] );
				if ( state.isBracketsClose ) {
					this.next( state );
				}
				else {
					throw new Error( `missing closing brackets` );
				}
			}
		}
		return node;
	}

	protected term( state: ExpressionState ): ExpressionNode {
		const pos = state.pos;
		if ( state.isFunction ) {
			const func = state.func;
			const subs = [];
			this.next( state );
			if ( state.isParenthesesOpen ) {
				do {
					subs.push( this.disjunction( this.next( state ) ) );
				}
				while ( state.isSeparator );
				if ( state.isParenthesesClose ) {
					if ( subs.length >= func.arity ) {
						this.next( state );
						return new ExpressionFunctionNode( pos, func, subs );
					}
					throw new Error( `missing function arguments` );
				}
				throw new Error( `missing closing parenthesis` );
			}
			throw new Error( `unexpected operator or missing opening parenthesis` );
		}
		else if ( state.isToken ) {
			let variable = this._variables.get( state.token );
			if ( variable == null ) {
				variable = new ExpressionVariable();
				this._variables.set( state.token, variable );
			}
			this.next( state );
			return new ExpressionVariableNode( pos, variable );
		}
		else if ( state.isConstant ) {
			const node = new ExpressionConstantNode( pos, state.constant );
			this.next( state );
			return node;
		}
		else if ( state.isBracketsOpen ) {
			const subs = [];
			do {
				subs.push( this.disjunction( this.next( state ) ) );
			}
			while ( state.isSeparator );
			if ( state.isBracketsClose ) {
				this.next( state );
				return new ExpressionFunctionNode( pos, operConcat, subs );
			}
			throw new Error( `missing closing brackets` );
		}
		else if ( state.isBracketsClose ) {
			throw new Error( `empty brackets` );
		}
		else if ( state.isParenthesesOpen ) {
			const node = this.disjunction( this.next( state ) );
			if ( state.isParenthesesClose ) {
				this.next( state );
				return node;
			}
			throw new Error( `missing closing parenthesis` );
		}
		else if ( state.isParenthesesClose ) {
			throw new Error( `empty parentheses` );
		}
		throw new Error( `unknown state ${ JSON.stringify( state ) }` );
	}

	protected static alpha = ( c: string ) => ( c >= 'a' && c <= 'z' ) || ( c >= 'A' && c <= 'Z' ) || ( c === '_' );
	protected static numeric = ( c: string ) => ( c >= '0' && c <= '9' );
	protected static alphanumeric = ( c: string ) => ExpressionService.alpha( c ) || ExpressionService.numeric( c );
	protected static decinumeric = ( c: string ) => ( c === '.' ) || ExpressionService.numeric( c );
	protected static quotation = ( c: string ) => ( c === '\'' || c === '\"' || c === '\`' );

}
