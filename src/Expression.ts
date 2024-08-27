import { ExpressionConstant, constNull, constTrue, constFalse,
	constNAN, constPOSINF, constNEGINF, constEPSILON, constPI } from './ExpressionConstant.js';
import { ExpressionFunction } from './ExpressionFunction.js';
import { funcOr, funcAnd, funcNot, funcSum, funcMax, funcMin, funcRange, funcMerge, funcChain } from './ExpressionFunctionGlobal.js';
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual, funcEqual, funcNotEqual, funcLike, funcNotLike,
	funcCoalesce, funcSwitch, funcContains, funcStartsWith, funcEndsWith,
	funcAlphanum, funcTrim, funcTrimStart, funcTrimEnd, funcLowerCase, funcUpperCase, funcJoin,
	funcUnique, funcIntersection, funcDifference } from './ExpressionFunctionBase.js';
import { funcAppend, funcLength, funcSlice, funcByte, funcChar, funcCharCode, funcEntries, funcKeys, funcValues,
	funcAt, funcFirstValid, funcFirst, funcLast, funcFirstIndex, funcLastIndex, funcEvery, funcAny, funcFlatten, funcReverse,
	funcMap, funcFilter, funcIterate, funcReduce, funcCompose } from './ExpressionFunctionComposite.js';
import { funcAdd, funcSubtract, funcNegate, funcMultiply, funcDivide, funcRemainder, funcModulo, funcPercentage, funcExponent, funcLogarithm,
	funcPower, funcRoot, funcSquare, funcSqrt, funcAbs, funcCeil, funcFloor, funcRound } from './ExpressionFunctionMath.js';
import { funcToNumberBuffer, funcFromNumberBuffer, funcToStringBuffer, funcFromStringBuffer,
	funcToNumberString, funcFromNumberString, funcToBufferString, funcFromBufferString, funcFromJson, funcToJson } from './ExpressionFunctionMutation.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEqual, operNotEqual, operLike, operNotLike, operCoalesce, operSwitch,
	operAppend, operAt, operFv, operAdd, operSub, operNeg, operMul, operDiv, operPct, operPow } from './ExpressionOperator.js';
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
import { ExpressionProgramNode } from './ExpressionProgramNode.js';

const keywords = [ 'void', 'boolean', 'bool', 'number', 'num', 'buffer', 'buf', 'string', 'str', 'array', 'arr', 'object', 'obj', 'function', 'func',
	'variant', 'var', 'if', 'then', 'else',
];
const constants: [ string, ExpressionConstant ][] = [
	[ 'null', constNull ], [ 'true', constTrue ], [ 'false', constFalse ],
	[ 'NAN', constNAN ], [ 'POSINF', constPOSINF ], [ 'NEGINF', constNEGINF ], [ 'EPSILON', constEPSILON ], [ 'PI', constPI ],
];
const gfunctions: [ string, ExpressionFunction][] = [
	[ 'or', funcOr ], [ 'and', funcAnd ], [ 'not', funcNot ], [ 'sum', funcSum ], [ 'max', funcMax ], [ 'min', funcMin ],
	[ 'range', funcRange ], [ 'chain', funcChain ], [ 'merge', funcMerge ],
];
const mfunctions: [ string, ExpressionFunction][] = [
	[ 'greaterThan', funcGreaterThan ], [ 'lessThan', funcLessThan ], [ 'greaterOrEqual', funcGreaterOrEqual ], [ 'lessOrEqual', funcLessOrEqual ],
	[ 'equal', funcEqual ], [ 'unequal', funcNotEqual ], [ 'like', funcLike ], [ 'unlike', funcNotLike ], [ 'coalesce', funcCoalesce ],
	[ 'switch', funcSwitch ], [ 'contains', funcContains ], [ 'startsWith', funcStartsWith ], [ 'endsWith', funcEndsWith ], [ 'alphanum', funcAlphanum ],
	[ 'trim', funcTrim ], [ 'trimStart', funcTrimStart ], [ 'trimEnd', funcTrimEnd ],
	[ 'lowerCase', funcLowerCase ], [ 'upperCase', funcUpperCase ], [ 'join', funcJoin ],
	[ 'unique', funcUnique ], [ 'intersection', funcIntersection ], [ 'difference', funcDifference ],

	[ 'append', funcAppend ], [ 'length', funcLength ], [ 'slice', funcSlice ], [ 'byte', funcByte ], [ 'char', funcChar ], [ 'charCode', funcCharCode ],
	[ 'entries', funcEntries ], [ 'keys', funcKeys ], [ 'values', funcValues ], [ 'at', funcAt ],
	[ 'firstValid', funcFirstValid ], [ 'first', funcFirst ], [ 'last', funcLast ], [ 'firstIndex', funcFirstIndex ], [ 'lastIndex', funcLastIndex ],
	[ 'any', funcAny ], [ 'every', funcEvery ], [ 'flatten', funcFlatten ], [ 'reverse', funcReverse ],
	[ 'map', funcMap ], [ 'filter', funcFilter ], [ 'iterate', funcIterate ], [ 'reduce', funcReduce ], [ 'compose', funcCompose ],

	[ 'add', funcAdd ], [ 'subtract', funcSubtract ], [ 'negate', funcNegate ],
	[ 'multiply', funcMultiply ], [ 'divide', funcDivide ], [ 'remainder', funcRemainder ], [ 'modulo', funcModulo ], [ 'percentage', funcPercentage ],
	[ 'exponent', funcExponent ], [ 'logarithm', funcLogarithm ], [ 'power', funcPower ], [ 'root', funcRoot ], [ 'square', funcSquare ], [ 'sqrt', funcSqrt ],
	[ 'abs', funcAbs ], [ 'ceil', funcCeil ], [ 'floor', funcFloor ], [ 'round', funcRound ],

	[ 'toNumberBuffer', funcToNumberBuffer ], [ 'fromNumberBuffer', funcFromNumberBuffer ], [ 'toStringBuffer', funcToStringBuffer ], [ 'fromStringBuffer', funcFromStringBuffer ],
	[ 'toNumberString', funcToNumberString ], [ 'fromNumberString', funcFromNumberString ], [ 'toBufferString', funcToBufferString ], [ 'fromBufferString', funcFromBufferString ],
	[ 'toJson', funcToJson ], [ 'fromJson', funcFromJson ],
];

