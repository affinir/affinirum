import { ExpressionConstant,
	constTrue, constFalse, constNaN, constPosInf, constNegInf, constEpsilon, constPi } from './ExpressionConstant.js';
import { ExpressionFunction, funcOr, funcAnd, funcNot, funcGt, funcLt, funcGe, funcLe, funcEq, funcNe,
	funcLike, funcUnlike, funcBeginof, funcEndof, funcPartof,
	funcAdd, funcSub, funcNeg, funcMul, funcDiv, funcRem, funcMod, funcPct, funcExp, funcLog, funcPow, funcRt, funcSq, funcSqrt,
	funcAbs, funcCeil, funcFloor, funcRound, funcMax, funcMin,
	funcLen, funcTrim, funcLowercase, funcUppercase, funcSubstr, funcConcat, funcFlatten, funcReverse, funcSlice,
	funcAt, funcMap, funcFilter, funcAny, funcEvery, funcConstr } from './ExpressionFunction.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEq, operNe,
	operLike, operUnlike, operBeginof, operEndof, operPartof,
	operAdd, operSub, operNeg, operMul, operDiv, operPct, operPow, operConcat, operAt, operConstr } from './ExpressionOperator.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionValue, ExpressionType, typeVar } from './ExpressionType.js';
import { ExpressionState } from './ExpressionState.js';
import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionFunctionNode } from './ExpressionFunctionNode.js';
import { ExpressionVariableNode } from './ExpressionVariableNode.js';

export class ExpressionService {

	protected readonly _expr: string;
	protected readonly _root: ExpressionNode;
	protected readonly _scope = Symbol();
	protected _constants = new Map<string, ExpressionConstant>( [
		[ 'true', constTrue ], [ 'false', constFalse ],
		[ 'NaN', constNaN ], [ 'PosInf', constPosInf ], [ 'NegInf', constNegInf ], [ 'Epsilon', constEpsilon ], [ 'Pi', constPi ],
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
		[ 'len', funcLen ], [ 'trim', funcTrim ], [ 'lowercase', funcLowercase ], [ 'uppercase', funcUppercase ], [ 'substr', funcSubstr ],
		[ 'concat', funcConcat ], [ 'concat', funcConcat ], [ 'flatten', funcFlatten ], [ 'reverse', funcReverse ], [ 'slice', funcSlice ],
		[ 'at', funcAt ], [ 'map', funcMap ], [ 'filter', funcFilter ], [ 'any', funcAny ], [ 'every', funcEvery ],
		[ 'constr', funcConstr ],
	] );
	protected _variables = new Map<symbol, Map<string, ExpressionVariable>>( [ [ this._scope, new Map<string, ExpressionVariable>() ] ] );

