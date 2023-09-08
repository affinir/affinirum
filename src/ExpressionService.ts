import { ExpressionConstant,
	constNull, constTrue, constFalse, constNaN, constPosInf, constNegInf, constEpsilon, constPi } from './ExpressionConstant.js';
import { ExpressionFunction, funcOr, funcAnd, funcNot, funcGt, funcLt, funcGe, funcLe, funcEq, funcNe,
	funcLike, funcUnlike, funcBeginof, funcEndof, funcPartof,
	funcAdd, funcSub, funcNeg, funcMul, funcDiv, funcRem, funcMod, funcPct, funcExp, funcLog, funcPow, funcRt, funcSq, funcSqrt,
	funcAbs, funcCeil, funcFloor, funcRound, funcIf, funcMax, funcMin,
	funcLen, funcTrim, funcLowercase, funcUppercase, funcSubstr, funcConcat, funcFlatten, funcReverse, funcSlice, funcAt,
	funcFirst, funcLast, funcFirstindex, funcLastindex, funcMap, funcFilter, funcAny, funcEvery, funcConstr, funcCoal } from './ExpressionFunction.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEq, operNe,
	operLike, operUnlike, operBeginof, operEndof, operPartof,
	operAdd, operSub, operNeg, operMul, operDiv, operPct, operPow, operConcat, operAt, operConstr, operCoal } from './ExpressionOperator.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionLambda } from './ExpressionLambda.js';
import { ExpressionType, ExpressionValue, typeVar } from './ExpressionType.js';
import { ExpressionState } from './ExpressionState.js';
import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionFunctionNode } from './ExpressionFunctionNode.js';
import { ExpressionVariableNode } from './ExpressionVariableNode.js';
import { ExpressionLambdaNode } from './ExpressionLambdaNode.js';

export class ExpressionService {