export class Expression {

	static readonly keywords = [ ...keywords, ...constants.map((c)=> c[ 0 ]), ...gfunctions.map((f)=> f[ 0 ]) ];
	protected readonly _expression: string;
	protected readonly _strict: boolean;
	protected readonly _root: Node;
	protected readonly _variables = new Map<string, ExpressionVariable>();
	protected readonly _constants = new Map<string, ExpressionConstant>(constants);
	protected readonly _gfunctions = new Map<string, ExpressionFunction>(gfunctions);
	protected readonly _mfunctions = new Map<string, ExpressionFunction>(mfunctions);
	protected readonly _scope = new StaticScope();

	/**
		Creates compiled expression. Any parsed token not recognized as a constant or a function will be compiled as a variable.
		@param expr Math expression to compile.
		@param config Optional expected type, strict mode, variable types, constant values and functions to add for the compilation.
			If expected type is provided then expression return type is matched against it.
			If strict mode is set then undeclared variables will not be allowed in expression.
	*/
	constructor(expr: string, config?: {
		type?: Type,
		strict?: boolean,
		variables?: Record<string, Type>,
		constants?: Record<string, Value>,
		functions?: Record<string, {
			func: (...values: any[])=> Value,
			type: Type,
			argTypes: Type[],
			minArity?: number,
			maxArity?: number,
			typeInference?: (index: number, type: string, mask: string)=> boolean
		}>,
	}) {
		this._expression = expr;
		const type = config?.type ?? typeVariant;
		this._strict = config?.strict ?? false;
		if (config?.variables) {
			for (const v in config.variables) {
				this._variables.set(v, new ExpressionVariable(undefined, config.variables[ v ]));
			}
		}
		if (config?.constants) {
			for (const c in config.constants) {
				this._constants.set(c, new ExpressionConstant(config.constants[ c ]));
			}
		}
		if (config?.functions) {
			for (const f in config.constants) {
				this._gfunctions.set(f, new ExpressionFunction(
					config.functions[ f ].func,
					config.functions[ f ].type,
					config.functions[ f ].argTypes,
					config.functions[ f ].minArity,
					config.functions[ f ].maxArity,
					config.functions[ f ].typeInference)
				);
			}
		}
		const state = new ParserState(this._expression);
		try {
			this._root = this.program(state.next(), this._scope);
			if (!state.isVoid) {
				throw new Error(`unexpected expression token or expression end`);
			}
		}
		catch (err) {
			throw new Error(`parse error on ${(err as Error).message} at position ${state.startPos}:\n` +
				this.point(state.startPos, state.endPos));
		}
		try {
			this._root = this._root.compile(type);
		}
		catch (err) {
			console.log(this.toString());
			const te = err as NodeTypeError;
			throw new TypeError(`${te.message} on ${te.nodeType} not matching ${te.mismatchType} at position ${te.startPos}:\n` +
				this.point(te.startPos, te.endPos));
		}
	}

