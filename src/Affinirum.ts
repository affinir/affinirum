import { parseAN, formatAN } from "./native/notation/AN.js"
import { funcOr, funcAnd, funcNot } from "./native/Boolean.js";
import { funcAdd } from "./native/Aggregable.js";
import { funcAt, funcHas } from "./native/Iterable.js";
import { funcGreaterThan, funcLessThan, funcGreaterOrEqual, funcLessOrEqual,
	funcSubtract, funcMultiply, funcDivide, funcRemainder, funcPower, funcNegate } from "./native/Number.js";
import { funcCoalesce, funcEqual, funcNotEqual } from "./native/Unknown.js";
import { Constant } from "./Constant.js";
import { Variable } from "./Variable.js";
import { Value, normalize } from "./Value.js";
import { Type } from "./Type.js";
import { Keywords } from "./Keywords.js";
import { Constants } from "./Constants.js";
import { Functions } from "./Functions.js";
import { Node } from "./node/Node.js";
import { ArrayNode } from "./node/ArrayNode.js";
import { AssignmentNode } from "./node/AssignmentNode.js";
import { BlockNode } from "./node/BlockNode.js";
import { CallNode } from "./node/CallNode.js";
import { CastNode } from "./node/CastNode.js";
import { ConstantNode } from "./node/ConstantNode.js";
import { FunctionNode } from "./node/FunctionNode.js";
import { ReturnNode } from "./node/ReturnNode.js";
import { JumpNode } from "./node/JumpNode.js";
import { LoopNode } from "./node/LoopNode.js";
import { ObjectNode } from "./node/ObjectNode.js";
import { TernaryNode } from "./node/TernaryNode.js";
import { VariableNode } from "./node/VariableNode.js";
import { ScriptSpan } from "./ScriptSpan.js";
import { ParserState } from "./ParserState.js";
import { LexicalScope } from "./LexicalScope.js";
import { CallFrame } from "./CallFrame.js";

export class Affinirum {

	static readonly keywords = [...Keywords, ...Constants.map((c) => c[0])];
	protected readonly _script: string;
	protected readonly _strict: boolean;
	protected readonly _root: Node;

