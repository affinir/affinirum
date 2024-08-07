import { ExpressionConstant, constNull, constTrue, constFalse,
	constNaN, constPosInf, constNegInf, constEpsilon, constPi } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { funcSubbuf, funcByte, funcSubstr, funcChar, funcCharCode, funcSlice, funcFirst, funcLast, funcFirstIndex, funcLastIndex,
	funcAt, funcBy } from './ExpressionFunctionAccessor.js';
import { funcAdd, funcSub, funcNeg, funcMul, funcDiv, funcRem, funcMod, funcPct, funcExp, funcLog, funcPow, funcRt, funcSq, funcSqrt,
	funcAbs, funcCeil, funcFloor, funcRound, funcMax, funcMin } from './ExpressionFunctionCalculator.js';
import { funcNot, funcAnd, funcOr, funcGt, funcLt, funcGe, funcLe, funcEqual, funcNotEqual, funcLike, funcNotLike,
	funcNullco, funcIfThenElse, funcContains, funcStartsWith, funcEndsWith, funcEvery, funcAny } from './ExpressionFunctionComparator.js';
import { funcEncodeNum, funcDecodeNum, funcEncodeStr, funcDecodeStr,
	funcToHex, funcFromHex, funcFromJson, funcToJson } from './ExpressionFunctionConverter.js';
import { funcLen, funcAlphanum, funcTrim, funcTrimStart, funcTrimEnd, funcLowerCase, funcUpperCase,
	funcConcat, funcFlatten, funcReverse, funcRange, funcIterate, funcMap, funcFilter,
	funcConstruct, funcMerge } from './ExpressionFunctionGenerator.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEqual, operNotEqual, operLike, operNotLike,
	operAdd, operSub, operNeg, operMul, operDiv, operPct, operPow, operAt, operConcat, operBy, operMerge,
	operNullco, operIfThenElse } from './ExpressionOperator.js';
import { StaticScope } from './StaticScope.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { Type, Value, typeVariant } from './Type.js';
import { ParserState } from './ParserState.js';
import { Node, NodeTypeError } from './Node.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionFunctionNode } from './ExpressionFunctionNode.js';
import { ExpressionVariableNode } from './ExpressionVariableNode.js';
import { ExpressionClosureNode } from './ExpressionClosureNode.js';
import { ExpressionArrayNode } from './ExpressionArrayNode.js';
import { ExpressionObjectNode } from './ExpressionObjectNode.js';

export class Expression {

