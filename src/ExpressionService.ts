import { ExpressionConstant,
	constNull, constTrue, constFalse, constNaN, constPosInf, constNegInf, constEpsilon, constPi } from './ExpressionConstant.js';
import { ExpressionFunction, funcNot, funcAnd, funcOr, funcGt, funcLt, funcGe, funcLe, funcEqual, funcNotEqual, funcLike, funcNotLike,
	funcStartsWith, funcEndsWith, funcContains, funcSwitch, funcNullco,
	funcAdd, funcSub, funcNeg, funcMul, funcDiv, funcRem, funcMod, funcPct, funcExp, funcLog, funcPow, funcRt, funcSq, funcSqrt,
	funcAbs, funcCeil, funcFloor, funcRound, funcMax, funcMin,
	funcTrim, funcLowerCase, funcUpperCase, funcSubstr, funcChar, funcCharCode, funcLen,
	funcConcat, funcAt, funcFlatten, funcReverse, funcSlice,
	funcFirst, funcLast, funcFirstIndex, funcLastIndex, funcMap, funcFilter, funcAny, funcEvery,
	funcConstruct, funcJoin, funcBy } from './ExpressionFunction.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEqual, operNotEqual, operLike, operNotLike, operNullco,
	operAdd, operSub, operNeg, operMul, operDiv, operPct, operPow, operConcat, operAt, operJoin, operBy } from './ExpressionOperator.js';
import { ExpressionScope } from './ExpressionScope.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionType, ExpressionValue, typeVar } from './ExpressionType.js';
import { ExpressionState } from './ExpressionState.js';
import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionFunctionNode } from './ExpressionFunctionNode.js';
import { ExpressionVariableNode } from './ExpressionVariableNode.js';
import { ExpressionClosureNode } from './ExpressionClosureNode.js';
import { ExpressionTypeError } from './ExpressionTypeError.js';

export class ExpressionService {

