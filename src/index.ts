export * from './Value.js';
export * from './Type.js';
export * from './subtype/FunctionSubype.js';
import { constArray, funcFirst, funcLast, funcFirstIndex, funcLastIndex, funcEvery, funcAny,
	funcFlatten, funcReverse, funcTransform, funcFilter, funcReduce, funcCompose } from './constant/Array.js';
import { constBoolean, funcOr, funcAnd, funcNot } from './constant/Boolean.js';
import { constBuffer, funcByte } from './constant/Buffer.js';
import { funcSlice } from './constant/Enumerable.js';
import { constInteger } from './constant/Integer.js';
import { funcLength, funcAt } from './constant/Iterable.js';
import { constNumber } from './constant/Number.js';
import { constObject, funcEntries, funcKeys, funcValues } from './constant/Object.js';
import { constString, funcLike, funcUnlike, funcContains, funcStartsWith, funcEndsWith,
	funcChar, funcCharCode, funcAlphanum, funcTrim, funcTrimStart, funcTrimEnd, funcLowerCase, funcUpperCase,
	funcJoin, funcSplit } from './constant/String.js';
import { constTimestamp, funcYear, funcMonth, funcMonthIndex, funcWeekdayIndex, funcDay,
	funcHour, funcMinute, funcSecond, funcMillisecond, funcEpochTime } from './constant/Timestamp.js';
import { funcCoalesce, funcEqual, funcNotEqual, funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual,
	funcAdd, funcSubtract, funcMultiply, funcDivide, funcRemainder, funcModulo,
	funcPower, funcRoot, funcNegate } from './constant/Unknown.js';
import { constAVN } from './constant/notation/AVN.js';
import { constJSON } from './constant/notation/JSON.js';
import { StaticScope } from './StaticScope.js';
import { Constant } from './Constant.js';
import { Variable } from './Variable.js';
import { Value } from './Value.js';
import { Type } from './Type.js';
import { ParserFrame } from './ParserFrame.js';
import { ParserState } from './ParserState.js';
import { Node } from './Node.js';
import { ConstantNode } from './node/ConstantNode.js';
import { InvocationNode } from './node/InvocationNode.js';
import { VariableNode } from './node/VariableNode.js';
import { LoopNode } from './node/LoopNode.js';
import { SwitchNode } from './node/SwitchNode.js';
import { ArrayNode } from './node/ArrayNode.js';
import { ObjectNode } from './node/ObjectNode.js';
import { BlockNode } from './node/BlockNode.js';

const keywords = [
	'void', 'boolean', 'bool', 'number', 'num', 'timestamp', 'time', 'integer', 'int', 'buffer', 'buf', 'string', 'str',
	'array', 'arr', 'object', 'obj', 'function', 'func', 'unknown', 'var', 'const', 'if', 'while', 'for',
];
const constants: [string, Constant][] = [
	['Array', constArray], ['Boolean', constBoolean], ['Buffer', constBuffer], ['Integer', constInteger], ['Number', constNumber],
	['Object', constObject], ['String', constString], ['Timestamp', constTimestamp ],
	['AVN', constAVN], ['JSON', constJSON],
];
const functions: [string, Constant][] = [
	// Array
	['First', funcFirst], ['Last', funcLast], ['FirstIndex', funcFirstIndex], ['LastIndex', funcLastIndex],
	['Any', funcAny], ['Every', funcEvery], ['Flatten', funcFlatten], ['Reverse', funcReverse],
	['Transform', funcTransform], ['Filter', funcFilter], ['Reduce', funcReduce], ['Compose', funcCompose],
	// Buffer
	['Byte', funcByte],
	// Enumerable
	['Add', funcAdd], ['Slice', funcSlice],
	// Iterable
	['Length', funcLength], ['At', funcAt],
	// Number
	['GreaterThan', funcGreaterThan], ['LessThan', funcLessThan], ['GreaterOrEqual', funcGreaterOrEqual], ['LessOrEqual', funcLessOrEqual],
	['Subtract', funcSubtract], ['Multiply', funcMultiply], ['Divide', funcDivide], ['Remainder', funcRemainder], ['Modulo', funcModulo],
	['Power', funcPower], ['Root', funcRoot], ['Negate', funcNegate],
	// Object
	['Entries', funcEntries], ['Keys', funcKeys], ['Values', funcValues],
	// String
	['Like', funcLike], ['Unlike', funcUnlike], ['Contains', funcContains], ['StartsWith', funcStartsWith], ['EndsWith', funcEndsWith],
	['Char', funcChar], ['CharCode', funcCharCode], ['Alphanum', funcAlphanum],
	['Trim', funcTrim], ['TrimStart', funcTrimStart], ['TrimEnd', funcTrimEnd],
	['LowerCase', funcLowerCase], ['UpperCase', funcUpperCase], ['Join', funcJoin], ['Split', funcSplit],
	// Timestamp
	['Year', funcYear], ['Month', funcMonth], ['MonthIndex', funcMonthIndex], ['WeekdayIndex', funcWeekdayIndex], ['Day', funcDay],
	['Hour', funcHour], ['Minute', funcMinute], ['Second', funcSecond], ['Millisecond', funcMillisecond], ['EpochTime', funcEpochTime],
	// Unknown
	['Coalesce', funcCoalesce], ['Equal', funcEqual], ['Unequal', funcNotEqual],
];

