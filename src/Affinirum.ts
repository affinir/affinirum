import { funcOr, funcAnd, funcNot } from "./constant/Boolean.js";
import { funcAdd } from "./constant/Enumerable.js";
import { funcAt, funcHas } from "./constant/Iterable.js";
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual,
	funcSubtract, funcMultiply, funcDivide, funcRemainder, funcPower, funcNegate } from "./constant/Number.js";
import { funcCoalesce, funcEqual, funcNotEqual } from "./constant/Unknown.js";
import { Constant } from "./Constant.js";
import { Variable } from "./Variable.js";
import { Value } from "./Value.js";
import { Type } from "./Type.js";
import { Keywords } from "./Keywords.js";
import { Constants } from "./Constants.js";
import { Functions } from "./Functions.js";
import { Node } from "./Node.js";
import { ArrayNode } from "./node/ArrayNode.js";
import { BlockNode } from "./node/BlockNode.js";
import { ConstantNode } from "./node/ConstantNode.js";
import { FunctionNode } from "./node/FunctionNode.js";
import { JumpNode } from "./node/JumpNode.js";
import { LoopNode } from "./node/LoopNode.js";
import { ObjectNode } from "./node/ObjectNode.js";
import { SwitchNode } from "./node/SwitchNode.js";
import { VariableNode } from "./node/VariableNode.js";
import { ParserFrame } from "./ParserFrame.js";
import { ParserState } from "./ParserState.js";
import { StaticScope } from "./StaticScope.js";
import { JumpException } from "./JumpException.js";

export class Affinirum {

