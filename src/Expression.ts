import { FunctionDefinition } from './FunctionDefinition.js';
import { funcOr, funcAnd, funcNot, funcSum, funcMax, funcMin, funcRange, funcMerge, funcChain } from './GlobalFunctions.js';
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual, funcEqual, funcNotEqual, funcLike, funcNotLike,
	funcCoalesce, funcSwitch, funcContains, funcStartsWith, funcEndsWith,
	funcAlphanum, funcTrim, funcTrimStart, funcTrimEnd, funcLowerCase, funcUpperCase, funcJoin,
	funcUnique, funcIntersection, funcDifference } from './BaseFunctions.js';
import { funcAppend, funcLength, funcSlice, funcByte, funcChar, funcCharCode, funcEntries, funcKeys, funcValues,
	funcAt, funcFirst, funcLast, funcFirstIndex, funcLastIndex, funcEvery, funcAny, funcFlatten, funcReverse,
	funcMap, funcFilter, funcIterate, funcReduce, funcCompose } from './CompositeFunctions.js';
import { funcAdd, funcSubtract, funcNegate, funcMultiply, funcDivide, funcRemainder, funcModulo, funcPercentage, funcExponent, funcLogarithm,
	funcPower, funcRoot, funcSquare, funcSqrt, funcAbs, funcCeil, funcFloor, funcRound } from './MathFunctions.js';
import { funcToNumberBuffer, funcFromNumberBuffer, funcToStringBuffer, funcFromStringBuffer,
	funcToNumberString, funcFromNumberString, funcToBufferString, funcFromBufferString, funcFromJson, funcToJson } from './MutationFunctions.js';
import { operOr, operAnd, operNot, operGt, operLt, operGe, operLe, operEqual, operNotEqual, operLike, operNotLike, operCoalesce, operSwitch,
	operAppend, operAt, operAdd, operSub, operNeg, operMul, operDiv, operPct, operPow } from './Operators.js';
import { StaticScope } from './StaticScope.js';
import { Variable } from './Variable.js';
import { Type, Value, typeUnknown } from './Type.js';
import { ParserState } from './ParserState.js';
import { Node } from './Node.js';
import { ConstantNode } from './ConstantNode.js';
import { CallNode } from './CallNode.js';
import { VariableNode } from './VariableNode.js';
import { FunctionNode } from './FunctionNode.js';
import { ArrayNode } from './ArrayNode.js';
import { ObjectNode } from './ObjectNode.js';
import { ProgramNode } from './ProgramNode.js';

