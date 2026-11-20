import { Type } from "./Type.js";
import { ParserState } from "./ParserState.js";
import { LexicalScope } from "./LexicalScope.js";

export class TypeParser {

	parse(state: ParserState, scope: LexicalScope): Type {
		let type = this._function(state, scope);
		while (state.equals("|")) { // type union
			type = Type.union(type, this._function(state.next(), scope));
		}
		return type;
	}

	protected _function(state: ParserState, scope: LexicalScope): Type {
		let type = this._optional(state, scope);
		const signatures = type.functionSignatures();
		while (type.isAtom && type.isFunction && state.equals("&")) {
			const next = this._optional(state.next(), scope);
			if (!next.isAtom || !next.isFunction) {
				state.throwError("missing function types");
			}
			signatures.push(...next.functionSignatures());
			type = Type.functionType(signatures);
		}
		return type;
	}

	protected _optional(state: ParserState, scope: LexicalScope): Type {
		let type = this._element(state, scope);
		if (state.equals("?")) {
			if (type.isNull || type.isNever) {
				state.throwError(`optional suffix is invalid on type ${type}`);
			}
			type = type.toOptional();
			state.next();
		}
		return type;
	}

	protected _element(state: ParserState, scope: LexicalScope): Type {
		if (state.isType) { // literal type
			const type = state.type;
			state.next();
			return type;
		}
		if (state.equals("null")) {
			state.next();
			return Type.Null;
		}
		if (state.equals("never")) {
			state.next();
			return Type.Never;
		}
		else if (state.equals("[")) { // composite type
			state.next();
			if (state.equals("...")) {
				const object = state.next().equals(":");
				if (object) {
					state.next();
				}
				const valType = this.parse(state, scope);
				state.closeBrackets();
				state.next();
				return object ? Type.objectType(valType) : Type.arrayType(valType);
			}
			const valTypes: [string, Type][] = [];
			let index = 0, colon = state.equals(":");
			if (colon) {
				state.next().closeBrackets();
			}
			while (!state.equals("]")) {
				if (state.isLiteral && typeof state.literal.value === "string") {
					const key = state.literal.value;
					state.next().assertColon();
					valTypes.push([key, this.parse(state.next(), scope)]);
					colon = true;
				}
				else {
					valTypes.push([String(index++), this.parse(state, scope)]);
				}
				if (!state.equals(",")) {
					break;
				}
				state.next();
			}
			state.closeBrackets();
			state.next();
			return colon
				? Type.objectType(valTypes)
				: Type.arrayType(valTypes.map(([, v]) => v));
		}
		else if (state.equals("{")) { // function type
			if (!state.next().equals("=")) {
				state.throwError("missing function marker");
			}
			if (state.next().equals("}")) {
				state.next();
				return Type.Function;
			}
			state.openParentheses();
			let variadic = false;
			const argTypes: Type[] = [];
			while (!state.next().equals(")")) {
				variadic = state.equals("...");
				if (variadic) {
					state.next();
				}
				const argType = this.parse(state, scope);
				argTypes.push(variadic ? Type.arrayType(argType) : argType);
				if (variadic) {
					break;
				}
				if (!state.equals(",")) {
					break;
				}
			}
			state.closeParentheses();
			const retType = state.next().equals(":") ? this.parse(state.next(), scope) : Type.Any;
			state.closeBraces();
			state.next();
			return Type.functionType([[retType, argTypes, variadic]]);
		}
		else if (state.equals("(")) { // type grouping
			state.next();
			const type = this.parse(state, scope);
			state.closeParentheses();
			state.next();
			return type;
		}
		else {
			state.throwError("missing type name");
		}
	}

}