	protected readonly _expression: string;
	protected readonly _statements: Node[];
	protected _constants = new Map<string, ExpressionConstant>([
		[ 'null', constNull ], [ 'true', constTrue ], [ 'false', constFalse ],
		[ 'NaN', constNaN ], [ 'PosInf', constPosInf ], [ 'NegInf', constNegInf ], [ 'Epsilon', constEpsilon ], [ 'Pi', constPi ],
	]);
	protected _functions = new Map<string, ExpressionFunction>([
		[ 'subbuf', funcSubbuf ], [ 'byte', funcByte ], [ 'substr', funcSubstr ], [ 'char', funcChar ], [ 'charCode', funcCharCode ], [ 'slice', funcSlice ],
		[ 'first', funcFirst ], [ 'last', funcLast ], [ 'firstIndex', funcFirstIndex ], [ 'lastIndex', funcLastIndex ], [ 'at', funcAt ], [ 'by', funcBy ],
		[ 'add', funcAdd ], [ 'sub', funcSub ], [ 'neg', funcNeg ],
		[ 'mul', funcMul ], [ 'div', funcDiv ], [ 'rem', funcRem ], [ 'mod', funcMod ], [ 'pct', funcPct ],
		[ 'exp', funcExp ], [ 'log', funcLog ], [ 'pow', funcPow ], [ 'rt', funcRt ], [ 'sq', funcSq ], [ 'sqrt', funcSqrt ],
		[ 'abs', funcAbs ], [ 'ceil', funcCeil ], [ 'floor', funcFloor ], [ 'round', funcRound ], [ 'max', funcMax ], [ 'min', funcMin ],
		[ 'not', funcNot ], [ 'or', funcOr ], [ 'and', funcAnd ], [ 'gt', funcGt ], [ 'lt', funcLt ], [ 'ge', funcGe ], [ 'le', funcLe ],
		[ 'equal', funcEqual ], [ 'nequal', funcNotEqual ], [ 'like', funcLike ], [ 'nlike', funcNotLike ], [ 'nullco', funcNullco ], [ 'ifte', funcIfThenElse ],
		[ 'contains', funcContains ], [ 'startsWith', funcStartsWith ], [ 'endsWith', funcEndsWith ], [ 'any', funcAny ], [ 'every', funcEvery ],
		[ 'encodeNum', funcEncodeNum ], [ 'decodeNum', funcDecodeNum ], [ 'encodeStr', funcEncodeStr ], [ 'decodeStr', funcDecodeStr ],
		[ 'toHex', funcToHex ], [ 'fromHex', funcFromHex ], [ 'fromJson', funcFromJson ], [ 'toJson', funcToJson ],
		[ 'len', funcLen ], [ 'alphanum', funcAlphanum ], [ 'trim', funcTrim ], [ 'trimStart', funcTrimStart ], [ 'trimEnd', funcTrimEnd ],
		[ 'lowerCase', funcLowerCase ], [ 'upperCase', funcUpperCase ], [ 'concat', funcConcat ], [ 'flatten', funcFlatten ], [ 'reverse', funcReverse ],
		[ 'range', funcRange ], [ 'iterate', funcIterate ], [ 'map', funcMap ], [ 'filter', funcFilter ], [ 'construct', funcConstruct ], [ 'merge', funcMerge ],
	]);
	protected _scope = new StaticScope();

	/**
		Creates compiled expression. Any parsed token not recognized as a constant or a function will be compiled as a variable.
		@param expr Math expression to compile.
		@param config Optional constants and functions to add for the compilation.
	*/
	constructor(expr: string, config?: {
		type?: Type,
		variables?: {
			name: string,
			type: Type
		}[],
		constants?: {
			name: string,
			value: Value
		}[],
		functions?: {
			name: string,
			func: (...values: any[])=> Value,
			type: Type,
			argTypes: Type[],
			minArity?: number,
			maxArity?: number,
			typeInference?: (index: number, type: string, mask: string)=> boolean
		}[],
	}) {
		this._expression = expr;
		const type = config?.type ?? typeVariant;
		config?.variables?.forEach((v)=>
			this._scope.set(v.name, new ExpressionVariable(undefined, v.type)));
		config?.constants?.forEach((c)=>
			this._constants.set(c.name, new ExpressionConstant(c.value)));
		config?.functions?.forEach((f)=>
			this._functions.set(f.name, new ExpressionFunction(f.func, f.type, f.argTypes, f.minArity, f.maxArity, f.typeInference)));
		const state = new ParserState(this._expression);
		try {
			this._statements = this.list(state.next(), this._scope);
		}
		catch (err) {
			let pos = state.pos - 32;
			pos = pos < 0 ? 0 : pos;
			throw new Error(`parse error on ${(err as Error).message} at position ${state.pos}:\n` +
				`${this._expression.substring(pos, pos + 60)}\n` +
				`${' '.repeat(this._expression.substring(pos, state.pos).length)}^`);
		}
		try {
			this._statements = Node.compileList(this._statements, type);
		}
		catch (err) {
			const te = err as NodeTypeError;
			let pos = te.pos - 32;
			pos = pos < 0 ? 0 : pos;
			throw new TypeError(`${te.message} on ${te.nodeType} not matching ${te.mismatchType} at position ${te.pos}:\n` +
				`${this._expression.substring(pos, pos + 60)}\n` +
				`${' '.repeat(this._expression.substring(pos, te.pos).length)}^`);
		}
	}

