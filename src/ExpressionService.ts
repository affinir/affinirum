import { ExpressionConstant,
	constNull, constTrue, constFalse, constNaN, constPosInf, constNegInf, constEpsilon, constPi } from './ExpressionConstant.js';
import { ExpressionFunction, funcNot, funcAnd, funcOr, funcGt, funcLt, funcGe, funcLe, funcEqual, funcNotEqual, funcLike, funcNotLike,
	funcBeginsWith, funcEndsWith, funcContains, funcSwitch, funcNullco,
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
import { ExpressionStatementNode } from './ExpressionStatementNode.js';

export class ExpressionService {

	protected readonly _expr: string;
	protected readonly _root: ExpressionNode;
	protected _constants = new Map<string, ExpressionConstant>( [
		[ 'null', constNull ], [ 'true', constTrue ], [ 'false', constFalse ],
		[ 'NaN', constNaN ], [ 'PosInf', constPosInf ], [ 'NegInf', constNegInf ], [ 'Epsilon', constEpsilon ], [ 'Pi', constPi ],
	] );
	protected _functions = new Map<string, ExpressionFunction>( [
		[ 'or', funcOr ], [ 'and', funcAnd ], [ 'not', funcNot ],
		[ 'gt', funcGt ], [ 'lt', funcLt ], [ 'ge', funcGe ], [ 'le', funcLe ],
		[ 'equal', funcEqual ], [ 'nequal', funcNotEqual ], [ 'like', funcLike ], [ 'nlike', funcNotLike ],
		[ 'beginsWith', funcBeginsWith ], [ 'endsWith', funcEndsWith ], [ 'contains', funcContains ], [ 'switch', funcSwitch ], [ 'nullco', funcNullco ],
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
		this._expr = expr;
		const type = config?.type ?? typeVar;
		config?.constants?.forEach( c => this._constants.set( c.name, new ExpressionConstant( c.value ) ) );
		config?.functions?.forEach( f => this._functions.set( f.name, new ExpressionFunction( f.func, f.type, f.argTypes, f.minArity, f.maxArity, f.typeInference ) ) );
		config?.variables?.forEach( v => this._scope.set( v.name, new ExpressionVariable( undefined, v.type ) ) );
		const state = new ExpressionState( this._expr );
		try {
			this._root = this.disjunction( state.next(), this._scope );
		}
		catch ( err ) {
			let pos = state.pos - 32;
			pos = pos < 0 ? 0 : pos;
			throw new Error( `compilation error on ${ ( err as Error ).message } at position ${ state.pos }:\n` +
				`${ this._expr.substring( pos, pos + 60 ) }\n` +
				`${ ' '.repeat( this._expr.substring( pos, state.pos ).length ) }^` );
		}
		try {
			this._root = this._root.compile( type );
		}
		catch ( errnode: any ) {
			let pos = errnode.pos - 32;
			pos = pos < 0 ? 0 : pos;
			throw new TypeError( `compilation error on unexpected value not matching type ${ errnode.type } at position ${ errnode.pos }:\n` +
				`${ this._expr.substring( pos, pos + 60 ) }\n` +
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
		Returns record with unassigned compiled variable names and expected types.
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
			const variable = variables[ name ];
			if ( values[ name ] == null ) {
				values[ name ] = undefined;
			}
			if ( !variable.type.infer( ExpressionType.of( values[ name ] ) ) ) {
				throw new TypeError( `evaluation error on unexpected type ${ typeof values[ name ] } for ${ variable.type } variable ${ name }` );
			}
			variable.value = values[ name ];
		}
		return this._root.evaluate();
	}

	protected disjunction( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.conjunction( state, scope );
		while ( state.operator === operOr ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.conjunction( state.next(), scope ) ] );
		}
		return node;
	}

	protected conjunction( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.comparison( state, scope );
		while ( state.operator === operAnd ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.comparison( state.next(), scope ) ] );
		}
		return node;
	}

	protected comparison( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let not = false;
		let pos = -1;
		while ( state.operator === operNot ) {
			not = !not;
			pos = state.pos;
			state.next();
		}
		let node = this.aggregate( state, scope );
		while ( state.operator === operGt || state.operator === operLt || state.operator === operGe || state.operator === operLe ||
			state.operator === operEqual || state.operator === operNotEqual || state.operator === operLike || state.operator === operNotLike ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.aggregate( state.next(), scope ) ] );
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
				[ node, this.product( state.next(), scope ) ] );
		}
		return node;
	}

	protected product( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.factor( state, scope );
		while ( state.operator === operMul || state.operator === operDiv || state.operator === operPct ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.factor( state.next(), scope ) ] );
		}
		return node;
	}

	protected factor( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
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

	protected coalescence( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.index( state, scope );
		while ( state.operator === operNullco ) {
			node = new ExpressionFunctionNode( state.pos, state.operator,
				[ node, this.index( state.next(), scope ) ] );
		}
		return node;
	}

	protected index( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		let node = this.term( state, scope );
		while ( state.isBracketsOpen || state.isBracesOpen || state.operator === operAt || state.operator === operBy ) {
			if ( state.isBracketsOpen ) {
				node = new ExpressionFunctionNode( state.pos, operAt,
					[ node, this.disjunction( state.next(), scope ) ] );
				if ( state.isBracketsClose ) {
					state.next();
				}
				else {
					throw new Error( `missing closing brackets` );
				}
			}
			else if ( state.isBracesOpen ) {
				node = new ExpressionFunctionNode( state.pos, operBy,
					[ node, this.disjunction( state.next(), scope ) ] );
				if ( state.isBracesClose ) {
					state.next();
				}
				else {
					throw new Error( `missing closing braces` );
				}
			}
			else if ( state.operator === operAt ) {
				const pos = state.pos;
				if ( !state.next().isConstant || !state.constant.type.isNumber ) {
					throw new Error( `missing index specifier` );
				}
				node = new ExpressionFunctionNode( pos, operAt,
					[ node, new ExpressionConstantNode( state.pos, state.constant ) ] );
				state.next();
			}
			else {
				const pos = state.pos;
				if ( !state.next().isToken ) {
					throw new Error( `missing property or method name` );
				}
				const func = this._functions.get( state.token );
				node = func != null ?
					new ExpressionFunctionNode( pos, func,
						[ node, ...this.arguments( func.minArity - 1, func.maxArity - 1, state.next(), scope ) ] ) :
					new ExpressionFunctionNode( pos, operBy,
						[ node, new ExpressionConstantNode( state.pos, new ExpressionConstant( state.token ) ) ] );
				state.next();
			}
		}
		return node;
	}

	protected term( state: ExpressionState, scope: ExpressionScope ): ExpressionNode {
		if ( state.isConstant ) {
			const pos = state.pos;
			const constant = state.constant;
			state.next();
			return new ExpressionConstantNode( pos, constant );
		}
		else if ( state.isToken ) {
			const pos = state.pos;
			const token = state.token;
			const constant = this._constants.get( token );
			if ( constant != null ) {
				state.next();
				return new ExpressionConstantNode( pos, constant );
			}
			const func = this._functions.get( token );
			if ( func != null ) {
				const subnodes = this.arguments( func.minArity, func.maxArity, state.next(), scope );
				state.next();
				return new ExpressionFunctionNode( pos, func, subnodes );
			}
			let variable = scope.get( token );
			if ( variable != null ) {
				state.next();
				return new ExpressionVariableNode( pos, variable );
			}
			variable = new ExpressionVariable();
			if ( !state.next().isAssignment ) {
				scope.set( token, variable );
				return new ExpressionVariableNode( pos, variable );
			}
			scope.set( token, variable, true );
			const subnode = this.disjunction( state.next(), scope );
			if ( !state.isSeparator ) {
				throw new Error( `missing statement separator` );
			}
			return new ExpressionStatementNode( pos, variable, subnode, this.disjunction( state.next(), scope ) );
		}
		else if ( state.isType ) {
			const pos = state.pos;
			let type = state.type;
			if ( state.next().isNullable ) {
				type = type.nullable();
				state.next();
			}
			if ( !state.isParenthesesOpen ) {
				throw new Error( `missing openning parentheses` );
			}
			const variables = new Map<string, ExpressionVariable>();
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
				if ( scope.get( token ) ) {
					throw new Error( `variable redefinition` );
				}
				variables.set( token, new ExpressionVariable( undefined, argType ) );
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
			return new ExpressionClosureNode( pos, Array.from( variables.values() ), type, this.disjunction( state.next(), scope.subscope( variables ) ) );
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
		else if ( state.isBracketsOpen ) {
			const pos = state.pos;
			const subnodes: ExpressionNode[] = [];
			for ( let i = 0; !state.next().isBracketsClose; ++i ) {
				subnodes.push( this.disjunction( state, scope ) );
				if ( !state.isSeparator ) {
					break;
				}
			}
			if ( !state.isBracketsClose ) {
				throw new Error( `missing closing brackets` );
			}
			state.next();
			return new ExpressionFunctionNode( pos, operConcat, subnodes );
		}
		else if ( state.isBracketsClose ) {
			throw new Error( `unexpected closing brackets` );
		}
		else if ( state.isBracesOpen ) {
			const pos = state.pos;
			const subnodes: ExpressionFunctionNode[] = [];
			for ( let i = 0; !state.next().isBracesClose; ++i ) {
				if ( !state.isToken ) {
					throw new Error( `missing property name` );
				}
				const namenode = new ExpressionConstantNode( state.pos, new ExpressionConstant( state.token ) );
				if ( !state.next().isAssignment ) {
					throw new Error( `missing property assignment` );
				}
				subnodes.push( new ExpressionFunctionNode( namenode.pos, operConcat, [ namenode, this.disjunction( state.next(), scope ) ] ) );
				if ( !state.isSeparator ) {
					break;
				}
			}
			if ( !state.isBracesClose ) {
				throw new Error( `missing closing braces` );
			}
			state.next();
			return new ExpressionFunctionNode( pos, funcConstruct, subnodes );
		}
		else if ( state.isBracesClose ) {
			throw new Error( `unexpected closing braces` );
		}
		throw new Error( `unknown state ${ JSON.stringify( state ) }` );
	}

	protected arguments( minArity: number, maxArity: number, state: ExpressionState, scope: ExpressionScope ): ExpressionNode[] {
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
		if ( nodes.length < minArity ) {
			throw new Error( `insufficient number of arguments ${ nodes.length } is less than ${ minArity } that function requires` );
		}
		if ( nodes.length > maxArity ) {
			throw new Error( `excessive number of arguments ${ nodes.length } is more than ${ minArity } that function requires` );
		}
		return nodes;
	}

}
