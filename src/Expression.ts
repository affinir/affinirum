import { FunctionDefinition } from './FunctionDefinition.js';
import { funcOr, funcAnd, funcNot, funcSum, funcMax, funcMin, funcRange, funcMerge, funcChain } from './function/GlobalFunctions.js';
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual, funcEqual, funcNotEqual, funcLike, funcUnlike,
	funcCoalesce, funcSwitch, funcContains, funcStartsWith, funcEndsWith,
	funcAlphanum, funcTrim, funcTrimStart, funcTrimEnd, funcLowerCase, funcUpperCase, funcJoin, funcSplit,
	funcUnique, funcIntersection, funcDifference } from './function/BaseFunctions.js';
import { funcAppend, funcLength, funcSlice, funcByte, funcChar, funcCharCode, funcEntries, funcKeys, funcValues,
	funcAt, funcFirst, funcLast, funcFirstIndex, funcLastIndex, funcEvery, funcAny, funcFlatten, funcReverse,
	funcTransform, funcFilter, funcReduce, funcCompose } from './function/CompositeFunctions.js';
import { funcAdd, funcSubtract, funcNegate, funcMultiply, funcDivide, funcRemainder, funcModulo, funcExponent, funcLogarithm,
	funcPower, funcRoot, funcAbs, funcCeil, funcFloor, funcRound } from './function/MathFunctions.js';
import { funcToUniversalTime, funcToLocalTime, funcFromUniversalTime, funcFromLocalTime,
	funcToUniversalTimeMonthIndex, funcToLocalTimeMonthIndex, funcToUniversalTimeWeekdayIndex, funcToLocalTimeWeekdayIndex,
	funcToTimeString, funcFromTimeString,
	funcToNumberBuffer, funcFromNumberBuffer, funcToStringBuffer, funcFromStringBuffer,
	funcToNumberString, funcFromNumberString, funcToBufferString, funcFromBufferString,
	funcFromJsonString, funcToJsonString } from './function/MutationFunctions.js';
import { StaticScope } from './StaticScope.js';
import { Variable } from './Variable.js';
import { Type, Value, typeUnknown } from './Type.js';
import { ParserFrame } from './ParserFrame.js';
import { ParserState } from './ParserState.js';
import { Node } from './Node.js';
import { ConstantNode } from './node/ConstantNode.js';
import { CallNode } from './node/CallNode.js';
import { VariableNode } from './node/VariableNode.js';
import { CycleNode } from './node/CycleNode.js';
import { ArrayNode } from './node/ArrayNode.js';
import { ObjectNode } from './node/ObjectNode.js';
import { ProgramNode } from './node/ProgramNode.js';
import { FunctionSignature } from './FunctionSignature.js';

