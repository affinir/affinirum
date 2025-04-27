import { funcOr, funcAnd, funcNot } from './constant/Boolean.js';
import { funcAt } from './constant/Iterable.js';
import { funcCoalesce, funcEqual, funcNotEqual, funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual,
	funcAdd, funcSubtract, funcMultiply, funcDivide, funcRemainder, funcPower, funcNegate } from './constant/Unknown.js';
import { Constant } from './Constant.js';
import { Variable } from './Variable.js';
import { Value } from './Value.js';
import { Type } from './Type.js';
import { Keywords } from './Keywords.js';
import { Constants } from './Constants.js';
import { Functions } from './Functions.js';
import { Node } from './Node.js';
import { ArrayNode } from './node/ArrayNode.js';
import { BlockNode } from './node/BlockNode.js';
import { ConstantNode } from './node/ConstantNode.js';
import { CallNode } from './node/CallNode.js';
import { LoopNode } from './node/LoopNode.js';
import { ObjectNode } from './node/ObjectNode.js';
import { SwitchNode } from './node/SwitchNode.js';
import { VariableNode } from './node/VariableNode.js';
import { ParserFrame } from './ParserFrame.js';
import { ParserState } from './ParserState.js';
import { StaticScope } from './StaticScope.js';

export class Affinirum {

	static readonly keywords = [...Keywords, ...Constants.map((c)=> c[0])];
	protected readonly _script: string;
	protected readonly _strict: boolean;
	protected readonly _root: Node;
	protected readonly _variables = new Map<string, Variable>();
	protected readonly _constants = new Map<string, Record<string, Constant>>(Constants);
	protected readonly _functions = new Map<string, Constant>(Functions);
	protected readonly _scope = new StaticScope();

	/**
		Creates compiled expression. Any parsed token not recognized as a constant or a function will be compiled as a variable.
		@param script Math expression to compile.
		@param config Optional expected type, strict mode, variable types, constant values and functions to add for the compilation.
			If expected type is provided then expression return type is matched against it.
			If strict mode is set then undeclared variables will not be allowed in expression.
	*/
	constructor(script: string, config?: {
		type?: Type,
		strict?: boolean,
		variables?: Record<string, Type>,
	}) {
		this._script = script;
		this._strict = config?.strict ?? false;
		if (config?.variables) {
			for (const v in config.variables) {
				this._variables.set(v, new Variable(config.variables[v]));
			}
		}
		const state = new ParserState(this._script);
		this._root = this._block(state.next(), this._scope);
		if (!state.isVoid) {
			state.throwError('unexpected expression token or expression end');
		}
		this._root = this._root.compile(config?.type ?? Type.Unknown);
	}