	protected readonly _vartypes = new Map<string, Type>();
	protected readonly _varspans = new Map<string, ScriptSpan>();
	protected readonly _variables = new Map<string, Variable>();
	protected readonly _constants = new Map<string, Record<string, Constant>>(Constants);
	protected readonly _functions = new Map<string, Constant>(Functions);
	protected readonly _scope: LexicalScope;

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
		this._scope = new LexicalScope(undefined, undefined, config?.type ?? Type.Unknown);
		this._strict = config?.strict ?? false;
		if (config?.variables) {
			for (const [vname, vtype] of Object.entries(config.variables)) {
				this._vartypes.set(vname, vtype);
			}
		}
		const state = new ParserState(this._script);
		this._root = this._list(state.next(), this._scope);
		if (!state.isEmpty) {
			state.throwError("unexpected expression token or expression end");
		}
		this._root = this._root.compile(this._scope.type());
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
		const types: Record<string, Type> = Object.create(null);
		for (const [name, variable] of this._variables) {
			types[name] = variable.type;
		}
		return types;
	}

	/**
		Evaluates the compiled expression using the provided input values.
		@param values Values for the expression's input variables. Omitted when there are no input variables.
		@returns The evaluated result.
		@throws If an input value is missing or evaluation fails.
	*/
	evaluate(values?: Record<string, Value>): Value {
		const frame = new CallFrame(undefined, this._scope.variables());
		try {
			for (const [name, variable] of this._variables) {
				if (!values || !Object.hasOwn(values, name)) {
					this._varspans.get(name)?.throwError(`undefined variable ${name}:\n`);
				}
				const value = normalize(values?.[name] ?? undefined);
				if (!variable.type.acceptValue(value)) {
					this._varspans.get(name)?.throwError(`unexpected type ${Type.of(value)} for variable ${name} of type ${variable.type}:\n`);
				}
				frame.add(variable, value);
			}
			return normalize(this._root.evaluate(frame) ?? undefined);
		}
		catch (e) {
			if (e instanceof ReturnNode) {
				if (e.scope === "global") {
					return normalize(e.value ?? undefined);
				}
				else {
					throw this._root.throwError(`unexpected ${e.scope} return`);
				}
			}
			if (e instanceof JumpNode) {
				this._root.throwError(`unexpected ${e.action} jump`);
			}
			throw e;
		}
	}

	/** Parses an Affinirum Notation string into a JavaScript value.
		@param value Affinirum Notation string to parse.
		@returns The parsed value.
		@throws If string is not a valid Affinirum Notation string.
	*/
	static parse(value: string | undefined): Value {
		return parseAN(value);
	}

	/** Formats a JavaScript value as an Affinirum Notation string.
		@param value Value to format. Null and undefined are formatted as the AN literal null.
		@param whitespace Optional whitespace used for each indentation level.
		@returns Affinirum Notation formatted string.
	*/
	static format(value: Value, whitespace?: string): string {
		return formatAN(value, whitespace);
	}

	protected _list(state: ParserState, scope: LexicalScope): Node {
		const span = state.start();
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
		return new BlockNode(span.end(state), subnodes);
	}

	protected _unit(state: ParserState, scope: LexicalScope): Node {
		return this._coalescence(state, scope);
	}

	protected _coalescence(state: ParserState, scope: LexicalScope): Node {
		let node = this._disjunction(state, scope);
		while (state.operator === funcCoalesce) {
			const fnode = new ConstantNode(state, state.operator);
			node = new CallNode(state, fnode, [node, this._disjunction(state.next(), scope)]);
		}
		return node;
	}

	protected _disjunction(state: ParserState, scope: LexicalScope): Node {
		let node = this._conjunction(state, scope);
		while (state.operator === funcOr) {
			const fnode = new ConstantNode(state, state.operator);
			node = new CallNode(state, fnode, [node, this._conjunction(state.next(), scope)]);
		}
		return node;
	}

	protected _conjunction(state: ParserState, scope: LexicalScope): Node {
		let node = this._negation(state, scope);
		while (state.operator === funcAnd) {
			const fnode = new ConstantNode(state, state.operator);
			node = new CallNode(state, fnode, [node, this._negation(state.next(), scope)]);
		}
		return node;
	}

	protected _negation(state: ParserState, scope: LexicalScope): Node {
		const span = state.start();
		let negate = false;
		while (state.operator === funcNot) {
			negate = !negate;
			span.end(state);
			state.next();
		}
		let node = this._comparison(state, scope);
		if (negate) {
			const fnode = new ConstantNode(span, funcNot);
			node = new CallNode(span, fnode, [node]);
		}
		return node;
	}

	protected _comparison(state: ParserState, scope: LexicalScope): Node {
		let node = this._aggregate(state, scope);
		while (state.operator === funcGreaterThan || state.operator === funcLessThan
			|| state.operator === funcGreaterOrEqual || state.operator === funcLessOrEqual
			|| state.operator === funcEqual || state.operator === funcNotEqual) {
			const fnode = new ConstantNode(state, state.operator);
			node = new CallNode(state, fnode, [node, this._aggregate(state.next(), scope)]);
		}
		return node;
	}

	protected _aggregate(state: ParserState, scope: LexicalScope): Node {
		let node = this._product(state, scope);
		while (state.operator === funcAdd || state.operator === funcSubtract) {
			const fnode = new ConstantNode(state, state.operator);
			node = new CallNode(state, fnode, [node, this._product(state.next(), scope)]);
		}
		return node;
	}

	protected _product(state: ParserState, scope: LexicalScope): Node {
		let node = this._signum(state, scope);
		while (state.operator === funcMultiply || state.operator === funcDivide || state.operator === funcRemainder) {
			const fnode = new ConstantNode(state, state.operator);
			node = new CallNode(state, fnode, [node, this._signum(state.next(), scope)]);
		}
		return node;
	}

	protected _signum(state: ParserState, scope: LexicalScope): Node {
		const span = state.start();
		let negate = false;
		while (state.operator === funcAdd || state.operator === funcSubtract) {
			if (state.operator === funcSubtract) {
				negate = !negate;
			}
			span.end(state);
			state.next();
		}
		let node = this._factor(state, scope);
		if (negate) {
			const fnode = new ConstantNode(span, funcNegate);
			node = new CallNode(span, fnode, [node]);
		}
		return node;
	}

	protected _factor(state: ParserState, scope: LexicalScope): Node {
		let node = this._accessor(state, scope);
		while (state.operator === funcPower) {
			const fnode = new ConstantNode(state, state.operator);
			node = new CallNode(state, fnode, [node, this._accessor(state.next(), scope)]);
		}
		return node;
	}

	protected _accessor(state: ParserState, scope: LexicalScope): Node {
		const span = state.start();
		let node = this._term(state, scope);
		while (state.isDot || state.isQuestion || state.isParenthesesOpen || state.isBracketsOpen || state.isCast) {
			if (state.isDot || state.isQuestion) { // property access or property existance operator
				const operator = state.isDot ? funcAt : funcHas;
				if (state.next().isLiteral && (typeof state.literal.value === "string" || typeof state.literal.value === "bigint")) {
					const fnode = new ConstantNode(span.end(state), operator);
					node = new CallNode(span, fnode, [node, new ConstantNode(state, new Constant(state.literal.value))]);
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
							const fnode = new ConstantNode(span.end(state), func);
							node = new CallNode(span, fnode, subnodes);
							state.closeParentheses().next();
						}
						else {
							const fnode = new ConstantNode(span.end(state), func);
							node = new CallNode(span, fnode, [node]);
						}
					}
					else {
						const fnode = new ConstantNode(span.end(state), operator);
						node = new CallNode(span, fnode, [node, new ConstantNode(state, new Constant(state.token))]);
						state.next();
					}
				}
				else {
					state.throwError("missing array index or object key");
				}
			}
			else if (state.isParenthesesOpen) { // function call
				const subnodes: Node[] = [];
				while (!state.next().isParenthesesClose) {
					subnodes.push(this._unit(state, scope));
					if (!state.isComma) {
						break;
					}
				}
				state.closeParentheses();
				node = new CallNode(span.end(state), node, subnodes);
				state.next();
			}
			else if (state.isBracketsOpen) { // index access operator
				const subnodes = [node, this._unit(state.next(), scope)];
				state.closeBrackets();
				const fnode = new ConstantNode(span.end(state), funcAt);
				node = new CallNode(span, fnode, subnodes);
				state.next();
			}
			else if (state.isCast) { // type cast operator
				const type = this._type(state.next(), scope);
				node = new CastNode(span.end(state), node, type);
			}
		}
		return node;
	}

	protected _term(state: ParserState, scope: LexicalScope): Node {
		if (state.isLiteral) { // literal constant
			const span = state.start();
			const constant = new Constant(state.literal.value);
			state.next();
			return new ConstantNode(span, constant);
		}
		else if (state.isToken) { // variable
			const span = state.start();
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
				return new ConstantNode(span, constant);
			}
			let variable = scope.get(state.token) ?? this._variables.get(state.token);
			if (variable == null) {
				const type = this._vartypes.get(state.token);
				if (type == null && this._strict) {
					state.throwError(`undefined variable ${state.token} in strict mode`);
				}
				variable = new Variable(type);
				this._variables.set(state.token, variable);
				this._varspans.set(state.token, state.start());
			}
			if (state.next().isAssignment) {
				if (!variable.assignable) {
					state.throwError("illegal re-assignment");
				}
				if (state.assignment.operator) {
					const operator = state.assignment.operator;
					const fnode = new ConstantNode(span, operator);
					const subnode = new CallNode(span, fnode, [new VariableNode(span, variable), this._unit(state.next(), scope)]);
					return new AssignmentNode(span, new VariableNode(span, variable), subnode);
				}
				else {
					const subnode = this._unit(state.next(), scope);
					return new AssignmentNode(span, new VariableNode(span, variable), subnode);
				}
			}
			return new VariableNode(span, variable);
		}
		else if (state.isBracesOpen) { // code block
			const span = state.start();
			const subscope = scope.subscope();
			const subnodes: Node[] = [];
			while (!state.next().isBracesClose) {
				subnodes.push(this._unit(state, subscope));
				if (!state.isSemicolon) {
					break;
				}
			}
			span.end(state);
			state.closeBraces().next();
			return new BlockNode(span, subnodes, [...subscope.variables()]);
		}
		else if (state.isBracesClose) {
			state.throwError("unexpected closing braces");
		}
		else if (state.isParenthesesOpen) { // unit grouping
			const node = this._unit(state.next(), scope);
			state.closeParentheses().next();
			return node;
		}
		else if (state.isParenthesesClose) {
			state.throwError("unexpected closing parentheses");
		}
		else if (state.isBracketsOpen) { // array or object
			const span = state.start();
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
			span.end(state);
			state.closeBrackets().next();
			if (colon) {
				return new ObjectNode(span, subnodes.map(([k, v]) =>
					[typeof k === "number" ? new ConstantNode(v, new Constant(String(k))) : k, v] as const
				));
			}
			return new ArrayNode(span, subnodes.map(([, v]) => v));
		}
		else if (state.isBracketsClose) {
			state.throwError("unexpected closing brackets");
		}
		else if (state.isVar || state.isVal) { // variable declaration
			const assignable = state.isVar;
			if (!state.next().isToken) {
				state.throwError("missing variable name");
			}
			const token = state.token;
			if (scope.has(token)) {
				state.throwError(`illegal redefinition of variable ${token}`);
			}
			const span = state.start();
			let type: Type | undefined;
			if (state.next().isColon) {
				type = this._type(state.next(), scope);
			}
			const variable = new Variable(type, assignable);
			scope.set(token, variable);
			if (state.isAssignment) {
				if (state.assignment.operator) {
					state.throwError(`illegal assignment operator with variable ${token}`);
				}
				return new AssignmentNode(span, new VariableNode(span, variable), this._unit(state.next(), scope));
			}
			return new VariableNode(span, variable);
		}
		else if (state.isTilda) {
			return this._function(state, scope);
		}
		else if (state.isIf) {
			return this._ternary(state, scope);
		}
		else if (state.isWhile) {
			return this._loop(state, scope);
		}
		else if (state.isReturn) {
			return new ReturnNode(state, "function", this._unit(state.next(), scope), scope.type());
		}
		else if (state.isResult) {
			return new ReturnNode(state, "global", this._unit(state.next(), scope), this._scope.type());
		}
		else if (state.isExit) {
			const node = new JumpNode(state, "exit");
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

	protected _function(state: ParserState, scope: LexicalScope): Node {
		const span = state.start();
		state.next().openParentheses();
		let variadic = false;
		const variables = new Map<string, Variable>();
		while (!state.next().isParenthesesClose) {
			if (!state.isToken) {
				state.throwError("missing function argument name");
			}
			const token = state.token;
			if (variables.has(token)) {
				state.throwError(`duplicate function argument name ${token}`);
			}
			if (scope.has(token)) {
				state.throwError(`variable ${token} redefinition`);
			}
			let argType = Type.Unknown;
			if (state.next().isColon) {
				variadic = state.next().isEllipsis;
				if (variadic) {
					state.next();
				}
				argType = this._type(state, scope);
			}
			variables.set(token, new Variable(argType));
			if (variadic) {
				if (argType.isArray) {
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
		const returnType = state.isColon ? this._type(state.next(), scope) : Type.Unknown;
		span.end(state);
		const args = Array.from(variables.values());
		const subscope = scope.subscope(variables, returnType);
		const subnode =  this._unit(state, subscope);
		const functionType = Type.functionType(returnType, args.map((v) => v.type), { variadic });
		return new FunctionNode(span, subnode, args, [...subscope.variables()], functionType);
	}

	protected _loop(state: ParserState, scope: LexicalScope) {
		const span = state.start();
		const cnode = this._unit(state.next(), scope);
		span.end(state);
		return new LoopNode(span, cnode, this._unit(state, scope));
	}

	protected _ternary(state: ParserState, scope: LexicalScope) {
		const span = state.start();
		const cnode = this._unit(state.next(), scope);
		span.end(state);
		const cthen = this._unit(state, scope);
		const celse = state.isElse
			? this._unit(state.next(), scope)
			: new ConstantNode(state.start(), Constant.Null);
		return new TernaryNode(span, cnode, [cthen, celse]);
	}

	protected _type(state: ParserState, scope: LexicalScope): Type {
		if (state.isType) { // literal type
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
			const valTypes: [number | string | undefined, Type][] = [];
			let index = 0, colon = false;
			while (!state.next().isBracketsClose) {
				if (state.isLiteral && typeof state.literal.value === "string") {
					const key = state.literal.value;
					state.next().separateByColon().next();
					valTypes.push([key, this._type(state, scope)]);
					colon = true;
				}
				else if (state.isColon) {
					colon = true;
					if (!state.next().isBracketsClose) {
						valTypes.push([undefined, this._type(state, scope)]);
						break;
					}
				}
				else {
					valTypes.push([index++, this._type(state, scope)]);
				}
				if (!state.isComma) {
					break;
				}
			}
			state.closeBrackets().next();
			return colon
				? Type.objectType(valTypes.map(([key, type]) => [key as string | undefined, type]))
				: Type.arrayType(valTypes.map(([, v]) => v));
		}
		else if (state.isTilda) { // function type
			state.next().openParentheses();
			let variadic = false;
			const argTypes: Type[] = [];
			while (!state.next().isParenthesesClose) {
				variadic = state.isEllipsis;
				if (variadic) {
					state.next();
				}
				const argType = this._type(state, scope);
				argTypes.push(argType);
				if (variadic) {
					if (argType.isArray) {
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
			const retType = state.isColon ? this._type(state.next(), scope) : Type.Unknown;
			return Type.functionType(retType, argTypes, { variadic });
		}
		else if (state.isParenthesesOpen) { // type grouping
			const type = this._type(state.next(), scope);
			state.closeParentheses().next();
			return type;
		}
		else {
			state.throwError("missing type name");
		}
	}

}