const keywords = ['void', 'boolean', 'bool', 'number', 'num', 'buffer', 'buf', 'string', 'str', 'array', 'arr', 'object', 'obj', 'function', 'func',
	'variant', 'var', 'if', 'then', 'else',
];
const constants: [ string, Value ][] = [
	['NAN', Number.NaN], ['POSINF', Number.POSITIVE_INFINITY], ['NEGINF', Number.NEGATIVE_INFINITY], ['EPSILON', 2.718281828459045], ['PI', 3.141592653589793],
];
const gfunctions: [ string, FunctionDefinition][] = [
	['Or', funcOr], ['And', funcAnd], ['Not', funcNot], ['Sum', funcSum], ['Min', funcMin], ['Max', funcMax],
	['Range', funcRange], ['Chain', funcChain], ['Merge', funcMerge],
];
const mfunctions: [ string, FunctionDefinition][] = [
	['GreaterThan', funcGreaterThan], ['LessThan', funcLessThan], ['GreaterOrEqual', funcGreaterOrEqual], ['LessOrEqual', funcLessOrEqual],
	['Equal', funcEqual], ['Unequal', funcNotEqual], ['Like', funcLike], ['Unlike', funcUnlike], ['Coalesce', funcCoalesce],
	['Switch', funcSwitch], ['Contains', funcContains], ['StartsWith', funcStartsWith], ['EndsWith', funcEndsWith], ['Alphanum', funcAlphanum],
	['Trim', funcTrim], ['TrimStart', funcTrimStart], ['TrimEnd', funcTrimEnd],
	['LowerCase', funcLowerCase], ['UpperCase', funcUpperCase], ['Join', funcJoin], ['Split', funcSplit],
	['Unique', funcUnique], ['Intersection', funcIntersection], ['Difference', funcDifference],

	['Append', funcAppend], ['Length', funcLength], ['Slice', funcSlice], ['Byte', funcByte], ['Char', funcChar], ['CharCode', funcCharCode],
	['Entries', funcEntries], ['Keys', funcKeys], ['Values', funcValues], ['At', funcAt],
	['First', funcFirst], ['Last', funcLast], ['FirstIndex', funcFirstIndex], ['LastIndex', funcLastIndex],
	['Any', funcAny], ['Every', funcEvery], ['Flatten', funcFlatten], ['Reverse', funcReverse],
	['Transform', funcTransform], ['Filter', funcFilter], ['Reduce', funcReduce], ['Compose', funcCompose],

	['Add', funcAdd], ['Subtract', funcSubtract], ['Negate', funcNegate],
	['Multiply', funcMultiply], ['Divide', funcDivide], ['Remainder', funcRemainder], ['Modulo', funcModulo],
	['Exponent', funcExponent], ['Logarithm', funcLogarithm], ['Power', funcPower], ['Root', funcRoot], ['Abs', funcAbs],
	['Ceil', funcCeil], ['Floor', funcFloor], ['Round', funcRound],

	['ToUniversalTime', funcToUniversalTime], ['FromUniversalTime', funcFromUniversalTime],
	['ToLocalTime', funcToLocalTime], ['FromLocalTime', funcFromLocalTime],
	['ToUniversalTimeMonthIndex', funcToUniversalTimeMonthIndex], ['ToLocalTimeMonthIndex', funcToLocalTimeMonthIndex],
	['ToUniversalTimeWeekdayIndex', funcToUniversalTimeWeekdayIndex], ['ToLocalTimeWeekdayIndex', funcToLocalTimeWeekdayIndex],
	['ToTimeString', funcToTimeString], ['FromTimeString', funcFromTimeString],
	['ToNumberBuffer', funcToNumberBuffer], ['FromNumberBuffer', funcFromNumberBuffer],
	['ToStringBuffer', funcToStringBuffer], ['FromStringBuffer', funcFromStringBuffer],
	['ToNumberString', funcToNumberString], ['FromNumberString', funcFromNumberString],
	['ToBufferString', funcToBufferString], ['FromBufferString', funcFromBufferString],
	['ToJsonString', funcToJsonString], ['FromJsonString', funcFromJsonString],
];

export class Expression {