	static readonly keywords = [...Keywords, ...Constants.map((c)=> c[0])];
	protected readonly _script: string;
	protected readonly _strict: boolean;
	protected readonly _root: Node;
	protected readonly _vframes = new Map<string, ParserFrame>();
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
		this._root = this._list(state.next(), this._scope);
		if (!state.isEmpty) {
			state.throwError("unexpected expression token or expression end");
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
				this._vframes.get(name)?.throwError(`undefined variable ${name}:\n`);
			}
			const variable = variables[name];
			const value = values?.[name] ?? undefined;
			if (!variable.type.match(Type.of(value))) {
				this._vframes.get(name)?.throwError(`unexpected type ${Type.of(value)} for variable ${name} of type ${variable.type}:\n`);
			}
			variable.value = value;
		}
		try {
			return this._root.evaluate();
		}
		catch (e) {
			if (e instanceof JumpException) {
				if (e.jump === "exit") {
					return e.value;
				}
				else {
					throw this._root.throwError(`unexpected ${e.jump} jump`);
				}
			}
			throw e;
		}
	}

	protected _list(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		const subnodes: Node[] = [];
		while (!state.isEmpty) {
			subnodes.push(this._unit(state, scope));
			if (!state.isSemicolon) {
				break;
			}
			else {
				state.next();
			}
		}
		return new BlockNode(frame.ends(state), subnodes);
	}

	protected _unit(state: ParserState, scope: StaticScope): Node {
		return this._coalescence(state, scope);
	}

	protected _coalescence(state: ParserState, scope: StaticScope): Node {
		let node = this._disjunction(state, scope);
		while (state.operator === funcCoalesce) {
			const fnode = new ConstantNode(state, state.operator);
			node = new FunctionNode(state, fnode, [node, this._disjunction(state.next(), scope)]);
		}
		return node;
	}

	protected _disjunction(state: ParserState, scope: StaticScope): Node {
		let node = this._conjunction(state, scope);
		while (state.operator === funcOr) {
			const fnode = new ConstantNode(state, state.operator);
			node = new FunctionNode(state, fnode, [node, this._conjunction(state.next(), scope)]);
		}
		return node;
	}

	protected _conjunction(state: ParserState, scope: StaticScope): Node {
		let node = this._negation(state, scope);
		while (state.operator === funcAnd) {
			const fnode = new ConstantNode(state, state.operator);
			node = new FunctionNode(state, fnode, [node, this._negation(state.next(), scope)]);
		}
		return node;
	}

	protected _negation(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		let negate = false;
		while (state.operator === funcNot) {
			negate = !negate;
			frame.ends(state);
			state.next();
		}
		let node = this._comparison(state, scope);
		if (negate) {
			const fnode = new ConstantNode(frame, funcNot);
			node = new FunctionNode(frame, fnode, [node]);
		}
		return node;
	}

	protected _comparison(state: ParserState, scope: StaticScope): Node {
		let node = this._aggregate(state, scope);
		while (state.operator === funcGreaterThan || state.operator === funcLessThan
			|| state.operator === funcGreaterOrEqual || state.operator === funcLessOrEqual
			|| state.operator === funcEqual || state.operator === funcNotEqual) {
			const fnode = new ConstantNode(state, state.operator);
			node = new FunctionNode(state, fnode, [node, this._aggregate(state.next(), scope)]);
		}
		return node;
	}

	protected _aggregate(state: ParserState, scope: StaticScope): Node {
		let node = this._product(state, scope);
		while (state.operator === funcAdd || state.operator === funcSubtract) {
			const fnode = new ConstantNode(state, state.operator);
			node = new FunctionNode(state, fnode, [node, this._product(state.next(), scope)]);
		}
		return node;
	}

	protected _product(state: ParserState, scope: StaticScope): Node {
		let node = this._signum(state, scope);
		while (state.operator === funcMultiply || state.operator === funcDivide || state.operator === funcRemainder) {
			const fnode = new ConstantNode(state, state.operator);
			node = new FunctionNode(state, fnode, [node, this._signum(state.next(), scope)]);
		}
		return node;
	}

	protected _signum(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		let negate = false;
		while (state.operator === funcAdd || state.operator === funcSubtract) {
			if (state.operator === funcSubtract) {
				negate = !negate;
			}
			frame.ends(state);
			state.next();
		}
		let node = this._factor(state, scope);
		if (negate) {
			const fnode = new ConstantNode(frame, funcNegate);
			node = new FunctionNode(frame, fnode, [node]);
		}
		return node;
	}

	protected _factor(state: ParserState, scope: StaticScope): Node {
		let node = this._accessor(state, scope);
		while (state.operator === funcPower) {
			const fnode = new ConstantNode(state, state.operator);
			node = new FunctionNode(state, fnode, [node, this._accessor(state.next(), scope)]);
		}
		return node;
	}

	protected _accessor(state: ParserState, scope: StaticScope): Node {
		let node = this._term(state, scope);
		while (state.isDot || state.isQuestion || state.isParenthesesOpen || state.isBracketsOpen) {
			const frame = state.starts();
			if (state.isDot || state.isQuestion) {
				const operator = state.isDot ? funcAt : funcHas;
				if (state.next().isLiteral && (typeof state.literal.value === "string" || typeof state.literal.value === "bigint")) {
					const fnode = new ConstantNode(frame.ends(state), operator);
					node = new FunctionNode(frame, fnode, [node, new ConstantNode(state, new Constant(state.literal.value))]);
					state.next();
				}
				else if (state.isToken) {
					const func = this._functions.get(state.token);
					if (func) {
						if (state.next().isParenthesesOpen) {
							const subnodes: Node[] = [node];
							while (!state.next().isParenthesesClose) {
								subnodes.push(this._unit(state, scope));
								if (!state.isComma) {
									break;
								}
							}
							const fnode = new ConstantNode(frame.ends(state), func);
							node = new FunctionNode(frame, fnode, subnodes);
							state.closeParentheses().next();
						}
						else {
							const fnode = new ConstantNode(frame.ends(state), func);
							node = new FunctionNode(frame, fnode, [node]);
						}
					}
					else {
						const fnode = new ConstantNode(frame.ends(), operator);
						node = new FunctionNode(frame, fnode, [node, new ConstantNode(state, new Constant(state.token))]);
						state.next();
					}
				}
				else {
					state.throwError("missing array index or object key");
				}
			}
			else if (state.isParenthesesOpen) {
				const subnodes: Node[] = [];
				while (!state.next().isParenthesesClose) {
					subnodes.push(this._unit(state, scope));
					if (!state.isComma) {
						break;
					}
				}
				node = new FunctionNode(frame.ends(state), node, subnodes);
				state.closeParentheses().next();
			}
			else if (state.isBracketsOpen) {
				const fnode = new ConstantNode(frame, funcAt);
				node = new FunctionNode(frame, fnode, [node, this._unit(state.next(), scope)]);
				state.closeBrackets().next();
			}
		}
		return node;
	}

	protected _term(state: ParserState, scope: StaticScope): Node {
		if (state.isLiteral) {
			const frame = state.starts();
			const constant = new Constant(state.literal.value);
			state.next();
			return new ConstantNode(frame, constant);
		}
		else if (state.isToken) {
			const frame = state.starts();
			const constants = this._constants.get(state.token);
			if (constants != null) {
				if (!state.next().isDot) {
					state.throwError("missing constant accessor operator");
				}
				if (!state.next().isToken) {
					state.throwError("missing constant name");
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
			if (!this._vframes.has(state.token)) {
				this._vframes.set(state.token, state.starts());
			}
			if (state.next().isAssignment) {
				if (!variable.assignable) {
					state.throwError("illegal re-assignment");
				}
				if (state.assignment.operator) {
					const operator = state.assignment.operator;
					const fnode = new ConstantNode(frame, operator);
					const subnode = new FunctionNode(frame, fnode, [new VariableNode(frame, variable), this._unit(state.next(), scope)]);
					return new VariableNode(frame, variable, subnode);
				}
				else {
					const subnode = this._unit(state.next(), scope);
					return new VariableNode(frame, variable, subnode);
				}
			}
			return new VariableNode(frame, variable);
		}
		else if (state.isBracesOpen) {
			const frame = state.starts();
			const subnodes: Node[] = [];
			while (!state.next().isBracesClose) {
				subnodes.push(this._unit(state, scope));
				if (!state.isSemicolon) {
					break;
				}
			}
			frame.ends(state);
			state.next();
			return new BlockNode(frame, subnodes);
		}
		else if (state.isBracesClose) {
			state.throwError("unexpected closing braces");
		}
		else if (state.isParenthesesOpen) {
			const node = this._unit(state.next(), scope);
			state.closeParentheses().next();
			return node;
		}
		else if (state.isParenthesesClose) {
			state.throwError("unexpected closing parentheses");
		}
		else if (state.isBracketsOpen) {
			const frame = state.starts();
			const subnodes: [number | Node, Node][] = [];
			let index = 0, colon = false;
			while (!state.next().isBracketsClose) {
				if (state.isColon) {
					colon = true;
					state.next();
					break;
				}
				const node = this._unit(state, scope);
				if (state.isColon) {
					colon = true;
					subnodes.push([node, this._unit(state.next(), scope)]);
				}
				else {
					subnodes.push([index++, node]);
				}
				if (!state.isComma) {
					break;
				}
			}
			frame.ends(state);
			state.next();
			if (colon) {
				return new ObjectNode(frame, subnodes.map(([k, v])=>
					[typeof k === "number" ? new ConstantNode(v, new Constant(String(k))) : k, v] as const
				));
			}
			return new ArrayNode(frame, subnodes.map(([, v])=> v));
		}
		else if (state.isBracketsClose) {
			state.throwError("unexpected closing brackets");
		}
		else if (state.isVar || state.isVal) {
			const assignable = state.isVar;
			if (!state.next().isToken) {
				state.throwError("missing variable name");
			}
			const token = state.token;
			if (scope.has(token)) {
				state.throwError(`illegal redefinition of variable ${token}`);
			}
			const frame = state.starts();
			let type: Type | undefined;
			if (state.next().isColon) {
				type = this._type(state.next(), scope);
			}
			const variable = new Variable(type, assignable);
			scope.local(token, variable);
			if (state.isAssignment) {
				if (state.assignment.operator) {
					state.throwError(`illegal assignment operator with variable ${token}`);
				}
				return new VariableNode(frame, variable, this._unit(state.next(), scope));
			}
			return new VariableNode(frame, variable);
		}
		else if (state.isTilda) {
			return this._function(state, scope);
		}
		else if (state.isIf) {
			return this._switch(state, scope);
		}
		else if (state.isWhile) {
			return this._loop(state, scope);
		}
		else if (state.isExit) {
			return new JumpNode(state, "exit", this._unit(state.next(), scope));
		}
		else if (state.isReturn) {
			return new JumpNode(state, "return", this._unit(state.next(), scope));
		}
		else if (state.isStop) {
			const node = new JumpNode(state, "stop");
			state.next();
			return node;
		}
		else if (state.isNext) {
			const node = new JumpNode(state, "next");
			state.next();
			return node;
		}
		else if (state.isEmpty) {
			state.throwError("unexpected end of expression");
		}
		state.throwError("unexpected expression token");
	}

	protected _function(state: ParserState, scope: StaticScope): Node {
		const frame = state.starts();
		let retType = Type.Unknown;
		if (!state.next().isParenthesesOpen) {
			retType = this._type(state, scope);
			state.openParentheses();
		}
		let variadic = false;
		const variables = new Map<string, Variable>();
		while (!state.next().isParenthesesClose) {
			if (!state.isToken) {
				state.throwError("missing function argument name");
			}
			const token = state.token;
			if (scope.get(token)) {
				state.throwError("variable redefinition");
			}
			let argType = Type.Unknown;
			if (state.next().isColon) {
				argType = this._type(state.next(), scope);
			}
			variables.set(token, new Variable(argType));
			if (state.isEllipsis) {
				if (argType.isArray) {
					variadic = true;
					state.next();
					break;
				}
				else {
					state.throwError("variadic function argument must be an array type");
				}
			}
			if (!state.isComma) {
				break;
			}
		}
		state.closeParentheses();
		frame.ends(state);
		const args = Array.from(variables.values());
		const subnode =  this._unit(state.next(), scope.subscope(variables));
		const func = (...values: Value[])=> {
			args.forEach((arg, ix)=> arg.value = values[ix]);
			return subnode.evaluate();
		};
		const constant = new Constant(func, Type.functionType(retType, args.map((v)=> v.type), variadic));
		return new ConstantNode(frame, constant, subnode);
	}

	protected _loop(state: ParserState, scope: StaticScope) {
		const frame = state.starts();
		const cnode = this._unit(state.next(), scope);
		frame.ends(state);
		return new LoopNode(frame, cnode, this._unit(state, scope));
	}

	protected _switch(state: ParserState, scope: StaticScope) {
		const frame = state.starts();
		const cnode = this._unit(state.next(), scope);
		frame.ends(state);
		const cthen = this._unit(state, scope);
		const celse = state.isElse
			? this._unit(state.next(), scope)
			: new ConstantNode(state.starts(), Constant.Null);
		return new SwitchNode(frame, cnode, [cthen, celse]);
	}

	protected _type(state: ParserState, scope: StaticScope): Type {
		if (state.isType) {
			let type = state.type;
			if (state.next().isQuestion) {
				type = type.toOptional();
				state.next();
			}
			if (state.operator === funcOr) { // type union
				return Type.union(type, this._type(state.next(), scope));
			}
			return type;
		}
		else if (state.isBracketsOpen) { // array or object type
			const itemKeyTypes: [number | string, Type][] = [];
			let index = 0, colon = false;
			while (!state.next().isBracketsClose) {
				if (state.isLiteral && typeof state.literal.value === "string") {
					const key = state.literal.value;
					state.next().separateByColon().next();
					itemKeyTypes.push([key, this._type(state, scope)]);
					colon = true;
				}
				else {
					itemKeyTypes.push([index++, this._type(state, scope)]);
				}
				if (!state.isComma) {
					break;
				}
			}
			state.closeBrackets().next();
			return colon
				? Type.objectType(Object.fromEntries(itemKeyTypes.map(([key, type])=> [key as string, type])))
				: Type.arrayType(itemKeyTypes.map(([, v])=> v));
		}
		else if (state.isTilda) { // function type
			let retType = Type.Unknown;
			if (!state.next().isParenthesesOpen) {
				retType = this._type(state, scope);
				state.openParentheses();
			}
			let variadic = false;
			const argTypes: Type[] = [];
			while (!state.next().isParenthesesClose) {
				const argType = this._type(state, scope);
				argTypes.push(argType);
				if (state.isEllipsis) {
					if (argType.isArray) {
						variadic = true;
						state.next();
						break;
					}
					else {
						state.throwError("variadic function argument must be an array type");
					}
				}
				if (!state.isComma) {
					break;
				}
			}
			state.closeParentheses().next();
			if (!retType && argTypes.length) {
				retType = Type.Unknown;
			}
			return Type.functionType(retType, argTypes, variadic);
		}
		else {
			state.throwError("missing type name");
		}
	}

}