export class Expression {

	static readonly keywords = [...keywords, ...constants.map((c)=> c[0])];
	protected readonly _expression: string;
	protected readonly _strict: boolean;
	protected readonly _root: Node;
	protected readonly _variables = new Map<string, Variable>();
	protected readonly _constants = new Map<string, Constant>(constants);
	protected readonly _functions = new Map<string, Constant>(functions);
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
		constants?: Record<string, [Value, Type?]>,
	}) {
		this._expression = expr;
		this._strict = config?.strict ?? false;
		if (config?.variables) {
			for (const v in config.variables) {
				this._variables.set(v, new Variable(config.variables[v]));
			}
		}
		if (config?.constants) {
			for (const c in config.constants) {
				const [value, type] = config.constants[c];
				this._constants.set(c, new Constant(value, type));
			}
		}
		const state = new ParserState(this._expression);
		this._root = this.block(state.next(), this._scope);
		if (!state.isVoid) {
			state.throwError('unexpected expression token or expression end');
		}
		this._root = this._root.compile(config?.type ?? Type.Unknown);
	}

	/**
		Returns compiled expression return value type.
	*/
	get expression(): String {
		return this._expression;
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
	evaluate(values?: Record<string, Value>): Value {
		const variables = this._scope.variables();
		for (const name in variables) {
			if (!Object.prototype.hasOwnProperty.call(values, name)) {
				this._root.locate(name).throwError(`undefined variable ${name}:\n`);
			}
			const variable = variables[name];
			const value = values?.[name] ?? undefined;
			if (!variable.type.reduce(Type.of(value))) {
				this._root.locate(name).throwError(`unexpected type ${Type.of(value)} for variable ${name} of type ${variable.type}:\n`);
			}
			variable.value = value;
		}
		return this._root.evaluate();
	}

	protected block(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		const nodes: Node[] = [this.unit(state, scope)];
		while (state.isCommaSeparator) {
			nodes.push(this.unit(state.next(), scope));
		}
		return new BlockNode(frame.ends(state), nodes);
	}

	protected unit(state: ParserState, scope: StaticScope): Node {
		return this.disjunction(state, scope);
	}

	protected disjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.conjunction(state, scope);
		while (state.operator === funcOr) {
			node = this.invoke(state.starts(), state.operator, [node, this.conjunction(state.next(), scope)]);
		}
		return node;
	}

	protected conjunction(state: ParserState, scope: StaticScope): Node {
		let node = this.comparison(state, scope);
		while (state.operator === funcAnd) {
			node = this.invoke(state.starts(), state.operator, [node, this.comparison(state.next(), scope)]);
		}
		return node;
	}

	protected comparison(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		let not = false;
		while (state.operator === funcNot) {
			not = !not;
			frame.starts(state);
			state.next();
		}
		let node = this.aggregate(state, scope);
		while (state.operator === funcGreaterThan || state.operator === funcLessThan
			|| state.operator === funcGreaterOrEqual || state.operator === funcLessOrEqual
			|| state.operator === funcEqual || state.operator === funcNotEqual) {
			node = this.invoke(state.starts(), state.operator, [node, this.aggregate(state.next(), scope)]);
		}
		if (not) {
			node = this.invoke(frame.ends(state), funcNot, [node]);
		}
		return node;
	}

	protected aggregate(state: ParserState, scope: StaticScope): Node {
		let node = this.product(state, scope);
		while (state.operator === funcAdd || state.operator === funcSubtract) {
			node = this.invoke(state.starts(), state.operator, [node, this.product(state.next(), scope)]);
		}
		return node;
	}

	protected product(state: ParserState, scope: StaticScope): Node {
		let node = this.factor(state, scope);
		while (state.operator === funcMultiply || state.operator === funcDivide || state.operator === funcRemainder) {
			node = this.invoke(state.starts(), state.operator, [node, this.factor(state.next(), scope)]);
		}
		return node;
	}

	protected factor(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		let neg = false;
		while (state.operator === funcSubtract) {
			neg = !neg;
			frame.starts(state);
			state.next();
		}
		let node = this.coalescence(state, scope);
		while (state.operator === funcPower) {
			node = this.invoke(state.starts(), state.operator, [node, this.coalescence(state.next(), scope)]);
		}
		if (neg) {
			node = this.invoke(frame.ends(state), funcNegate, [node]);
		}
		return node;
	}

	protected coalescence(state: ParserState, scope: StaticScope): Node {
		let node = this.accessor(state, scope);
		while (state.operator === funcCoalesce) {
			node = this.invoke(state.starts(), state.operator, [node, this.accessor(state.next(), scope)]);
		}
		return node;
	}

	protected accessor(state: ParserState, scope: StaticScope): Node {
		let node = this.term(state, scope);
		while (state.operator === funcAt || state.isParenthesesOpen || state.isBracketsOpen) {
			const frame = state.starts();
			if (state.operator === funcAt) {
				if (state.next().isLiteral && (typeof state.literalValue === 'string' || typeof state.literalValue === 'number')) {
					node = this.invoke(frame.ends(state), funcAt, [node, new ConstantNode(state, new Constant(state.literalValue))]);
					state.next();
				}
				else if (state.isToken) {
					frame.ends(state);
					const mfunction = this._functions.get(state.token);
					if (mfunction) {
						if (state.next().isParenthesesOpen) {
							const subnodes: Node[] = [node];
							while (!state.next().isParenthesesClose) {
								subnodes.push(this.unit(state, scope));
								if (!state.isCommaSeparator) {
									break;
								}
							}
							node = this.invoke(frame.ends(state), mfunction, subnodes);
							state.closeParentheses().next();
						}
						else {
							node = this.invoke(frame, mfunction, [node]);
						}
					}
					else {
						node = this.invoke(frame, funcAt, [node, new ConstantNode(state, new Constant(state.token))]);
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
					if (!state.isCommaSeparator) {
						break;
					}
				}
				node = new InvocationNode(frame.ends(state), node, subnodes);
				state.closeParentheses().next();
			}
			else if (state.isBracketsOpen) {
				node = this.invoke(frame, funcAt, [node, this.unit(state.next(), scope)]);
				state.closeBrackets().next();
			}
		}
		return node;
	}

	protected term(state: ParserState, scope: StaticScope): Node {
		if (state.isLiteral) {
			const frame = state.starts();
			const constant = new Constant(state.literalValue);
			state.next();
			return new ConstantNode(frame, constant);
		}
		else if (state.isToken) {
			const frame = state.starts();
			const constant = this._constants.get(state.token);
			if (constant != null) {
				state.next();
				return new ConstantNode(frame, constant);
			}
			let variable = scope.get(state.token);
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
				scope.global(state.token, variable);
			}
			if (state.next().isAssignment) {
				if (variable.constant) {
					state.throwError('illegal constant assignment');
				}
				if (state.assignmentOperator) {
					const operator = state.assignmentOperator;
					const subnodes = [new VariableNode(frame, variable), this.unit(state.next(), scope)];
					return new VariableNode(frame, variable, this.invoke(frame, operator, subnodes));
				}
				else {
					return new VariableNode(frame, variable, this.unit(state.next(), scope));
				}
			}
			return new VariableNode(frame, variable);
		}
		else if (state.isBracesOpen) {
			const node = this.block(state.next(), scope);
			state.closeBraces().next();
			return node;
		}
		else if (state.isBracesClose) {
			state.throwError('unexpected closing braces');
		}
		else if (state.isParenthesesOpen) {
			const node = this.unit(state.next(), scope);
			state.closeParentheses().next();
			return node;
		}
		else if (state.isParenthesesClose) {
			state.throwError('unexpected closing parentheses');
		}
		else if (state.isBracketsOpen) {
			const frame = state.starts();
			const subnodes: [ Node | number, Node ][] = [];
			let index = 0, colon = false;
			while (!state.next().isBracketsClose) {
				if (state.isColonSeparator) {
					colon = true;
					state.next();
					break;
				}
				const node = this.unit(state, scope);
				if (state.isColonSeparator) {
					colon = true;
					subnodes.push([node, this.unit(state.next(), scope)]);
				}
				else {
					subnodes.push([index++, node]);
				}
				if (!state.isCommaSeparator) {
					break;
				}
			}
			frame.ends(state);
			state.closeBrackets().next();
			return colon
				? new ObjectNode(frame, subnodes.map(([k, v])=> [typeof k === 'number' ? new ConstantNode(v, new Constant(String(k))) : k, v] as const))
				: new ArrayNode(frame, subnodes.map(([, v])=> v));
		}
		else if (state.isBracketsClose) {
			state.throwError('unexpected closing brackets');
		}
		else if (state.isVariableDefinition || state.isConstantDefinition) {
			const constant = state.isConstantDefinition;
			if (!state.next().isToken) {
				state.throwError(`missing ${constant ? 'constant' : 'variable'} name`);
			}
			const token = state.token;
			if (scope.has(token)) {
				state.throwError(`illegal redefinition of ${constant ? 'constant' : 'variable'} ${token}`);
			}
			const frame = state.starts();
			let type: Type | undefined;
			if (state.next().isColonSeparator) {
				if (!state.next().isType) {
					state.throwError(`missing ${constant ? 'constant' : 'variable'} type`);
				}
				type = state.type;
				if (state.next().isOptionalType) {
					type = type.toOptional();
					state.next();
				} // extend else clause to support type disjunctions	
			}
			const variable = new Variable(type, constant);
			scope.local(token, variable);
			if (state.isAssignment) {
				if (state.assignmentOperator) {
					state.throwError(`illegal assignment to ${constant ? 'constant' : 'variable'} ${token}`);
				}
				return new VariableNode(frame, variable, this.unit(state.next(), scope));
			}
			return new VariableNode(frame, variable);
		}
		else if (state.isType) {
			return this.subroutine(state, scope);
		}
		else if (state.isLoop) {
			return this.loop(state, scope);
		}
		else if (state.isSwitch) {
			return this.switch(state, scope);
		}
		else if (state.isVoid) {
			state.throwError('unexpected end of expression');
		}
		state.throwError('unexpected expression token');
	}

	protected subroutine(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		let type = state.type;
		if (state.next().isOptionalType) {
			type = type.toOptional();
			state.next();
		}
		const variables = new Map<string, Variable>();
		state.openParentheses();
		while (!state.next().isParenthesesClose) {
			if (!state.isToken) {
				state.throwError('missing function argument name');
			}
			const token = state.token;
			if (scope.get(token)) {
				state.throwError('variable redefinition');
			}
			let argType = Type.Unknown;
			if (state.next().isColonSeparator) {
				argType = state.next().type;
				if (state.next().isOptionalType) {
					argType = argType.toOptional();
					state.next();
				}
			}
			variables.set(token, new Variable(argType));
			if (!state.isCommaSeparator) {
				break;
			}
		}
		state.closeParentheses();
		frame.ends(state);
		state.next().openBraces().next();
		const subnode = this.block(state, scope.subscope(variables));
		state.closeBraces().next();
		const args = Array.from(variables.values());
		const value = (...values: Value[])=> {
			args.forEach((arg, ix)=> arg.value = values[ix]);
			return subnode.evaluate();
		};
		const constant = new Constant(value, type ? Type.functionType(type, args.map((v)=> v.type)) : undefined);
		return new ConstantNode(frame, constant, subnode);
	}

	protected loop(state: ParserState, scope: StaticScope) {
		const frame = state.starts();
		const cnode = this.unit(state.next(), scope);
		frame.ends(state);
		state.openBraces().next();
		const subnode = this.block(state, scope);
		state.closeBraces().next();
		return new LoopNode(frame, cnode, subnode);
	}

	protected switch(state: ParserState, scope: StaticScope) {
		const frame = state.starts();
		const cnode = this.unit(state.next(), scope);
		frame.ends(state);
		const subnodes: Node[] = [];
		state.openBraces().next();
		subnodes.push(this.block(state, scope));
		state.closeBraces().next();
		state.separateByColon().next();
		state.openBraces().next();
		subnodes.push(this.block(state, scope));
		state.closeBraces().next();
		return new SwitchNode(frame, cnode, subnodes);
	}

	protected invoke(frame: ParserFrame, func: Constant, subnodes: Node[]): Node {
		return new InvocationNode(frame, new ConstantNode(frame, func), subnodes);
	}

}