	static readonly keywords = [...keywords, ...constants.map((c)=> c[0]), ...gfunctions.map((f)=> f[0])];
	protected readonly _expression: string;
	protected readonly _strict: boolean;
	protected readonly _root: Node;
	protected readonly _variables = new Map<string, Variable>();
	protected readonly _constants = new Map<string, Value>(constants);
	protected readonly _gfunctions = new Map<string, FunctionDefinition>(gfunctions);
	protected readonly _mfunctions = new Map<string, FunctionDefinition>(mfunctions);
	protected readonly _scope = new StaticScope();
	protected readonly _dump: boolean;

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
		dump?: boolean,
	}) {
		this._expression = expr;
		const type = config?.type ?? typeUnknown;
		this._strict = config?.strict ?? false;
		if (config?.variables) {
			for (const v in config.variables) {
				this._variables.set(v, new Variable(config.variables[v]));
			}
		}
		if (config?.constants) {
			for (const c in config.constants) {
				this._constants.set(c, config.constants[c]);
			}
		}
		if (config?.functions) {
			for (const f in config.constants) {
				this._gfunctions.set(f, new FunctionDefinition(
					config.functions[f].func,
					config.functions[f].type,
					config.functions[f].argTypes,
					config.functions[f].minArity,
					config.functions[f].maxArity,
					config.functions[f].typeInference,
				));
			}
		}
		this._dump = config?.dump ?? false;
		const state = new ParserState(this._expression);
		this._root = this.program(state.next(), this._scope);
		if (!state.isVoid) {
			state.throwError('unexpected expression token or expression end');
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
			types[name] = variables[name].type;
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
			const variable = variables[name];
			const value = values[name] ?? undefined;
			if (!variable.type.reduce(Type.of(value))) {
				this._root.frame(name).throwError(`unexpected type ${Type.of(value)} for variable ${name} of type ${variable.type}:\n`);
			}
			variable.value = value;
		}
		return this._root.evaluate();
	}

	protected program(state: ParserState, scope: StaticScope): Node {
		const frame = state.frame();
		const nodes: Node[] = [this.unit(state, scope)];
		while (state.isSeparator) {
			nodes.push(this.unit(state.next(), scope));
		}
		return new ProgramNode(frame.ends(state.end), nodes);
	}

	protected unit(state: ParserState, scope: StaticScope): Node {
		return this.cycle(state, scope);
	}

	protected cycle(state: ParserState, scope: StaticScope): Node {
		let node = this.switch(state, scope);
		while (state.isCycle) {
			node = new CycleNode(state.frame(), node, this.switch(state.next(), scope));
		}
		return node;
	}

	protected switch(state: ParserState, scope: StaticScope): Node {
		const frame = state.frame();
		let node = this.disjunction(state, scope);
		if (state.operator === funcSwitch) {
			const subnode = this.unit(state.next(), scope);
			if (!state.isColon) {
				state.throwError('missing switch else condition clause');
			}
			node = this.call(frame.ends(state.end), funcSwitch, [node, subnode, this.unit(state.next(), scope)]);
		}
		return node;
	}

	protected disjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.conjunction(state, scope);
		while (state.operator === funcOr) {
			node = this.call(state.frame(), state.operator, [node, this.conjunction(state.next(), scope)]);
		}
		return node;
	}

	protected conjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.comparison(state, scope);
		while (state.operator === funcAnd) {
			node = this.call(state.frame(), state.operator, [node, this.comparison(state.next(), scope)]);
		}
		return node;
	}

	protected comparison(state: ParserState, scope: StaticScope): Node {
		const frame = state.frame();
		let not = false;
		while (state.operator === funcNot) {
			not = !not;
			frame.starts(state.start);
			state.next();
		}
		let node = this.aggregate(state, scope);
		while (state.operator === funcGreaterThan || state.operator === funcLessThan
			|| state.operator === funcGreaterOrEqual || state.operator === funcLessOrEqual
			|| state.operator === funcEqual || state.operator === funcNotEqual) {
			node = this.call(state.frame(), state.operator, [node, this.aggregate(state.next(), scope)]);
		}
		if (not) {
			node = this.call(frame.ends(state.end), funcNot, [node]);
		}
		return node;
	}

	protected aggregate(state: ParserState, scope: StaticScope): Node {
		let node = this.product(state, scope);
		while (state.operator === funcAppend || state.operator === funcAdd || state.operator === funcSubtract) {
			node = this.call(state.frame(), state.operator,
				[node, this.product(state.next(), scope)]);
		}
		return node;
	}

	protected product(state: ParserState, scope: StaticScope): Node {
		let node = this.factor(state, scope);
		while (state.operator === funcMultiply || state.operator === funcDivide || state.operator === funcRemainder) {
			node = this.call(state.frame(), state.operator, [node, this.factor(state.next(), scope)]);
		}
		return node;
	}

	protected factor(state: ParserState, scope: StaticScope): Node {
		const frame = state.frame();
		let neg = false;
		while (state.operator === funcSubtract) {
			neg = !neg;
			frame.starts(state.start);
			state.next();
		}
		let node = this.coalescence(state, scope);
		while (state.operator === funcPower) {
			node = this.call(state.frame(), state.operator, [node, this.coalescence(state.next(), scope)]);
		}
		if (neg) {
			node = this.call(frame.ends(state.end), funcNegate, [node]);
		}
		return node;
	}

	protected coalescence(state: ParserState, scope: StaticScope): Node {
		let node = this.accessor(state, scope);
		while (state.operator === funcCoalesce) {
			node = this.call(state.frame(), state.operator, [node, this.accessor(state.next(), scope)]);
		}
		return node;
	}

	protected accessor(state: ParserState, scope: StaticScope): Node {
		let node = this.term(state, scope);
		while (state.operator === funcAt || state.isParenthesesOpen || state.isBracketsOpen) {
			const frame = state.frame();
			if (state.operator === funcAt) {
				state.next();
				if (state.isLiteral && (typeof state.literal === 'string' || typeof state.literal === 'number')) {
					node = this.call(frame.ends(state.end), funcAt, [node, new ConstantNode(state, state.literal)]);
					state.next();
				}
				else if (state.isToken) {
					frame.ends(state.end);
					const mfunction = this._mfunctions.get(state.token) ?? this._gfunctions.get(state.token);
					if (mfunction) {
						if (state.next().isParenthesesOpen) {
							const subnodes: Node[] = [node];
							while (!state.next().isParenthesesClose) {
								subnodes.push(this.unit(state, scope));
								if (!state.isSeparator) {
									break;
								}
							}
							if (!state.isParenthesesClose) {
								state.throwError('missing closing method function parentheses');
							}
							frame.ends(state.end);
							node = this.call(frame, mfunction, subnodes);
							state.next();
						}
						else {
							node = this.call(frame, mfunction, [node]);
						}
					}
					else {
						node = this.call(frame, funcAt, [node, new ConstantNode(state, state.token)]);
						state.next();
					}
				}
				else {
					state.throwError('missing array or object index');
				}
			}
			else if (state.isParenthesesOpen) {
				const subnodes: Node[] = [];
				while (!state.next().isParenthesesClose) {
					subnodes.push(this.unit(state, scope));
					if (!state.isSeparator) {
						break;
					}
				}
				if (!state.isParenthesesClose) {
					state.throwError('missing closing function parentheses');
				}
				node = new CallNode(frame.ends(state.end), node, subnodes);
				state.next();
			}
			else if (state.isBracketsOpen) {
				node = this.call(frame, funcAt, [node, this.unit(state.next(), scope)]);
				if (!state.isBracketsClose) {
					state.throwError('missing closing index brackets');
				}
				state.next();
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
				const frame = state.frame();
				state.next();
				return new ConstantNode(frame, gfunction.evaluate, gfunction.signature);
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
			return this.subroutine(state, scope, type);
		}
		else if (state.isScope) {
			return this.subroutine(state, scope);
		}
		else if (state.isBracesOpen) {
			const node = this.program(state.next(), scope);
			if (!state.isBracesClose) {
				state.throwError('missing closing braces');
			}
			state.next();
			return node;
		}
		else if (state.isBracesClose) {
			state.throwError('unexpected closing braces');
		}
		else if (state.isParenthesesOpen) {
			const node = this.unit(state.next(), scope);
			if (!state.isParenthesesClose) {
				state.throwError('missing closing parentheses');
			}
			state.next();
			return node;
		}
		else if (state.isParenthesesClose) {
			state.throwError('unexpected closing parentheses');
		}
		else if (state.isBracketsOpen) {
			const frame = state.frame();
			const checkEmptyState = state.clone();
			if (checkEmptyState.next().isBracketsClose) {
				return new ConstantNode(frame.ends(state.next().next().end), []);
			}
			else if (checkEmptyState.isColon && checkEmptyState.next().isBracketsClose) {
				return new ConstantNode(frame.ends(state.next().next().next().end), {});
			}
			const subnodes: [ Node | number, Node ][] = [];
			let index = 0;
			while (!state.next().isBracketsClose) {
				const node = this.unit(state, scope);
				if (state.isColon) {
					subnodes.push([node, this.unit(state.next(), scope)]);
				}
				else {
					subnodes.push([index++, node]);
				}
				if (!state.isSeparator) {
					break;
				}
			}
			if (!state.isBracketsClose) {
				state.throwError('missing closing brackets');
			}
			frame.ends(state.end);
			state.next();
			if (subnodes.every(([k,])=> typeof k === 'number')) {
				return new ArrayNode(frame, subnodes.map(([, v])=> v));
			}
			return new ObjectNode(frame, subnodes.map(([k, v])=> [typeof k === 'number' ? new ConstantNode(v, String(k)) : k, v] as const));
		}
		else if (state.isBracketsClose) {
			state.throwError('unexpected closing brackets');
		}
		else if (state.isVoid) {
			state.throwError('unexpected end of expression');
		}
		state.throwError('unexpected expression token');
	}

	protected variable(state: ParserState, scope: StaticScope, type?: Type): Node {
		let variable: Variable | undefined = undefined;
		if (type) {
			if (scope.has(state.token)) {
				state.throwError(`variable ${state.token} redefinition`);
			}
			variable = new Variable(type);
			scope.local(state.token, variable);
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
		const frame = state.frame();
		return new VariableNode(frame.ends(state.end), variable, state.next().isAssignment
			?	this.unit(state.next(), scope)
			: undefined);
	}

	protected subroutine(state: ParserState, scope: StaticScope, type?: Type): Node {
		const frame = state.frame();
		const variables = new Map<string, Variable>();
		if (type) {
			if (!state.isParenthesesOpen) {
				state.throwError('missing opening function type parentheses');
			}
			while (!state.next().isParenthesesClose) {
				if (!state.isType) {
					state.throwError('missing function argument type');
				}
				let argType = state.type;
				if (state.next().isOption) {
					argType = argType.toOptional();
					state.next();
				}
				if (!state.isToken) {
					state.throwError('missing function argument name');
				}
				const token = state.token;
				if (scope.get(token)) {
					state.throwError('variable redefinition');
				}
				variables.set(token, new Variable(argType));
				if (!state.next().isSeparator) {
					break;
				}
			}
			if (!state.isParenthesesClose) {
				state.throwError('missing closing function type parentheses');
			}
			if (!state.next().isScope) {
				state.throwError('missing function scope');
			}
		}
		const args = Array.from(variables.values());
		const subnode = this.unit(state.next(), scope.subscope(variables));
		const value = (...values: Value[])=> {
			args.forEach((arg, ix)=> arg.value = values[ix]);
			return subnode.evaluate();
		};
		return new ConstantNode(frame.ends(state.end), value, type
			? new FunctionSignature(type, args.map((v)=> v.type))
			: FunctionSignature.unknown, subnode);
	}

	protected call(frame: ParserFrame, func: FunctionDefinition, subnodes: Node[]): Node {
		return new CallNode(frame, new ConstantNode(frame, func.evaluate, func.signature), subnodes);
	}

}