	/**
		Returns compiled expression return value type.
	*/
	get type(): Type {
		return this._statements[ this._statements.length - 1 ].type;
	}

	/**
		Returns record with undefined compiled variable names and expected types.
		@returns Record with variable names and types.
	*/
	variables(): Record<string, Type> {
		const types: Record<string, Type> = {};
		const variables = this._scope.variables();
		for (const name in variables) {
			types[ name ] = variables[ name ].type;
		}
		return types;
	}

	/**
		Evaluates compiled expression using provided variable values.
		@param values Record with variable names and values.
		@returns Calculated value.
	*/
	evaluate(values: Record<string, Value>): Value {
		const variables = this._scope.variables();
		for (const name in variables) {
			if (!Object.prototype.hasOwnProperty.call(values, name)) {
				throw new Error(`evaluation error on undefined variable ${name}`);
			}
			const variable = variables[ name ];
			const value = values[ name ] ?? undefined;
			if (!variable.type.infer(Type.of(value))) {
				throw new TypeError(`evaluation error on unexpected type ${typeof value} for variable ${name} of type ${variable.type}`);
			}
			variable.value = value;
		}
		return this._statements.map((s)=> s.evaluate())[ this._statements.length - 1 ];
	}

	protected list(state: ParserState, scope: StaticScope): Node[] {
		const nodes: Node[] = [ this.disjunction(state, scope) ];
		while (state.isSeparator) {
			nodes.push(this.disjunction(state.next(), scope));
		}
		return nodes;
	}