	protected readonly _expr: string;
	protected readonly _root: ExpressionNode;
	protected readonly _scope = Symbol();
	protected _constants = new Map<string, ExpressionConstant>( [
		[ 'null', constNull ], [ 'true', constTrue ], [ 'false', constFalse ],
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
		[ 'abs', funcAbs ], [ 'ceil', funcCeil ], [ 'floor', funcFloor ], [ 'round', funcRound ], [ 'if', funcIf ], [ 'max', funcMax ], [ 'min', funcMin ],
		[ 'len', funcLen ], [ 'trim', funcTrim ], [ 'lowercase', funcLowercase ], [ 'uppercase', funcUppercase ], [ 'substr', funcSubstr ],
		[ 'concat', funcConcat ], [ 'concat', funcConcat ], [ 'flatten', funcFlatten ], [ 'reverse', funcReverse ], [ 'slice', funcSlice ], [ 'at', funcAt ],
		[ 'first', funcFirst ], [ 'last', funcLast ], [ 'firstindex', funcFirstindex ], [ 'lastindex', funcLastindex ],
		[ 'map', funcMap ], [ 'filter', funcFilter ],
		[ 'any', funcAny ], [ 'every', funcEvery ],
		[ 'constr', funcConstr ], [ 'coal', funcCoal ],
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
				variables[ name ] = undefined;
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
		while ( state.operator === operOr ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.conjunction( state.next(), scope ) ] );
		}
		return node;
	}

	protected conjunction( state: ExpressionState, scope: symbol ): ExpressionNode {
		let node = this.comparison( state, scope );
		while ( state.operator === operAnd ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.comparison( state.next(), scope ) ] );
		}
		return node;
	}

	protected comparison( state: ExpressionState, scope: symbol ): ExpressionNode {
		let not = false;
		let pos = -1;
		while ( state.operator === operNot ) {
			not = !not;
			pos = state.pos;
			state.next();
		}
		let node = this.aggregate( state, scope );
		while ( state.operator === operGt || state.operator === operLt || state.operator === operGe || state.operator === operLe ||
			state.operator === operEq || state.operator === operNe || state.operator === operLike || state.operator === operUnlike ||
			state.operator === operBeginof || state.operator === operEndof || state.operator === operPartof ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.aggregate( state.next(), scope ) ] );
		}
		if ( not ) {
			node = new ExpressionFunctionNode( pos, operNot, [ node ] );
		}
		return node;
	}

	protected aggregate( state: ExpressionState, scope: symbol ): ExpressionNode {
		let node = this.product( state, scope );
		while ( state.operator === operConcat || state.operator === operAdd || state.operator === operSub ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.product( state.next(), scope ) ] );
		}
		return node;
	}

	protected product( state: ExpressionState, scope: symbol ): ExpressionNode {
		let node = this.factor( state, scope );
		while ( state.operator === operMul || state.operator === operDiv || state.operator === operPct ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.factor( state.next(), scope ) ] );
		}
		return node;
	}

	protected factor( state: ExpressionState, scope: symbol ): ExpressionNode {
		let neg = false;
		let pos = -1;
		while ( state.operator === operSub ) {
			neg = !neg;
			pos = state.pos;
			state.next();
		}
		let node = this.coalescence( state, scope );
		while ( state.operator === operPow ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.coalescence( state.next(), scope ) ] );
		}
		if ( neg ) {
			node = new ExpressionFunctionNode( pos, operNeg, [ node ] );
		}
		return node;
	}

	protected coalescence( state: ExpressionState, scope: symbol ): ExpressionNode {
		let node = this.index( state, scope );
		while ( state.operator === operCoal ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.index( state.next(), scope ) ] );
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
					const subs = [ node, ...this.arguments( func.arity - 1, state.next(), scope ) ];
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
		if ( state.isConstant ) {
			const constant = state.constant;
			state.next();
			return new ExpressionConstantNode( pos, constant );
		}
		else if ( state.isToken ) {
			const token = state.token;
			state.next();
			return this.token( pos, token, state, scope );
		}
		else if ( state.isType ) {
			let type = state.type;
			if ( state.next().isNullable ) {
				type = type.nullable();
				state.next();
			}
			if ( !state.isParenthesesOpen ) {
				throw new Error( `missing openning parentheses` );
			}
			const variables = this._variables.get( scope );
			if ( !variables ) {
				throw new Error( `unknown scope` );
			}
			const subvariables = new Map<string, ExpressionVariable>();
			while ( !state.next().isParenthesesClose ) {
				if ( !state.isType ) {
					throw new Error( `missing argument type` );
				}
				let argType = state.type;
				if ( state.next().isNullable ) {
					argType = argType.nullable();
					state.next();
				}
				if ( !state.isToken ) {
					throw new Error( `missing argument name` );
				}
				const token = state.token;
				if ( variables.get( token ) ) {
					throw new Error( `variable redefinition` );
				}
				subvariables.set( token, new ExpressionVariable( undefined, argType ) );
				if ( !state.next().isSeparator ) {
					break;
				}
			}
			if ( !state.isParenthesesClose ) {
				throw new Error( `missing closing parenthesis` );
			}
			if ( !state.next().isScope ) {
				throw new Error( `missing scope operator` );
			}
			const args = Array.from( subvariables.values() );
			const subscope = Symbol();
			this._variables.set( subscope, subvariables );
			variables.forEach( ( value, key ) => subvariables.set( key, value ) );
			const subnode = this.disjunction( state.next(), subscope );
			return new ExpressionLambdaNode( pos, new ExpressionLambda( args, type ), subnode );
		}
		else if ( state.isBracketsOpen ) {
			const subs = new Map<number | string, ExpressionNode>();
			for ( let i = 0; !state.next().isBracketsClose; ++i ) {
				if ( state.isToken ) {
					const tokenPos = state.pos;
					const token = state.token;
					if ( state.next().isAssignment ) {
						subs.set( token, this.disjunction( state.next(), scope ) );
					}
					else {
						subs.set( i, this.token( tokenPos, token, state, scope ) );
					}
				}
				else {
					subs.set( i, this.disjunction( state, scope ) );
				}
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
				) );
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
		throw new Error( `unknown state ${ JSON.stringify( state ) }` );
	}

	protected token( pos: number, token: string, state: ExpressionState, scope: symbol ): ExpressionNode {
		const constant = this._constants.get( token );
		if ( constant != null ) {
			return new ExpressionConstantNode( pos, constant );
		}
		const func = this._functions.get( token );
		if ( func != null ) {
			const subs = this.arguments( func.arity, state, scope );
			state.next();
			return new ExpressionFunctionNode( pos, func, subs );
		}
		const variables = this._variables.get( scope );
		if ( !variables ) {
			throw new Error( `unknown scope` );
		}
		let variable = variables.get( token );
		if ( variable == null ) {
			variable = new ExpressionVariable( token );
			variables.set( token, variable );
		}
		return new ExpressionVariableNode( pos, variable );
	}

	protected arguments( arity: number, state: ExpressionState, scope: symbol ): ExpressionNode[] {
		const nodes: ExpressionNode[] = [];
		if ( !state.isParenthesesOpen ) {
			throw new Error( `missing opening parentheses` );
		}
		while ( !state.next().isParenthesesClose ) {
			nodes.push( this.disjunction( state, scope ) );
			if ( !state.isSeparator ) {
				break;
			}
		}
		if ( !state.isParenthesesClose ) {
			throw new Error( `missing closing parentheses` );
		}
		if ( nodes.length < arity ) {
			throw new Error( `missing arguments as function requires ${ arity } not ${ nodes.length }` );
		}
		return nodes;
	}

}