	/**
		Returns original script text.
	*/
	get script(): String {
		return this._script;
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
			if (!variable.type.match(Type.of(value))) {
				this._root.locate(name).throwError(`unexpected type ${Type.of(value)} for variable ${name} of type ${variable.type}:\n`);
			}
			variable.value = value;
		}
		return this._root.evaluate();
	}

	protected _block(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		const nodes: Node[] = [this._unit(state, scope)];
		while (state.isCommaSeparator) {
			nodes.push(this._unit(state.next(), scope));
		}
		return new BlockNode(frame.ends(state), nodes);
	}

	protected _unit(state: ParserState, scope: StaticScope): Node {
		return this._disjunction(state, scope);
	}

	protected _disjunction(state: ParserState, scope: StaticScope): Node {
		let node = this._conjunction(state, scope);
		while (state.operator === funcOr) {
			node = this._call(state.starts(), state.operator, [node, this._conjunction(state.next(), scope)]);
		}
		return node;
	}

	protected _conjunction(state: ParserState, scope: StaticScope): Node {
		let node = this._comparison(state, scope);
		while (state.operator === funcAnd) {
			node = this._call(state.starts(), state.operator, [node, this._comparison(state.next(), scope)]);
		}
		return node;
	}

	protected _comparison(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		let not = false;
		while (state.operator === funcNot) {
			not = !not;
			frame.starts(state);
			state.next();
		}
		let node = this._aggregate(state, scope);
		while (state.operator === funcGreaterThan || state.operator === funcLessThan
			|| state.operator === funcGreaterOrEqual || state.operator === funcLessOrEqual
			|| state.operator === funcEqual || state.operator === funcNotEqual) {
			node = this._call(state.starts(), state.operator, [node, this._aggregate(state.next(), scope)]);
		}
		if (not) {
			node = this._call(frame.ends(state), funcNot, [node]);
		}
		return node;
	}

	protected _aggregate(state: ParserState, scope: StaticScope): Node {
		let node = this._product(state, scope);
		while (state.operator === funcAdd || state.operator === funcSubtract) {
			node = this._call(state.starts(), state.operator, [node, this._product(state.next(), scope)]);
		}
		return node;
	}

	protected _product(state: ParserState, scope: StaticScope): Node {
		let node = this._factor(state, scope);
		while (state.operator === funcMultiply || state.operator === funcDivide || state.operator === funcRemainder) {
			node = this._call(state.starts(), state.operator, [node, this._factor(state.next(), scope)]);
		}
		return node;
	}

	protected _factor(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		let neg = false;
		while (state.operator === funcSubtract) {
			neg = !neg;
			frame.starts(state);
			state.next();
		}
		let node = this._coalescence(state, scope);
		while (state.operator === funcPower) {
			node = this._call(state.starts(), state.operator, [node, this._coalescence(state.next(), scope)]);
		}
		if (neg) {
			node = this._call(frame.ends(state), funcNegate, [node]);
		}
		return node;
	}

	protected _coalescence(state: ParserState, scope: StaticScope): Node {
		let node = this._accessor(state, scope);
		while (state.operator === funcCoalesce) {
			node = this._call(state.starts(), state.operator, [node, this._accessor(state.next(), scope)]);
		}
		return node;
	}

	protected _accessor(state: ParserState, scope: StaticScope): Node {
		let node = this._term(state, scope);
		while (state.operator === funcAt || state.isParenthesesOpen || state.isBracketsOpen) {
			const frame = state.starts();
			if (state.operator === funcAt) {
				if (state.next().isLiteral && (typeof state.literalValue === 'string' || typeof state.literalValue === 'number')) {
					node = this._call(frame.ends(state), funcAt, [node, new ConstantNode(state, new Constant(state.literalValue))]);
					state.next();
				}
				else if (state.isToken) {
					frame.ends(state);
					const func = this._functions.get(state.token);
					if (func) {
						if (state.next().isParenthesesOpen) {
							const subnodes: Node[] = [node];
							while (!state.next().isParenthesesClose) {
								subnodes.push(this._unit(state, scope));
								if (!state.isCommaSeparator) {
									break;
								}
							}
							node = this._call(frame.ends(state), func, subnodes);
							state.closeParentheses().next();
						}
						else {
							node = this._call(frame, func, [node]);
						}
					}
					else {
						node = this._call(frame, funcAt, [node, new ConstantNode(state, new Constant(state.token))]);
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
					subnodes.push(this._unit(state, scope));
					if (!state.isCommaSeparator) {
						break;
					}
				}
				node = new CallNode(frame.ends(state), node, subnodes);
				state.closeParentheses().next();
			}
			else if (state.isBracketsOpen) {
				node = this._call(frame, funcAt, [node, this._unit(state.next(), scope)]);
				state.closeBrackets().next();
			}
		}
		return node;
	}

	protected _term(state: ParserState, scope: StaticScope): Node {
		if (state.isLiteral) {
			const frame = state.starts();
			const constant = new Constant(state.literalValue);
			state.next();
			return new ConstantNode(frame, constant);
		}
		else if (state.isToken) {
			const frame = state.starts();
			const constants = this._constants.get(state.token);
			if (constants != null) {
				if (state.next().operator !== funcAt) {
					state.throwError('missing constant accessor operator');
				}
				if (!state.next().isToken) {
					state.throwError('missing constant name');
				}
				const constant = constants[state.token];
				if (!constant) {
					state.throwError(`unknown constant ${state.token}`);
				}
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
					const subnodes = [new VariableNode(frame, variable), this._unit(state.next(), scope)];
					return new VariableNode(frame, variable, this._call(frame, operator, subnodes));
				}
				else {
					return new VariableNode(frame, variable, this._unit(state.next(), scope));
				}
			}
			return new VariableNode(frame, variable);
		}
		else if (state.isBracesOpen) {
			const node = this._block(state.next(), scope);
			state.closeBraces().next();
			return node;
		}
		else if (state.isBracesClose) {
			state.throwError('unexpected closing braces');
		}
		else if (state.isParenthesesOpen) {
			const node = this._unit(state.next(), scope);
			state.closeParentheses().next();
			return node;
		}
		else if (state.isParenthesesClose) {
			state.throwError('unexpected closing parentheses');
		}
		else if (state.isBracketsOpen) {
			const frame = state.starts();
			const subnodes: [number | Node, Node][] = [];
			let index = 0, colon = false;
			while (!state.next().isBracketsClose) {
				if (state.isColonSeparator) {
					colon = true;
					state.next();
					break;
				}
				const node = this._unit(state, scope);
				if (state.isColonSeparator) {
					colon = true;
					subnodes.push([node, this._unit(state.next(), scope)]);
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
				return new VariableNode(frame, variable, this._unit(state.next(), scope));
			}
			return new VariableNode(frame, variable);
		}
		else if (state.isTildaMark) {
			return this._function(state, scope);
		}
		else if (state.isWhile) {
			return this._loop(state, scope);
		}
		else if (state.isIf) {
			return this._switch(state, scope);
		}
		else if (state.isVoid) {
			state.throwError('unexpected end of expression');
		}
		state.throwError('unexpected expression token');
	}

	protected _function(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		let type: Type | undefined = undefined;
		if (!state.next().isParenthesesOpen) {
			if (!state.isType) {
				state.throwError('missing function return type');
			}
			type = state.type;
			if (state.next().isOptionalType) {
				type = type.toOptional();
				state.next();
			}
			state.openParentheses();
		}
		let variadic = false;
		const variables = new Map<string, Variable>();
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
			if (argType.isArray && state.isVariadicFunction) {
				variadic = true;
				state.next();
				break;
			}
			if (!state.isCommaSeparator) {
				break;
			}
		}
		state.closeParentheses();
		frame.ends(state);
		state.next().openBraces().next();
		const subnode = this._block(state, scope.subscope(variables));
		state.closeBraces().next();
		const args = Array.from(variables.values());
		const value = (...values: Value[])=> {
			args.forEach((arg, ix)=> arg.value = values[ix]);
			return subnode.evaluate();
		};
		if (!type && args.length) {
			type = Type.Unknown;
		}
		const constant = new Constant(value, Type.functionType(type, args.map((v)=> v.type), variadic));
		return new ConstantNode(frame, constant, subnode);
	}

	protected _loop(state: ParserState, scope: StaticScope) {
		const frame = state.starts();
		const cnode = this._unit(state.next(), scope);
		frame.ends(state);
		state.openBraces().next();
		const subnode = this._block(state, scope);
		state.closeBraces().next();
		return new LoopNode(frame, cnode, subnode);
	}

	protected _switch(state: ParserState, scope: StaticScope) {
		const frame = state.starts();
		const cnode = this._unit(state.next(), scope);
		frame.ends(state);
		const subnodes: Node[] = [];
		state.openBraces().next();
		subnodes.push(this._block(state, scope));
		state.closeBraces().next();
		if (state.isElse) {
			state.next().openBraces().next();
			subnodes.push(this._block(state, scope));
			state.closeBraces().next();
		}
		else {
			subnodes.push(new ConstantNode(state.starts(), Constant.Null));
		}
		return new SwitchNode(frame, cnode, subnodes);
	}

	protected _call(frame: ParserFrame, func: Constant, subnodes: Node[]): Node {
		return new CallNode(frame, new ConstantNode(frame, func), subnodes);
	}

	protected _type(state: ParserState, scope: StaticScope): Type {
		if (state.isType) {
			let type = state.type;
			if (state.next().isOptionalType) {
				type = type.toOptional();
				state.next();
			}
			if (state.operator === funcOr) { // type union
				return Type.union(type, this._type(state.next(), scope));
			}
			return type;
		}
		else if (state.isBracketsOpen) { // array or object type
			const itemPropTypes: [number | string, Type][] = [];
			let index = 0, colon = false;
			while (!state.next().isBracketsClose) {
				if (state.isColonSeparator) { // default object type
					colon = true;
					state.next();
					break;
				}
				if (state.isType) {
					itemPropTypes.push([index++, this._type(state, scope)]);
				}
				else if (state.isToken) {
					const token = state.token;
					state.next().separateByColon().next();
					itemPropTypes.push([token, this._type(state, scope)]);
				}
				else {
					state.throwError('missing type or property name');
				}
				if (!state.isCommaSeparator) {
					break;
				}
			}
			state.closeBrackets().next();
			return colon
				? Type.objectType(Object.fromEntries(itemPropTypes.map(([prop, type]) => [prop as string, type])))
				: Type.arrayType(itemPropTypes.map(([, v])=> v));
		}
		else if (state.isTildaMark) { // function type
			if (state.next().isParenthesesOpen) { // default function type
				state.next().closeParentheses().next();
				return Type.Function;
			}
			const retType = this._type(state, scope);
			state.openParentheses().next();
			const argTypes: Type[] = [];
			let variadic = false;
			while (!state.next().isParenthesesClose) {
				const argType = this._type(state, scope);
				argTypes.push(argType);
				if (state.isVariadicFunction) {
					if (argType.isArray) {
						variadic = true;
						state.next();
						break;
					}
					else {
						state.throwError('variadic function argument must be an array type');
					}
				}
				if (!state.isCommaSeparator) {
					break;
				}
			}
			state.closeParentheses().next();
			return Type.functionType(retType, argTypes, variadic);
		}
		else {
			state.throwError('missing type name');
		}
	}

}