	/**
		Returns compiled expression return value type.
	*/
	get type(): Type {
		return this._root.type;
	}

	/**
		Returns string representing parsed node tree structure.
		@returns Parsed expression string.
	*/
	toString() {
		return this._root.toString();
	}

	/**
		Returns record with compiled variable names and expected types.
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
				throw new Error(`evaluation error on undefined variable ${name}:\n` +
					this.point(this._expression.indexOf(name), this._expression.indexOf(name) + name.length));
			}
			const variable = variables[ name ];
			const value = values[ name ] ?? undefined;
			if (!variable.type.infer(Type.of(value))) {
				throw new TypeError(`evaluation error on unexpected type ${typeof value} for variable ${name} of type ${variable.type}:\n` +
					this.point(this._expression.indexOf(name), this._expression.indexOf(name) + name.length));
			}
			variable.value = value;
		}
		return this._root.evaluate();
	}

	protected point(start: number, end: number): string {
		const offset = start < 32 ? 0 : start - 32;
		const length = end < start ? 0 : end - start - 1;
		return `${this._expression.substring(offset, offset + 60)}\n` +
		`${' '.repeat(this._expression.substring(offset, start).length)}^${'\''.repeat(length)}`;
	}

	protected program(state: ParserState, scope: StaticScope): Node {
		const start = state.startPos;
		const nodes: Node[] = [ this.disjunction(state, scope) ];
		while (state.isSeparator) {
			nodes.push(this.disjunction(state.next(), scope));
		}
		return new ExpressionProgramNode(start, state.endPos, nodes);
	}

	protected disjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.conjunction(state, scope);
		while (state.operator === operOr) {
			node = new ExpressionFunctionNode(state.startPos, state.endPos, state.operator,
				[ node, this.conjunction(state.next(), scope) ]);
		}
		return node;
	}

	protected conjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.comparison(state, scope);
		while (state.operator === operAnd) {
			node = new ExpressionFunctionNode(state.startPos, state.endPos, state.operator,
				[ node, this.comparison(state.next(), scope) ]);
		}
		return node;
	}

	protected comparison(state: ParserState, scope: StaticScope): Node {
		let not = false;
		let start = -1;
		while (state.operator === operNot) {
			not = !not;
			start = state.startPos;
			state.next();
		}
		let node = this.aggregate(state, scope);
		while (state.operator === operGt || state.operator === operLt || state.operator === operGe || state.operator === operLe ||
			state.operator === operEqual || state.operator === operNotEqual || state.operator === operLike || state.operator === operNotLike) {
			node = new ExpressionFunctionNode(state.startPos, state.endPos, state.operator,
				[ node, this.aggregate(state.next(), scope) ]);
		}
		if (not) {
			node = new ExpressionFunctionNode(start, state.endPos, operNot, [ node ]);
		}
		return node;
	}

	protected aggregate(state: ParserState, scope: StaticScope): Node {
		let node = this.product(state, scope);
		while (state.operator === operAppend || state.operator === operAdd || state.operator === operSub) {
			node = new ExpressionFunctionNode(state.startPos, state.endPos, state.operator,
				[ node, this.product(state.next(), scope) ]);
		}
		return node;
	}

	protected product(state: ParserState, scope: StaticScope): Node {
		let node = this.factor(state, scope);
		while (state.operator === operMul || state.operator === operDiv || state.operator === operPct) {
			node = new ExpressionFunctionNode(state.startPos, state.endPos, state.operator,
				[ node, this.factor(state.next(), scope) ]);
		}
		return node;
	}

	protected factor(state: ParserState, scope: StaticScope): Node {
		let neg = false;
		let start = -1;
		while (state.operator === operSub) {
			neg = !neg;
			start = state.startPos;
			state.next();
		}
		let node = this.coalescence(state, scope);
		while (state.operator === operPow) {
			node = new ExpressionFunctionNode(state.startPos, state.endPos, state.operator,
				[ node, this.coalescence(state.next(), scope) ]);
		}
		if (neg) {
			node = new ExpressionFunctionNode(start, state.endPos, operNeg, [ node ]);
		}
		return node;
	}

	protected coalescence(state: ParserState, scope: StaticScope): Node {
		let node = this.accessor(state, scope);
		while (state.operator === operCoalesce) {
			node = new ExpressionFunctionNode(state.startPos, state.endPos, state.operator,
				[ node, this.accessor(state.next(), scope) ]);
		}
		return node;
	}

	protected accessor(state: ParserState, scope: StaticScope): Node {
		let node = this.term(state, scope);
		while (state.isMethod || state.isBracketsOpen || state.isBracesOpen || state.operator === operAt) {
			if (state.isMethod) {
				state.next();
				const mfunction = this._mfunctions.get(state.token) ?? this._gfunctions.get(state.token);
				if (mfunction) {
					node = this.function(state, scope, mfunction, node);
				}
				else {
					throw new Error(`unknown method ${state.token}`);
				}
			}
			else if (state.isBracketsOpen) {
				if (state.next().operator === operMul) {
					node = new ExpressionFunctionNode(state.startPos, state.endPos, operFv,
						[ node ]);
					state.next();
				}
				else {
					node = new ExpressionFunctionNode(state.startPos, state.endPos, operAt,
						[ node, this.disjunction(state, scope) ]);
				}
				if (!state.isBracketsClose) {
					throw new Error(`missing closing brackets accessing array element`);
				}
				state.next();
			}
			else if (state.isBracesOpen) {
				if (state.next().operator === operMul) {
					node = new ExpressionFunctionNode(state.startPos, state.endPos, operFv,
						[ node ]);
					state.next();
				}
				else {
					node = new ExpressionFunctionNode(state.startPos, state.endPos, operAt,
						[ node, this.disjunction(state, scope) ]);
				}
				if (!state.isBracesClose) {
					throw new Error(`missing closing braces accessing object property`);
				}
				state.next();
			}
			else if (state.operator === operAt) {
				const start = state.startPos;
				state.next();
				if (state.isLiteral && state.literal.type.isString) {
					node = new ExpressionFunctionNode(start, state.endPos, operAt,
						[ node, new ExpressionConstantNode(state.startPos, state.endPos, state.literal) ]);
					state.next();
				}
				else if (state.isToken) {
					node = new ExpressionFunctionNode(start, state.endPos, operAt,
						[ node, new ExpressionConstantNode(state.startPos, state.endPos, new ExpressionConstant(state.token)) ]);
					state.next();
				}
				else {
					throw new Error(`missing array index or object key`);
				}
			}
		}
		return node;
	}

	protected term(state: ParserState, scope: StaticScope): Node {
		if (state.isLiteral) {
			const start = state.startPos;
			const end = state.endPos;
			const constant = state.literal;
			state.next();
			return new ExpressionConstantNode(start, end, constant);
		}
		else if (state.isToken) {
			const constant = this._constants.get(state.token);
			if (constant != null) {
				const start = state.startPos;
				const end = state.endPos;
				state.next();
				return new ExpressionConstantNode(start, end, constant);
			}
			const gfunction = this._gfunctions.get(state.token);
			if (gfunction != null) {
				return this.function(state, scope, gfunction);
			}
			return this.variable(state, scope);
		}
		else if (state.isType) {
			let type = state.type;
			if (state.next().isOption) {
				type = type.toOptional();
				state.next();
			}
			if (state.isToken) {
				return this.variable(state, scope, type);
			}
			return this.closure(state, scope, type);
		}
		else if (state.isParenthesesOpen) {
			const node = this.program(state.next(), scope);
			if (!state.isParenthesesClose) {
				throw new Error(`missing closing parentheses`);
			}
			state.next();
			return node;
		}
		else if (state.isParenthesesClose) {
			throw new Error(`unexpected closing parentheses`);
		}
		else if (state.isBracketsOpen) {
			const start = state.startPos;
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
			const end = state.endPos;
			state.next();
			return new ExpressionArrayNode(start, end, subnodes);
		}
		else if (state.isBracketsClose) {
			throw new Error(`unexpected closing brackets`);
		}
		else if (state.isBracesOpen) {
			const start = state.startPos;
			const subnodes: [ Node, Node ][] = [];
			while (!state.next().isBracesClose) {
				const token = state.isToken ? state.token : undefined;
				if (token) {
					state.next();
				}
				const key = token
					? new ExpressionConstantNode(state.startPos, state.endPos, new ExpressionConstant(token))
					: this.disjunction(state, scope);
				if (!state.isColon) {
					throw new Error(`missing object property assignment`);
				}
				const value = this.disjunction(state.next(), scope);
				subnodes.push([ key, value ]);
				if (!state.isSeparator) {
					break;
				}
			}
			if (!state.isBracesClose) {
				throw new Error(`missing closing braces`);
			}
			const end = state.endPos;
			state.next();
			return new ExpressionObjectNode(start, end, subnodes);
		}
		else if (state.isBracesClose) {
			throw new Error(`unexpected closing braces`);
		}
		else if (state.isIf) {
			const start = state.startPos;
			const cnode = this.disjunction(state.next(), scope);
			if (!state.isThen) {
				throw new Error(`missing 'then' of conditional statement`);
			}
			const tnode = this.disjunction(state.next(), scope);
			if (!state.isElse) {
				throw new Error(`missing 'else' of conditional statement`);
			}
			const enode = this.disjunction(state.next(), scope);
			return new ExpressionFunctionNode(start, state.endPos, operSwitch, [ cnode, tnode, enode ]);
		}
		else if (state.isVoid) {
			throw new Error(`unexpected end of expression`);
		}
		throw new Error(`unexpected expression token`);
	}

	protected function(state: ParserState, scope: StaticScope, func: ExpressionFunction, node?: Node): Node {
		const start = state.startPos;
		if (state.next().isParenthesesOpen) {
			const subnodes: Node[] = node ? [ node ] : [];
			while (!state.next().isParenthesesClose) {
				subnodes.push(this.disjunction(state, scope));
				if (!state.isSeparator) {
					break;
				}
			}
			if (!state.isParenthesesClose) {
				throw new Error(`missing closing parentheses`);
			}
			if (subnodes.length < func.minArity) {
				throw new Error(`insufficient number of arguments ${subnodes.length} is less than ${func.minArity} that function requires`);
			}
			if (subnodes.length > func.maxArity) {
				throw new Error(`excessive number of arguments ${subnodes.length} is more than ${func.maxArity} that function requires`);
			}
			const end = state.endPos;
			state.next();
			return new ExpressionFunctionNode(start, end, func, subnodes);
		}
		else {
			if (node != null) {
				if (func.minArity === 1) {
					return new ExpressionFunctionNode(start, state.endPos, func, [ node ]);
				}
				else {
					throw new Error(`missing opening parentheses`);
				}
			}
			return new ExpressionConstantNode(start, state.endPos, new ExpressionConstant(func.evaluate));
		}
	}

	protected variable(state: ParserState, scope: StaticScope, type?: Type): Node {
		let variable: ExpressionVariable | undefined = undefined;
		if (type) {
			if (scope.has(state.token)) {
				throw new Error(`variable ${state.token} redefinition`);
			}
			variable = new ExpressionVariable(undefined, type);
			scope.define(state.token, variable);
		}
		else {
			variable = scope.get(state.token);
			if (variable == null) {
				variable = this._variables.get(state.token);
				if (variable == null) {
					if (this._strict) {
						throw new Error(`undefined variable ${state.token} in strict mode`);
					}
					else {
						variable = new ExpressionVariable();
					}
				}
				scope.set(state.token, variable);
			}
		}
		const start = state.startPos;
		const end = state.endPos;
		return new ExpressionVariableNode(start, end, variable, state.next().isAssignment ? this.disjunction(state.next(), scope) : undefined);
	}

	protected closure(state: ParserState, scope: StaticScope, type: Type): Node {
		const start = state.startPos;
		if (!state.isParenthesesOpen) {
			throw new Error(`missing opening parentheses for function type`);
		}
		const variables = new Map<string, ExpressionVariable>();
		while (!state.next().isParenthesesClose) {
			if (!state.isType) {
				throw new Error(`missing function argument type`);
			}
			let argType = state.type;
			if (state.next().isOption) {
				argType = argType.toOptional();
				state.next();
			}
			if (!state.isToken) {
				throw new Error(`missing function argument name`);
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
			throw new Error(`missing closing parentheses for function type`);
		}
		const subnode = this.disjunction(state.next(), scope.subscope(variables));
		return new ExpressionClosureNode(start, state.endPos, type, Array.from(variables.values()), subnode);
	}

}