	protected disjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.conjunction(state, scope);
		while (state.operator === operOr) {
			node = new ExpressionFunctionNode(state.pos, state.operator,
				[ node, this.conjunction(state.next(), scope) ]);
		}
		return node;
	}

	protected conjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.comparison(state, scope);
		while (state.operator === operAnd) {
			node = new ExpressionFunctionNode(state.pos, state.operator,
				[ node, this.comparison(state.next(), scope) ]);
		}
		return node;
	}

	protected comparison(state: ParserState, scope: StaticScope): Node {
		let not = false;
		let pos = -1;
		while (state.operator === operNot) {
			not = !not;
			pos = state.pos;
			state.next();
		}
		let node = this.aggregate(state, scope);
		while (state.operator === operGt || state.operator === operLt || state.operator === operGe || state.operator === operLe ||
			state.operator === operEqual || state.operator === operNotEqual || state.operator === operLike || state.operator === operNotLike) {
			node = new ExpressionFunctionNode(state.pos, state.operator,
				[ node, this.aggregate(state.next(), scope) ]);
		}
		if (not) {
			node = new ExpressionFunctionNode(pos, operNot, [ node ]);
		}
		return node;
	}

	protected aggregate(state: ParserState, scope: StaticScope): Node {
		let node = this.product(state, scope);
		while (state.operator === operAdd || state.operator === operSub || state.operator === operConcat || state.operator === operMerge) {
			node = new ExpressionFunctionNode(state.pos, state.operator,
				[ node, this.product(state.next(), scope) ]);
		}
		return node;
	}

	protected product(state: ParserState, scope: StaticScope): Node {
		let node = this.factor(state, scope);
		while (state.operator === operMul || state.operator === operDiv || state.operator === operPct) {
			node = new ExpressionFunctionNode(state.pos, state.operator,
				[ node, this.factor(state.next(), scope) ]);
		}
		return node;
	}

	protected factor(state: ParserState, scope: StaticScope): Node {
		let neg = false;
		let pos = -1;
		while (state.operator === operSub) {
			neg = !neg;
			pos = state.pos;
			state.next();
		}
		let node = this.coalescence(state, scope);
		while (state.operator === operPow) {
			node = new ExpressionFunctionNode(state.pos, state.operator,
				[ node, this.coalescence(state.next(), scope) ]);
		}
		if (neg) {
			node = new ExpressionFunctionNode(pos, operNeg, [ node ]);
		}
		return node;
	}

	protected coalescence(state: ParserState, scope: StaticScope): Node {
		let node = this.accessor(state, scope);
		while (state.operator === operNullco) {
			node = new ExpressionFunctionNode(state.pos, state.operator,
				[ node, this.accessor(state.next(), scope) ]);
		}
		return node;
	}

	protected accessor(state: ParserState, scope: StaticScope): Node {
		let node = this.term(state, scope);
		while (state.isBracketsOpen || state.isBracesOpen || state.operator === operAt || state.operator === operBy) {
			if (state.isBracketsOpen) {
				node = new ExpressionFunctionNode(state.pos, operAt,
					[ node, this.disjunction(state.next(), scope) ]);
				if (!state.isBracketsClose) {
					throw new Error(`missing closing brackets`);
				}
				state.next();
			}
			else if (state.isBracesOpen) {
				node = new ExpressionFunctionNode(state.pos, operBy,
					[ node, this.disjunction(state.next(), scope) ]);
				if (!state.isBracesClose) {
					throw new Error(`missing closing braces`);
				}
				state.next();
			}
			else if (state.operator === operAt) {
				const pos = state.pos;
				if (!state.next().isLiteral || !state.literal.type.isNumber) {
					throw new Error(`missing index number`);
				}
				node = new ExpressionFunctionNode(pos, operAt,
					[ node, new ExpressionConstantNode(state.pos, state.literal) ]);
				state.next();
			}
			else {
				const pos = state.pos;
				if (state.next().isToken) {
					const func = this._functions.get(state.token);
					node = func != null ?
						new ExpressionFunctionNode(pos, func, [ node,
							...this.arguments(func.minArity - 1, func.maxArity - 1, state.next(), scope) ]) :
						new ExpressionFunctionNode(pos, operBy, [ node,
							new ExpressionConstantNode(state.pos, new ExpressionConstant(state.token)) ]);
				}
				else if (state.isLiteral && state.literal.type.isString) {
					node = new ExpressionFunctionNode(pos, operBy, [ node,
						new ExpressionConstantNode(state.pos, state.literal) ]);
				}
				else {
					throw new Error(`missing method or property name`);
				}
				state.next();
			}
		}
		return node;
	}

	protected term(state: ParserState, scope: StaticScope): Node {
		if (state.isLiteral) {
			const pos = state.pos;
			const constant = state.literal;
			state.next();
			return new ExpressionConstantNode(pos, constant);
		}
		else if (state.isToken) {
			const pos = state.pos;
			const token = state.token;
			const constant = this._constants.get(token);
			if (constant != null) {
				state.next();
				return new ExpressionConstantNode(pos, constant);
			}
			const func = this._functions.get(token);
			if (func != null) {
				const subnodes = this.arguments(func.minArity, func.maxArity, state.next(), scope);
				state.next();
				return new ExpressionFunctionNode(pos, func, subnodes);
			}
			let variable = scope.get(token);
			if (variable == null) {
				variable = new ExpressionVariable();
				scope.set(token, variable);
			}
			return new ExpressionVariableNode(pos, variable, state.next().isAssignment ? this.disjunction(state.next(), scope) : undefined);
		}
		else if (state.isType) {
			const pos = state.pos;
			let type = state.type;
			if (state.next().isOption) {
				type = type.toOptional();
				state.next();
			}
			if (state.isToken) {
				const token = state.token;
				if (scope.has(token)) {
					throw new Error(`variable ${token} redefinition`);
				}
				const variable = new ExpressionVariable(undefined, type);
				scope.define(token, variable);
				return new ExpressionVariableNode(pos, variable, state.next().isAssignment ? this.disjunction(state.next(), scope) : undefined);
			}
			if (!state.isParenthesesOpen) {
				throw new Error(`missing openning parentheses`);
			}
			const variables = new Map<string, ExpressionVariable>();
			while (!state.next().isParenthesesClose) {
				if (!state.isType) {
					throw new Error(`missing argument type`);
				}
				let argType = state.type;
				if (state.next().isOption) {
					argType = argType.toOptional();
					state.next();
				}
				if (!state.isToken) {
					throw new Error(`missing argument name`);
				}
				const token = state.token;
				if (scope.get(token)) {
					throw new Error(`variable redefinition`);
				}
				variables.set(token, new ExpressionVariable(undefined, argType));
				if (!state.next().isSeparator) {
					break;
				}
			}
			if (!state.isParenthesesClose) {
				throw new Error(`missing closing parenthesis`);
			}
			if (!state.next().isScope) {
				throw new Error(`missing scope operator`);
			}
			return new ExpressionClosureNode(pos, type, Array.from(variables.values()), this.list(state.next(), scope.subscope(variables)));
		}
		else if (state.isParenthesesOpen) {
			const node = this.disjunction(state.next(), scope);
			if (!state.isParenthesesClose) {
				throw new Error(`missing closing parenthesis`);
			}
			state.next();
			return node;
		}
		else if (state.isParenthesesClose) {
			throw new Error(`unexpected closing parentheses`);
		}
		else if (state.isBracketsOpen) {
			const pos = state.pos;
			const subnodes: Node[] = [];
			while (!state.next().isBracketsClose) {
				subnodes.push(this.disjunction(state, scope));
				if (!state.isSeparator) {
					break;
				}
			}
			if (!state.isBracketsClose) {
				throw new Error(`missing closing brackets`);
			}
			state.next();
			return new ExpressionArrayNode(pos, subnodes);
		}
		else if (state.isBracketsClose) {
			throw new Error(`unexpected closing brackets`);
		}
		else if (state.isBracesOpen) {
			const pos = state.pos;
			const subnodes: { [ key: string ]: Node } = {};
			while (!state.next().isBracesClose) {
				const key = state.isToken ?
					state.token : state.isLiteral && state.literal.type.isString ? state.literal.value as string : undefined;
				if (!key) {
					throw new Error(`missing property name`);
				}
				if (!state.next().isAssignment) {
					throw new Error(`missing property assignment`);
				}
				subnodes[ key ] = this.disjunction(state.next(), scope);
				if (!state.isSeparator) {
					break;
				}
			}
			if (!state.isBracesClose) {
				throw new Error(`missing closing braces`);
			}
			state.next();
			return new ExpressionObjectNode(pos, subnodes);
		}
		else if (state.isBracesClose) {
			throw new Error(`unexpected closing braces`);
		}
		else if (state.isIf) {
			const pos = state.pos;
			const cnode = this.disjunction(state.next(), scope);
			if (!state.isThen) {
				throw new Error(`missing 'then' of conditional statement`);
			}
			const tnode = this.disjunction(state.next(), scope);
			if (!state.isElse) {
				throw new Error(`missing 'else' of conditional statement`);
			}
			const enode = this.disjunction(state.next(), scope);
			return new ExpressionFunctionNode(pos, operIfThenElse, [ cnode, tnode, enode ]);
		}
		else if (state.isFinal) {
			throw new Error(`unexpected end of expression`);
		}
		throw new Error(`unexpected expression token`);
	}

	protected arguments(minArity: number, maxArity: number, state: ParserState, scope: StaticScope): Node[] {
		if (!state.isParenthesesOpen) {
			throw new Error(`missing opening parentheses`);
		}
		const subnodes: Node[] = [];
		while (!state.next().isParenthesesClose) {
			subnodes.push(this.disjunction(state, scope));
			if (!state.isSeparator) {
				break;
			}
		}
		if (!state.isParenthesesClose) {
			throw new Error(`missing closing parentheses`);
		}
		if (subnodes.length < minArity) {
			throw new Error(`insufficient number of arguments ${subnodes.length} is less than ${minArity} that function requires`);
		}
		if (subnodes.length > maxArity) {
			throw new Error(`excessive number of arguments ${subnodes.length} is more than ${maxArity} that function requires`);
		}
		return subnodes;
	}

}