	protected readonly _expression: string;
	protected readonly _statements: ExpressionNode[];
	protected _constants = new Map<string, ExpressionConstant>( [
		[ 'null', constNull ], [ 'true', constTrue ], [ 'false', constFalse ],
		[ 'NaN', constNaN ], [ 'PosInf', constPosInf ], [ 'NegInf', constNegInf ], [ 'Epsilon', constEpsilon ], [ 'Pi', constPi ],
	] );
	protected _functions = new Map<string, ExpressionFunction>( [
		[ 'or', funcOr ], [ 'and', funcAnd ], [ 'not', funcNot ],
		[ 'gt', funcGt ], [ 'lt', funcLt ], [ 'ge', funcGe ], [ 'le', funcLe ],
		[ 'equal', funcEqual ], [ 'nequal', funcNotEqual ], [ 'like', funcLike ], [ 'nlike', funcNotLike ],
		[ 'startsWith', funcStartsWith ], [ 'endsWith', funcEndsWith ], [ 'contains', funcContains ], [ 'switch', funcSwitch ], [ 'nullco', funcNullco ],
		[ 'add', funcAdd ], [ 'sub', funcSub ], [ 'neg', funcNeg ],
		[ 'mul', funcMul ], [ 'div', funcDiv ], [ 'rem', funcRem ], [ 'mod', funcMod ], [ 'pct', funcPct ],
		[ 'exp', funcExp ], [ 'log', funcLog ], [ 'pow', funcPow ], [ 'rt', funcRt ], [ 'sq', funcSq ], [ 'sqrt', funcSqrt ],
		[ 'abs', funcAbs ], [ 'ceil', funcCeil ], [ 'floor', funcFloor ], [ 'round', funcRound ], [ 'max', funcMax ], [ 'min', funcMin ],
		[ 'trim', funcTrim ], [ 'lowerCase', funcLowerCase ], [ 'upperCase', funcUpperCase ],
		[ 'substr', funcSubstr ], [ 'char', funcChar ], [ 'charCode', funcCharCode ], [ 'len', funcLen ],
		[ 'concat', funcConcat ], [ 'at', funcAt ], [ 'flatten', funcFlatten ], [ 'reverse', funcReverse ], [ 'slice', funcSlice ],
		[ 'first', funcFirst ], [ 'last', funcLast ], [ 'firstIndex', funcFirstIndex ], [ 'lastIndex', funcLastIndex ],
		[ 'map', funcMap ], [ 'filter', funcFilter ], [ 'any', funcAny ], [ 'every', funcEvery ],
		[ 'construct', funcConstruct ], [ 'join', funcJoin ], [ 'by', funcBy ],
	] );
	protected _scope = new ExpressionScope();

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
			type: ExpressionType,
			argTypes: ExpressionType[],
			minArity?: number,
			maxArity?: number,
			typeInference?: ( index: number, type: string, mask: string ) => boolean
		}[],
		variables?: {
			name: string,
			type: ExpressionType
		}[],
	} ) {
		this._expression = expr;
		const type = config?.type ?? typeVar;
		config?.constants?.forEach( c => this._constants.set( c.name, new ExpressionConstant( c.value ) ) );
		config?.functions?.forEach( f => this._functions.set( f.name, new ExpressionFunction( f.func, f.type, f.argTypes, f.minArity, f.maxArity, f.typeInference ) ) );
		config?.variables?.forEach( v => this._scope.set( v.name, new ExpressionVariable( undefined, v.type ) ) );
		const state = new ExpressionState( this._expression );
		try {
			this._statements = this.list( state.parse(), this._scope );
		}
		catch ( err ) {
			let pos = state.pos - 32;
			pos = pos < 0 ? 0 : pos;
			throw new Error( `parse error on ${ ( err as Error ).message } at position ${ state.pos }:\n` +
				`${ this._expression.substring( pos, pos + 60 ) }\n` +
				`${ ' '.repeat( this._expression.substring( pos, state.pos ).length ) }^` );
		}
		try {
			this._statements = this._statements.map( s => s.compile( type ) );
		}
		catch ( err ) {
			const terr = err as ExpressionTypeError;
			let pos = terr.pos - 32;
			pos = pos < 0 ? 0 : pos;
			throw new TypeError( `${ terr.message } on ${ terr.nodeType } not matching ${ terr.mismatchType } at position ${ terr.pos }:\n` +
				`${ this._expression.substring( pos, pos + 60 ) }\n` +
				`${ ' '.repeat( this._expression.substring( pos, terr.pos ).length ) }^` );
		}
	}

	/**
		Returns compiled expression return value type.
	*/
	get type(): ExpressionType {
		return this._statements[ this._statements.length - 1 ].type;
	}

	/**
		Returns record with undefined compiled variable names and expected types.
		@returns Record with variable names and types.
	*/
	variables(): Record<string, ExpressionType> {
		const types: Record<string, ExpressionType> = {};
		const variables = this._scope.variables();
		for ( const name in variables ) {
			types[ name ] = variables[ name ].type;
		}
		return types;
	}

	/**
		Evaluates compiled expression using provided variable values.
		@param values Record with variable names and values.
		@returns Calculated value.
	*/
	evaluate( values: Record<string, ExpressionValue> ): ExpressionValue {
		const variables = this._scope.variables();
		for ( const name in variables ) {
			if ( !values.hasOwnProperty( name ) ) {
				throw new Error( `evaluation error on undefined variable ${ name }` );
			}
			const variable = variables[ name ];
			const value = values[ name ] ?? undefined;
			if ( !variable.type.infer( ExpressionType.of( value ) ) ) {
				throw new TypeError( `evaluation error on unexpected type ${ typeof value } for variable ${ name } of type ${ variable.type }` );
			}
			variable.value = value;
		}
		return this._statements.map( s => s.evaluate() )[ this._statements.length - 1 ];
	}

	protected list( state: ExpressionState, scope: ExpressionScope ): ExpressionNode[] {
		const nodes: ExpressionNode[] = [ this.disjunction( state, scope ) ];
		while ( state.isSeparator ) {
			nodes.push( this.disjunction( state.parse(), scope ) );
		}
		return nodes;
	}

	protected disjunction( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.conjunction( state, scope );
		while ( state.operator === operOr ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.conjunction( state.parse(), scope ) ] );
		}
		return node;
	}

	protected conjunction( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.comparison( state, scope );
		while ( state.operator === operAnd ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.comparison( state.parse(), scope ) ] );
		}
		return node;
	}

	protected comparison( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let not = false;
		let pos = -1;
		while ( state.operator === operNot ) {
			not = !not;
			pos = state.pos;
			state.parse();
		}
		let node = this.aggregate( state, scope );
		while ( state.operator === operGt || state.operator === operLt || state.operator === operGe || state.operator === operLe ||
			state.operator === operEqual || state.operator === operNotEqual || state.operator === operLike || state.operator === operNotLike ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.aggregate( state.parse(), scope ) ] );
		}
		if ( not ) {
			node = new ExpressionFunctionNode( pos, operNot, [ node ] );
		}
		return node;
	}

	protected aggregate( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.product( state, scope );
		while ( state.operator === operJoin || state.operator === operConcat || state.operator === operAdd || state.operator === operSub ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.product( state.parse(), scope ) ] );
		}
		return node;
	}

	protected product( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.factor( state, scope );
		while ( state.operator === operMul || state.operator === operDiv || state.operator === operPct ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.factor( state.parse(), scope ) ] );
		}
		return node;
	}

	protected factor( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let neg = false;
		let pos = -1;
		while ( state.operator === operSub ) {
			neg = !neg;
			pos = state.pos;
			state.parse();
		}
		let node = this.coalescence( state, scope );
		while ( state.operator === operPow ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.coalescence( state.parse(), scope ) ] );
		}
		if ( neg ) {
			node = new ExpressionFunctionNode( pos, operNeg, [ node ] );
		}
		return node;
	}

	protected coalescence( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.accessor( state, scope );
		while ( state.operator === operNullco ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.accessor( state.parse(), scope ) ] );
		}
		return node;
	}

	protected accessor( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.term( state, scope );
		while ( state.isBracketsOpen || state.isBracesOpen || state.operator === operAt || state.operator === operBy ) {
			if ( state.isBracketsOpen ) {
				node = new ExpressionFunctionNode( state.pos, operAt,
					[ node, this.disjunction( state.parse(), scope ) ] );
				if ( state.isBracketsClose ) {
					state.parse();
				}
				else {
					throw new Error( `missing closing brackets` );
				}
			}
			else if ( state.isBracesOpen ) {
				node = new ExpressionFunctionNode( state.pos, operBy,
					[ node, this.disjunction( state.parse(), scope ) ] );
				if ( state.isBracesClose ) {
					state.parse();
				}
				else {
					throw new Error( `missing closing braces` );
				}
			}
			else if ( state.operator === operAt ) {
				const pos = state.pos;
				if ( !state.parse().isLiteral || !state.literal.type.isNumber ) {
					throw new Error( `missing index specifier` );
				}
				node = new ExpressionFunctionNode( pos, operAt,
					[ node, new ExpressionConstantNode( state.pos, state.literal ) ] );
				state.parse();
			}
			else {
				const pos = state.pos;
				if ( !state.parse().isToken ) {
					throw new Error( `missing property or method name` );
				}
				const func = this._functions.get( state.token );
				node = func != null ?
					new ExpressionFunctionNode( pos, func,
						[ node, ...this.arguments( func.minArity - 1, func.maxArity - 1, state.parse(), scope ) ] ) :
					new ExpressionFunctionNode( pos, operBy,
						[ node, new ExpressionConstantNode( state.pos, new ExpressionConstant( state.token ) ) ] );
				state.parse();
			}
		}
		return node;
	}

	protected term( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		if ( state.isLiteral ) {
			const pos = state.pos;
			const constant = state.literal;
			state.parse();
			return new ExpressionConstantNode( pos, constant );
		}
		/*else if ( state.isConstant ) {
			const pos = state.pos;
			if ( !state.parse().isToken ) {
				throw new Error( `missing constant name` );
			}
			const token = state.token;
			if ( !state.parse().isAssignment ) {
				throw new Error( `missing constant value` );
			}
			variable = new ExpressionVariable();
			const subnode = this.disjunction( state.parse(), scope );
			return new ExpressionVariableNode( pos, variable, subnode );
		}*/
		else if ( state.isToken ) {
			const pos = state.pos;
			const token = state.token;
			const constant = this._constants.get( token );
			if ( constant != null ) {
				state.parse();
				return new ExpressionConstantNode( pos, constant );
			}
			const func = this._functions.get( token );
			if ( func != null ) {
				const subnodes = this.arguments( func.minArity, func.maxArity, state.parse(), scope );
				state.parse();
				return new ExpressionFunctionNode( pos, func, subnodes );
			}
			let variable = scope.get( token );
			if ( variable == null ) {
				variable = new ExpressionVariable();
				scope.set( token, variable );
			}
			return new ExpressionVariableNode( pos, variable, state.parse().isAssignment ? this.disjunction( state.parse(), scope ) : undefined );
		}
		else if ( state.isType ) {
			const pos = state.pos;
			let type = state.type;
			if ( state.parse().isNullable ) {
				type = type.nullable();
				state.parse();
			}
			if ( state.isToken ) {
				const token = state.token;
				if ( scope.has( token ) ) {
					throw new Error( `variable ${ token } redefinition` );
				}
				const variable = new ExpressionVariable();
				scope.define( token, variable );
				return new ExpressionVariableNode( pos, variable, state.parse().isAssignment ? this.disjunction( state.parse(), scope ) : undefined );
			}
			if ( !state.isParenthesesOpen ) {
				throw new Error( `missing openning parentheses` );
			}
			const variables = new Map<string, ExpressionVariable>();
			while ( !state.parse().isParenthesesClose ) {
				if ( !state.isType ) {
					throw new Error( `missing argument type` );
				}
				let argType = state.type;
				if ( state.parse().isNullable ) {
					argType = argType.nullable();
					state.parse();
				}
				if ( !state.isToken ) {
					throw new Error( `missing argument name` );
				}
				const token = state.token;
				if ( scope.get( token ) ) {
					throw new Error( `variable redefinition` );
				}
				variables.set( token, new ExpressionVariable( undefined, argType ) );
				if ( !state.parse().isSeparator ) {
					break;
				}
			}
			if ( !state.isParenthesesClose ) {
				throw new Error( `missing closing parenthesis` );
			}
			if ( !state.parse().isScope ) {
				throw new Error( `missing scope operator` );
			}
			return new ExpressionClosureNode( pos, Array.from( variables.values() ), type, this.list( state.parse(), scope.subscope( variables ) ) );
		}
		else if ( state.isParenthesesOpen ) {
			const node = this.disjunction( state.parse(), scope );
			if ( !state.isParenthesesClose ) {
				throw new Error( `missing closing parenthesis` );
			}
			state.parse();
			return node;
		}
		else if ( state.isParenthesesClose ) {
			throw new Error( `unexpected closing parentheses` );
		}
		else if ( state.isBracketsOpen ) {
			const pos = state.pos;
			const subnodes: ExpressionNode[] = [];
			while ( !state.parse().isBracketsClose ) {
				subnodes.push( this.disjunction( state, scope ) );
				if ( !state.isSeparator ) {
					break;
				}
			}
			if ( !state.isBracketsClose ) {
				throw new Error( `missing closing brackets` );
			}
			state.parse();
			return new ExpressionFunctionNode( pos, operConcat, subnodes );
		}
		else if ( state.isBracketsClose ) {
			throw new Error( `unexpected closing brackets` );
		}
		else if ( state.isBracesOpen ) {
			const pos = state.pos;
			const subnodes: ExpressionFunctionNode[] = [];
			while ( !state.parse().isBracesClose ) {
				if ( !state.isToken ) {
					throw new Error( `missing property name` );
				}
				const namenode = new ExpressionConstantNode( state.pos, new ExpressionConstant( state.token ) );
				if ( !state.parse().isAssignment ) {
					throw new Error( `missing property assignment` );
				}
				subnodes.push( new ExpressionFunctionNode( namenode.pos, operConcat, [ namenode, this.disjunction( state.parse(), scope ) ] ) );
				if ( !state.isSeparator ) {
					break;
				}
			}
			if ( !state.isBracesClose ) {
				throw new Error( `missing closing braces` );
			}
			state.parse();
			return new ExpressionFunctionNode( pos, funcConstruct, subnodes );
		}
		else if ( state.isBracesClose ) {
			throw new Error( `unexpected closing braces` );
		}
		else if ( state.isFinal ) {
			throw new Error( `unexpected end of expression` );
		}
		throw new Error( `unexpected expression token` );
	}

	protected arguments( minArity: number, maxArity: number, state: ExpressionState, scope: ExpressionScope ): ExpressionNode[] {
		if ( !state.isParenthesesOpen ) {
			throw new Error( `missing opening parentheses` );
		}
		const subnodes: ExpressionNode[] = [];
		while ( !state.parse().isParenthesesClose ) {
			subnodes.push( this.disjunction( state, scope ) );
			if ( !state.isSeparator ) {
				break;
			}
		}
		if ( !state.isParenthesesClose ) {
			throw new Error( `missing closing parentheses` );
		}
		if ( subnodes.length < minArity ) {
			throw new Error( `insufficient number of arguments ${ subnodes.length } is less than ${ minArity } that function requires` );
		}
		if ( subnodes.length > maxArity ) {
			throw new Error( `excessive number of arguments ${ subnodes.length } is more than ${ minArity } that function requires` );
		}
		return subnodes;
	}

}