const keywords = [ 'void', 'boolean', 'bool', 'number', 'num', 'buffer', 'buf', 'string', 'str', 'array', 'arr', 'object', 'obj', 'function', 'func',
	'variant', 'var', 'if', 'then', 'else',
];
const constants: [ string, Value ][] = [
	[ 'NAN', Number.NaN ], [ 'POSINF', Number.POSITIVE_INFINITY ], [ 'NEGINF', Number.NEGATIVE_INFINITY ], [ 'EPSILON', 2.718281828459045 ], [ 'PI', 3.141592653589793 ],
];
const gfunctions: [ string, FunctionDefinition][] = [
	[ 'or', funcOr ], [ 'and', funcAnd ], [ 'not', funcNot ], [ 'sum', funcSum ], [ 'max', funcMax ], [ 'min', funcMin ],
	[ 'range', funcRange ], [ 'chain', funcChain ], [ 'merge', funcMerge ],
];
const mfunctions: [ string, FunctionDefinition][] = [
	[ 'greaterThan', funcGreaterThan ], [ 'lessThan', funcLessThan ], [ 'greaterOrEqual', funcGreaterOrEqual ], [ 'lessOrEqual', funcLessOrEqual ],
	[ 'equal', funcEqual ], [ 'unequal', funcNotEqual ], [ 'like', funcLike ], [ 'unlike', funcNotLike ], [ 'coalesce', funcCoalesce ],
	[ 'switch', funcSwitch ], [ 'contains', funcContains ], [ 'startsWith', funcStartsWith ], [ 'endsWith', funcEndsWith ], [ 'alphanum', funcAlphanum ],
	[ 'trim', funcTrim ], [ 'trimStart', funcTrimStart ], [ 'trimEnd', funcTrimEnd ],
	[ 'lowerCase', funcLowerCase ], [ 'upperCase', funcUpperCase ], [ 'join', funcJoin ],
	[ 'unique', funcUnique ], [ 'intersection', funcIntersection ], [ 'difference', funcDifference ],

	[ 'append', funcAppend ], [ 'length', funcLength ], [ 'slice', funcSlice ], [ 'byte', funcByte ], [ 'char', funcChar ], [ 'charCode', funcCharCode ],
	[ 'entries', funcEntries ], [ 'keys', funcKeys ], [ 'values', funcValues ], [ 'at', funcAt ],
	[ 'first', funcFirst ], [ 'last', funcLast ], [ 'firstIndex', funcFirstIndex ], [ 'lastIndex', funcLastIndex ],
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
	protected readonly _variables = new Map<string, Variable>();
	protected readonly _constants = new Map<string, Value>(constants);
	protected readonly _gfunctions = new Map<string, FunctionDefinition>(gfunctions);
	protected readonly _mfunctions = new Map<string, FunctionDefinition>(mfunctions);
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
			typeInference?: number,
		}>,
	}) {
		this._expression = expr;
		const type = config?.type ?? typeUnknown;
		this._strict = config?.strict ?? false;
		if (config?.variables) {
			for (const v in config.variables) {
				this._variables.set(v, new Variable(undefined, config.variables[ v ]));
			}
		}
		if (config?.constants) {
			for (const c in config.constants) {
				this._constants.set(c, config.constants[ c ]);
			}
		}
		if (config?.functions) {
			for (const f in config.constants) {
				this._gfunctions.set(f, new FunctionDefinition(
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
		this._root = this.program(state.next(), this._scope);
		if (!state.isVoid) {
			state.throwError(`unexpected expression token or expression end`);
		}
		this._root = this._root.compile(type);
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
				this._root.frame(name).throwError(`undefined variable ${name}:\n`);
			}
			const variable = variables[ name ];
			const value = values[ name ] ?? undefined;
			if (!variable.type.reduce(Type.of(value))) {
				this._root.frame(name).throwError(`unexpected type ${Type.of(value)} for variable ${name} of type ${variable.type}:\n`);
			}
			variable.value = value;
		}
		return this._root.evaluate();
	}

	protected program(state: ParserState, scope: StaticScope): Node {
		const frame = state.frame();
		const nodes: Node[] = [ this.disjunction(state, scope) ];
		while (state.isSeparator) {
			nodes.push(this.disjunction(state.next(), scope));
		}
		return new ProgramNode(frame.ends(state.end), nodes);
	}

	protected disjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.conjunction(state, scope);
		while (state.operator === operOr) {
			node = new CallNode(state, state.operator,
				[ node, this.conjunction(state.next(), scope) ]);
		}
		return node;
	}

	protected conjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.comparison(state, scope);
		while (state.operator === operAnd) {
			node = new CallNode(state, state.operator,
				[ node, this.comparison(state.next(), scope) ]);
		}
		return node;
	}

	protected comparison(state: ParserState, scope: StaticScope): Node {
		const frame = state.frame();
		let not = false;
		while (state.operator === operNot) {
			not = !not;
			frame.starts(state.start);
			state.next();
		}
		let node = this.aggregate(state, scope);
		while (state.operator === operGt || state.operator === operLt || state.operator === operGe || state.operator === operLe ||
			state.operator === operEqual || state.operator === operNotEqual || state.operator === operLike || state.operator === operNotLike) {
			node = new CallNode(state, state.operator,
				[ node, this.aggregate(state.next(), scope) ]);
		}
		if (not) {
			node = new CallNode(frame.ends(state.end), operNot, [ node ]);
		}
		return node;
	}

	protected aggregate(state: ParserState, scope: StaticScope): Node {
		let node = this.product(state, scope);
		while (state.operator === operAppend || state.operator === operAdd || state.operator === operSub) {
			node = new CallNode(state, state.operator,
				[ node, this.product(state.next(), scope) ]);
		}
		return node;
	}

	protected product(state: ParserState, scope: StaticScope): Node {
		let node = this.factor(state, scope);
		while (state.operator === operMul || state.operator === operDiv || state.operator === operPct) {
			node = new CallNode(state, state.operator,
				[ node, this.factor(state.next(), scope) ]);
		}
		return node;
	}

	protected factor(state: ParserState, scope: StaticScope): Node {
		const frame = state.frame();
		let neg = false;
		while (state.operator === operSub) {
			neg = !neg;
			frame.starts(state.start);
			state.next();
		}
		let node = this.coalescence(state, scope);
		while (state.operator === operPow) {
			node = new CallNode(state, state.operator,
				[ node, this.coalescence(state.next(), scope) ]);
		}
		if (neg) {
			node = new CallNode(frame.ends(state.end), operNeg, [ node ]);
		}
		return node;
	}

	protected coalescence(state: ParserState, scope: StaticScope): Node {
		let node = this.accessor(state, scope);
		while (state.operator === operCoalesce) {
			node = new CallNode(state, state.operator,
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
					node = this.call(state, scope, mfunction, node);
				}
				else {
					state.throwError(`unknown method ${state.token}`);
				}
			}
			else if (state.isBracketsOpen) {
				node = new CallNode(state, operAt,
					[ node, this.disjunction(state.next(), scope) ]);
				if (!state.isBracketsClose) {
					state.throwError(`missing closing brackets accessing array element`);
				}
				state.next();
			}
			else if (state.isBracesOpen) {
				node = new CallNode(state, operAt,
					[ node, this.disjunction(state.next(), scope) ]);
				if (!state.isBracesClose) {
					state.throwError(`missing closing braces accessing object property`);
				}
				state.next();
			}
			else if (state.operator === operAt) {
				const frame = state.frame();
				state.next();
				if (state.isLiteral && typeof state.literal === 'string') {
					node = new CallNode(frame.ends(state.end), operAt,
						[ node, new ConstantNode(state, state.literal) ]);
					state.next();
				}
				else if (state.isToken) {
					node = new CallNode(frame.ends(state.end), operAt,
						[ node, new ConstantNode(state, state.token) ]);
					state.next();
				}
				else {
					state.throwError(`missing array index or object key`);
				}
			}
		}
		return node;
	}

	protected term(state: ParserState, scope: StaticScope): Node {
		if (state.isLiteral) {
			const frame = state.frame();
			const constant = state.literal;
			state.next();
			return new ConstantNode(frame, constant);
		}
		else if (state.isToken) {
			const constant = this._constants.get(state.token);
			if (constant != null) {
				const frame = state.frame();
				state.next();
				return new ConstantNode(frame, constant);
			}
			const gfunction = this._gfunctions.get(state.token);
			if (gfunction != null) {
				return this.call(state, scope, gfunction);
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
			return this.func(state, scope, type);
		}
		else if (state.isParenthesesOpen) {
			const node = this.program(state.next(), scope);
			if (!state.isParenthesesClose) {
				state.throwError(`missing closing parentheses`);
			}
			state.next();
			return node;
		}
		else if (state.isParenthesesClose) {
			state.throwError(`unexpected closing parentheses`);
		}
		else if (state.isBracketsOpen) {
			const frame = state.frame();
			const subnodes: Node[] = [];
			while (!state.next().isBracketsClose) {
				subnodes.push(this.disjunction(state, scope));
				if (!state.isSeparator) {
					break;
				}
			}
			if (!state.isBracketsClose) {
				state.throwError(`missing closing brackets`);
			}
			state.next();
			return new ArrayNode(frame, subnodes);
		}
		else if (state.isBracketsClose) {
			state.throwError(`unexpected closing brackets`);
		}
		else if (state.isBracesOpen) {
			const frame = state.frame();
			const subnodes: [ Node, Node ][] = [];
			while (!state.next().isBracesClose) {
				const token = state.isToken ? state.token : undefined;
				if (token) {
					state.next();
				}
				const key = token
					? new ConstantNode(state, token)
					: this.disjunction(state, scope);
				if (!state.isColon) {
					state.throwError(`missing object property assignment`);
				}
				const value = this.disjunction(state.next(), scope);
				subnodes.push([ key, value ]);
				if (!state.isSeparator) {
					break;
				}
			}
			if (!state.isBracesClose) {
				state.throwError(`missing closing braces`);
			}
			state.next();
			return new ObjectNode(frame, subnodes);
		}
		else if (state.isBracesClose) {
			state.throwError(`unexpected closing braces`);
		}
		else if (state.isIf) {
			const frame = state.frame();
			const cnode = this.disjunction(state.next(), scope);
			if (!state.isThen) {
				state.throwError(`missing 'then' of conditional statement`);
			}
			const tnode = this.disjunction(state.next(), scope);
			if (!state.isElse) {
				state.throwError(`missing 'else' of conditional statement`);
			}
			const enode = this.disjunction(state.next(), scope);
			return new CallNode(frame.ends(state.end), operSwitch, [ cnode, tnode, enode ]);
		}
		else if (state.isVoid) {
			state.throwError(`unexpected end of expression`);
		}
		state.throwError(`unexpected expression token`);
	}

	protected call(state: ParserState, scope: StaticScope, func: FunctionDefinition, node?: Node): Node {
		const frame = state.frame();
		if (state.next().isParenthesesOpen) {
			const subnodes: Node[] = node ? [ node ] : [];
			while (!state.next().isParenthesesClose) {
				subnodes.push(this.disjunction(state, scope));
				if (!state.isSeparator) {
					break;
				}
			}
			if (!state.isParenthesesClose) {
				state.throwError(`missing closing parentheses`);
			}
			frame.ends(state.end);
			state.next();
			return new CallNode(frame, func, subnodes);
		}
		else {
			if (node != null) {
				if (func.minArity === 1) {
					return new CallNode(frame.ends(state.end), func, [ node ]);
				}
				else {
					state.throwError(`missing opening parentheses`);
				}
			}
			return new ConstantNode(frame.ends(state.end), func);
		}
	}

	protected variable(state: ParserState, scope: StaticScope, type?: Type): Node {
		let variable: Variable | undefined = undefined;
		if (type) {
			if (scope.has(state.token)) {
				state.throwError(`variable ${state.token} redefinition`);
			}
			variable = new Variable(undefined, type);
			scope.define(state.token, variable);
		}
		else {
			variable = scope.get(state.token);
			if (variable == null) {
				variable = this._variables.get(state.token);
				if (variable == null) {
					if (this._strict) {
						state.throwError(`undefined variable ${state.token} in strict mode`);
					}
					else {
						variable = new Variable();
					}
				}
				scope.set(state.token, variable);
			}
		}
		return new VariableNode(state, variable, state.next().isAssignment ? this.disjunction(state.next(), scope) : undefined);
	}

	protected func(state: ParserState, scope: StaticScope, type: Type): Node {
		const frame = state.frame();
		if (!state.isParenthesesOpen) {
			state.throwError(`missing opening parentheses for function type`);
		}
		const variables = new Map<string, Variable>();
		while (!state.next().isParenthesesClose) {
			if (!state.isType) {
				state.throwError(`missing function argument type`);
			}
			let argType = state.type;
			if (state.next().isOption) {
				argType = argType.toOptional();
				state.next();
			}
			if (!state.isToken) {
				state.throwError(`missing function argument name`);
			}
			const token = state.token;
			if (scope.get(token)) {
				state.throwError(`variable redefinition`);
			}
			variables.set(token, new Variable(undefined, argType));
			if (!state.next().isSeparator) {
				break;
			}
		}
		if (!state.isParenthesesClose) {
			state.throwError(`missing closing parentheses for function type`);
		}
		const args = Array.from(variables.values());
		const subnode = this.disjunction(state.next(), scope.subscope(variables));
		return new FunctionNode(frame.ends(state.end), new FunctionDefinition((...values: Value[])=> {
			args.forEach((arg, ix)=> arg.value = values[ ix ]);
			return subnode.evaluate();
		}, type, args.map((v)=> v.type)), subnode);
	}

}
