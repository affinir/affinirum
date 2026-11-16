import { Type } from "./Type.js";
import { ParserState } from "./ParserState.js";
import { LexicalScope } from "./LexicalScope.js";

export class TypeParser {

	parse(state: ParserState, scope: LexicalScope): Type {
		let type = this._atom(state, scope);
		while (state.equals("|")) { // type union
			type = Type.union(type, this._atom(state.next(), scope));
		}
		return type;
	}

	protected _atom(state: ParserState, scope: LexicalScope): Type {
		if (state.isType) { // literal type
			let type = state.type;
			if (state.next().equals("?")) {
				type = type.toOptional();
				state.next();
			}
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
		else if (state.equals("[")) { // array or object type
			if (state.next().equals("...")) {
				const object = state.next().equals(":");
				if (object) {
					state.next();
				}
				if (state.equals("]")) {
					state.next();
					return object ? Type.Object : Type.Array;
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
					state.next().separateByColon();
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
		else if (state.equals("~")) { // function type
			state.next().openParentheses();
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
			state.next();
			const retType = state.equals(":") ? this.parse(state.next(), scope) : Type.Any;
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