	/**
		Creates compiled expression. Any parsed token not recognized as a constant or a function will be compiled as a variable.
		@param expr Math expression to compile.
		@param config Optional constants and functions to add for the compilation.
	*/
	constructor( expr: string, config?: {
		type?: ExpressionType,
		constants?: {
			name: string,
			value: ExpressionValue
		}[],
		functions?: {
			name: string,
			func:( ...values: any[] ) => ExpressionValue,
			argTypes: ExpressionType[],
			type: ExpressionType
		}[],
		variables?: {
			name: string,
			type: ExpressionType
		}[],
	} ) {
		this._expr = expr;
		const type = config?.type ?? typeVar;
		config?.constants?.forEach( c => this._constants.set( c.name, new ExpressionConstant( c.value ) ) );
		config?.functions?.forEach( f => this._functions.set( f.name, new ExpressionFunction( f.func, f.argTypes, f.type ) ) );
		config?.variables?.forEach( v => this._variables.get( this._scope )?.set( v.name, new ExpressionVariable( undefined, v.type ) ) );
		const state = new ExpressionState( this._expr );
		try {
			this._root = this.disjunction( state.next(), this._scope );
		}
		catch ( err ) {
			let pos = state.pos - 20;
			pos = pos < 0 ? 0 : pos;
			throw new Error( `compilation error on ${ ( err as Error ).message } at position ${ state.pos }:\n` +
				`${ this._expr.substring( pos, pos + 36 ) }\n` +
				`${ ' '.repeat( this._expr.substring( pos, state.pos ).length ) }^` );
		}
		try {
			this._root = this._root.compile( type );
		}
		catch ( errnode: any ) {
			let pos = errnode.pos - 20;
			pos = pos < 0 ? 0 : pos;
			throw new TypeError( `compilation error on unexpected type ${ errnode.type } at position ${ errnode.pos }:\n` +
				`${ this._expr.substring( pos, pos + 36 ) }\n` +
				`${ ' '.repeat( this._expr.substring( pos, errnode.pos ).length ) }^` );
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
		const globals = this._variables.get( this._scope )!;
		for ( const [ name, variable ] of globals ) {
			variables[ name ] = variable.type;
		}
		return variables;
	}

	/**
		Evaluates compiled expression using provided variable values.
		@param variables Record with variable names and values.
		@returns Calculated value.
	*/
	evaluate( variables: Record<string, ExpressionValue> ): ExpressionValue {
		const globals = this._variables.get( this._scope )!;
		for ( const [ name, variable ] of globals ) {
			if ( variables[ name ] == null ) {
				throw new Error( `evaluation error on undefined variable ${ name }` );
			}
			if ( !variable.type.infer( ExpressionType.of( variables[ name ] ) ) ) {
				throw new TypeError( `evaluation error on unexpected type ${ typeof variables[ name ] } for ${ variable.type } variable ${ name }` );
			}
			variable.value = variables[ name ];
		}
		return this._root.evaluate();
	}

	protected disjunction( state: ExpressionState, scope: symbol ): ExpressionNode {
		let node = this.conjunction( state, scope );
		while ( state.func === operOr ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.conjunction( state.next(), scope ) ] );
		}
		return node;
	}

	protected conjunction( state: ExpressionState, scope: symbol ): ExpressionNode {
		let node = this.comparison( state, scope );
		while ( state.func === operAnd ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.comparison( state.next(), scope ) ] );
		}
		return node;
	}

	protected comparison( state: ExpressionState, scope: symbol ): ExpressionNode {
		let not = false;
		let pos = -1;
		while ( state.func === operNot ) {
			not = !not;
			pos = state.pos;
			state.next();
		}
		let node = this.aggregate( state, scope );
		while ( state.func === operGt || state.func === operLt || state.func === operGe || state.func === operLe ||
			state.func === operEq || state.func === operNe || state.func === operLike || state.func === operUnlike ||
			state.func === operBeginof || state.func === operEndof || state.func === operPartof ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.aggregate( state.next(), scope ) ] );
		}
		if ( not ) {
			node = new ExpressionFunctionNode( pos, operNot, [ node ] );
		}
		return node;
	}

	protected aggregate( state: ExpressionState, scope: symbol ): ExpressionNode {
		let node = this.product( state, scope );
		while ( state.func === operConcat || state.func === operAdd || state.func === operSub ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.product( state.next(), scope ) ] );
		}
		return node;
	}

	protected product( state: ExpressionState, scope: symbol ): ExpressionNode {
		let node = this.factor( state, scope );
		while ( state.func === operMul || state.func === operDiv || state.func === operPct ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.factor( state.next(), scope ) ] );
		}
		return node;
	}

	protected factor( state: ExpressionState, scope: symbol ): ExpressionNode {
		let neg = false;
		let pos = -1;
		while ( state.func === operSub ) {
			neg = !neg;
			pos = state.pos;
			state.next();
		}
		let node = this.index( state, scope );
		while ( state.func === operPow ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.index( state.next(), scope ) ] );
		}
		if ( neg ) {
			node = new ExpressionFunctionNode( pos, operNeg, [ node ] );
		}
		return node;
	}

	protected index( state: ExpressionState, scope: symbol ): ExpressionNode {
		let node = this.term( state, scope );
		while ( state.isIndex || state.isBracketsOpen ) {
			if ( state.isIndex ) {
				if ( !state.next().isToken ) {
					throw new Error( `missing index specifier` );
				}
				const pos = state.pos;
				const token = state.token;
				const func = this._functions.get( token );
				if ( func != null ) {
					const subs = [ node, ...this.arguments( func.arity - 1, state, scope ) ];
					state.next();
					node = new ExpressionFunctionNode( pos, func, subs );
				}
				else {
					node = new ExpressionFunctionNode( state.pos, operAt,
						[ node, new ExpressionConstantNode( state.pos, new ExpressionConstant( state.token ) ) ] );
					if ( state.isToken ) {
						state.next();
					}
					else {
						throw new Error( `missing property name` );
					}
				}
			}
			else {
				node = new ExpressionFunctionNode( state.pos, operAt,
					[ node, this.disjunction( state.next(), scope ) ] );
				if ( state.isBracketsClose ) {
					state.next();
				}
				else {
					throw new Error( `missing closing brackets` );
				}
			}
		}
		return node;
	}

	protected term( state: ExpressionState, scope: symbol ): ExpressionNode {
		const pos = state.pos;
		if ( state.isToken ) {
			const token = state.token;
			const constant = this._constants.get( token );
			if ( constant != null ) {
				state.next();
				return new ExpressionConstantNode( pos, constant );
			}
			const func = this._functions.get( token );
			if ( func != null ) {
				const subs = this.arguments( func.arity, state, scope );
				state.next();
				return new ExpressionFunctionNode( pos, func, subs );
			}
			let variables = this._variables.get( scope );
			if ( !variables ) {
				throw new Error( `unknown scope` );
			}
			let variable = variables.get( token );
			if ( variable == null ) {
				variable = new ExpressionVariable( token );
				variables.set( token, variable );
			}
			state.next();
			return new ExpressionVariableNode( pos, variable );
		}
		else if ( state.isConstant ) {
			const constant = state.constant;
			state.next();
			return new ExpressionConstantNode( pos, constant );
		}
		else if ( state.isBracketsOpen ) {
			let index = 0;
			const subs = new Map<number | string, ExpressionNode>();
			while ( !state.next().isBracketsClose ) {
				if ( state.isType ) {
					const type = state.type;
					if ( !state.next().isToken ) {
						throw new Error( `missing property name` );
					}
					const token = state.token;
					if ( !state.next().isAssignment ) {
						throw new Error( `missing assignment operator` );
					}
					subs.set( token, this.cast( type, this.disjunction( state.next(), scope ) ) );
				}
				else {
					subs.set( index, this.disjunction( state, scope ) );
				}
				++index;
				if ( !state.isSeparator ) {
					break;
				}
			}
			if ( !state.isBracketsClose ) {
				throw new Error( `missing closing brackets` );
			}
			state.next();
			const keys = Array.from( subs.keys() );
			return keys.every( key => typeof key === 'number' ) ?
				new ExpressionFunctionNode( pos, operConcat, Array.from( subs.values() ) ) :
				new ExpressionFunctionNode( pos, operConstr, keys.map( key => 
					new ExpressionFunctionNode( pos, operConcat, [
						new ExpressionConstantNode( pos, new ExpressionConstant( key.toString() ) ),
						subs.get( key )!
					] )
				) ) ;
		}
		else if ( state.isBracketsClose ) {
			throw new Error( `unexpected closing brackets` );
		}
		else if ( state.isParenthesesOpen ) {
			const node = this.disjunction( state.next(), scope );
			if ( !state.isParenthesesClose ) {
				throw new Error( `missing closing parenthesis` );
			}
			state.next();
			return node;
		}
		else if ( state.isParenthesesClose ) {
			throw new Error( `unexpected closing parentheses` );
		}
		else if ( state.isType ) {
			throw new Error( `unexpected type declaration` );
		}
		throw new Error( `unknown state ${ JSON.stringify( state ) }` );
	}

	protected arguments( arity: number, state: ExpressionState, scope: symbol ): ExpressionNode[] {
		const nodes: ExpressionNode[] = [];
		if ( !state.next().isParenthesesOpen ) {
			throw new Error( `missing opening parenthesis` );
		}
		while ( !state.next().isParenthesesClose ) {
			if ( state.isType ) {
				const type = state.type;
				if ( !state.next().isToken ) {
					throw new Error( `missing variable name` );
				}
				const pos = state.pos;
				const token = state.token;
				if ( this._variables.get( scope )?.get( token ) ) {
					throw new Error( `variable redefinition` );
				}
				if ( !state.next().isScope ) {
					throw new Error( `missing scope operator` );
				}
				const subscope = Symbol();
				const variables = new Map<string, ExpressionVariable>();
				this._variables.get( scope )?.forEach( ( value, key ) => variables.set( key, value ) );
				const variable = new ExpressionVariable( undefined, type );
				variables.set( token, variable );
				this._variables.set( subscope, variables );
				nodes.push( new ExpressionVariableNode( pos, variable ), this.disjunction( state.next(), subscope ) );
			}
			else {
				nodes.push( this.disjunction( state, scope ) );
			}
			if ( !state.isSeparator ) {
				break;
			}
		}
		if ( !state.isParenthesesClose ) {
			throw new Error( `missing closing parenthesis` );
		}
		if ( nodes.length < arity ) {
			throw new Error( `missing function arguments: found ${ nodes.length } expected ${ arity }` );
		}
		return nodes;
	}

	protected cast( type: ExpressionType, node: ExpressionNode ): ExpressionNode {
		return new ExpressionFunctionNode( node.pos, new ExpressionFunction( ( value: ExpressionValue ) => value, [ typeVar ], type ), [ node ] );
	}

}
