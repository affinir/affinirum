import { ExpressionConstant,
	constTrue, constFalse, constNan, constPi, constEpsilon } from './ExpressionConstant.js';
import { ExpressionFunction, funcOr, funcAnd, funcNot, funcGt, funcLt, funcGe, funcLe, funcEq, funcNe,
	funcLike, funcUnlike, funcBeginof, funcEndof, funcPartof,
	funcAdd, funcSub, funcNeg, funcMul, funcDiv, funcRem, funcMod, funcPct, funcExp, funcLog, funcPow, funcRt, funcSq, funcSqrt,
	funcAbs, funcCeil, funcFloor, funcRound, funcMax, funcMin,
	funcLen, funcTrim, funcLowercase, funcUppercase, funcSubstr, funcConcat, funcFlat, funcAt } from './ExpressionFunction.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEq, operNe,
	operLike, operUnlike, operBeginof, operEndof, operPartof,
	operAdd, operSub, operNeg, operMul, operDiv, operPct, operPow, operConcat, operAt } from './ExpressionOperator.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionValue, ExpressionType, typeAny, typeArray } from './ExpressionType.js';
import { ExpressionState } from './ExpressionState.js';
import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionFunctionNode } from './ExpressionFunctionNode.js';
import { ExpressionIteratorNode } from './ExpressionIteratorNode.js';
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
		[ 'substr', funcSubstr ], [ 'at', funcAt ], [ 'concat', funcConcat ], [ 'flat', funcFlat ],
	] );
	protected _variables = new Map<string, ExpressionVariable>();
	protected _iterators = new Map<ExpressionNode | undefined, Map<string, ExpressionVariable>>();
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
		const type = config?.type ?? typeAny;
		config?.constants?.forEach( c => this._constants.set( c.name, new ExpressionConstant( c.value ) ) );
		config?.functions?.forEach( f => this._functions.set( f.name, new ExpressionFunction( f.func, f.argTypes, f.type ) ) );
		config?.variables?.forEach( v => this._variables.set( v.name, new ExpressionVariable( undefined, v.type ) ) );
		const state = new ExpressionState( this._constants, this._functions, this._expr );
		try {
			this._root = this.compile( this.disjunction( state.next() ), type );
		}
		catch ( err ) {
			throw new Error( `compilation error on ${ ( err as Error ).message } at position ${ state.pos }:\n` +
				`${ this._expr.substring( state.pos ) }` );
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
	evaluate( variables: Record<string, ExpressionValue> ): ExpressionValue {
		for ( const [ name, variable ] of this._variables ) {
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

	protected disjunction( state: ExpressionState, context?: ExpressionNode ): ExpressionNode {
		let node = this.conjunction( state, context );
		while ( state.func === operOr ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.conjunction( state.next(), node ) ] );
		}
		return node;
	}

	protected conjunction( state: ExpressionState, context?: ExpressionNode ): ExpressionNode {
		let node = this.comparison( state, context );
		while ( state.func === operAnd ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.comparison( state.next(), node ) ] );
		}
		return node;
	}

	protected comparison( state: ExpressionState, context?: ExpressionNode ): ExpressionNode {
		let not = false;
		let pos = -1;
		while ( state.func === operNot ) {
			not = !not;
			pos = state.pos;
			state.next();
		}
		let node = this.aggregate( state, context );
		while ( state.func === operGt || state.func === operLt || state.func === operGe || state.func === operLe ||
			state.func === operEq || state.func === operNe || state.func === operLike || state.func === operUnlike ||
			state.func === operBeginof || state.func === operEndof || state.func === operPartof ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.aggregate( state.next(), node ) ] );
		}
		if ( not ) {
			node = new ExpressionFunctionNode( pos, operNot, [ node ] );
		}
		return node;
	}

	protected aggregate( state: ExpressionState, context?: ExpressionNode ): ExpressionNode {
		let node = this.product( state, context );
		while ( state.func === operConcat || state.func === operAdd || state.func === operSub ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.product( state.next(), node ) ] );
		}
		return node;
	}

	protected product( state: ExpressionState, context?: ExpressionNode ): ExpressionNode {
		let node = this.factor( state, context );
		while ( state.func === operMul || state.func === operDiv || state.func === operPct ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.factor( state.next(), node ) ] );
		}
		return node;
	}

	protected factor( state: ExpressionState, context?: ExpressionNode ): ExpressionNode {
		let neg = false;
		let pos = -1;
		while ( state.func === operSub ) {
			neg = !neg;
			pos = state.pos;
			state.next();
		}
		let node = this.index( state, context );
		while ( state.func === operPow ) {
			node = new ExpressionFunctionNode( state.pos, state.func,
				[ node, this.index( state.next(), node ) ] );
		}
		if ( neg ) {
			node = new ExpressionFunctionNode( pos, operNeg, [ node ] );
		}
		return node;
	}

	protected index( state: ExpressionState, context?: ExpressionNode ): ExpressionNode {
		let node = this.term( state, context );
		while ( state.isIndexer || state.isBracketsOpen ) {
			if ( state.isIndexer ) {
				node = new ExpressionFunctionNode( state.pos, operAt,
					[ node, new ExpressionConstantNode( state.pos, new ExpressionConstant( state.next().token ) ) ] );
				if ( state.isToken ) {
					state.next();
				}
				else {
					throw new Error( `missing property name` );
				}
			}
			else {
				node = new ExpressionFunctionNode( state.pos, operAt,
					[ node, this.disjunction( state.next(), node ) ] );
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

	protected term( state: ExpressionState, context?: ExpressionNode ): ExpressionNode {
		const pos = state.pos;
		if ( state.isFunction ) {
			const func = state.func;
			const subs = [];
			state.next();
			if ( state.isParenthesesOpen ) {
				do {
					subs.push( this.disjunction( state.next(), context ) );
				}
				while ( state.isSeparator );
				if ( state.isParenthesesClose ) {
					if ( subs.length >= func.arity ) {
						state.next();
						return new ExpressionFunctionNode( pos, func, subs );
					}
					throw new Error( `missing function arguments` );
				}
				throw new Error( `missing closing parenthesis` );
			}
			throw new Error( `unexpected operator or missing opening parenthesis` );
		}
		else if ( state.isToken ) {
			const iterators = this._iterators.get( context );
			if ( state.token === 'cycle' ) {
				if ( !state.next().isToken ) {
					throw new Error( `missing iterator variable name` );
				}
				const iterator = state.token;
				// TODO
				const variable = new ExpressionVariable();
				if ( state.next().token !== 'in' ) {
					throw new Error( `missing iterator delimiter` );
				}
				const array = this.disjunction( state.next(), context );
				const sub = this.compile( this.disjunction( state.next(), context ), typeAny );
				if ( iterators ) {
					iterators.set( iterator, variable );
				}
				else {
					this._iterators.set( context, new Map<string, ExpressionVariable>( [ [ iterator, variable ] ] ) );
				}
				const func = new ExpressionFunction( ( arg: ( boolean[] | number[] | string[] | object[] )[] ) => {
					return arg.map( i => {
						variable.value = i;
						return sub.evaluate();
					} );
				}, [ typeArray ], typeArray );
				return new ExpressionFunctionNode( pos, func, [ array ] );
			}
			let variable = this._variables.get( state.token );
			if ( variable == null ) {
				variable = iterators?.get( state.token );
				if ( variable == null ) {
					variable = new ExpressionVariable( state.token );
					this._variables.set( state.token, variable );
				}
			}
			state.next();
			return new ExpressionVariableNode( pos, variable );
		}
		else if ( state.isConstant ) {
			const node = new ExpressionConstantNode( pos, state.constant );
			state.next();
			return node;
		}
		else if ( state.isBracketsOpen ) {
			const subs = [];
			do {
				subs.push( this.disjunction( state.next(), context ) );
			}
			while ( state.isSeparator );
			if ( state.isBracketsClose ) {
				state.next();
				return new ExpressionFunctionNode( pos, operConcat, subs );
			}
			throw new Error( `missing closing brackets` );
		}
		else if ( state.isBracketsClose ) {
			throw new Error( `empty brackets` );
		}
		else if ( state.isParenthesesOpen ) {
			const node = this.disjunction( state.next(), context );
			if ( state.isParenthesesClose ) {
				state.next();
				return node;
			}
			throw new Error( `missing closing parenthesis` );
		}
		else if ( state.isParenthesesClose ) {
			throw new Error( `empty parentheses` );
		}
		throw new Error( `unknown state ${ JSON.stringify( state ) }` );
	}

	protected compile( node: ExpressionNode, type: ExpressionType ): ExpressionNode {
		try {
			return node.compile( type );
		}
		catch ( errnode: any ) {
			throw new TypeError( `compilation error on unexpected type ${ errnode.type } at position ${ errnode.pos }:\n` +
				`${ this._expr.substring( errnode.pos ) }` );
		}
	}

}
