import { Type } from "./Type.js";
import { ParserState } from "./ParserState.js";
import { LexicalScope } from "./LexicalScope.js";
import { funcOr } from "./native/Boolean.js";

export class TypeParser {

	parse(state: ParserState, scope: LexicalScope): Type {
		let type = this._element(state, scope);
		while (state.operator === funcOr) { // type union
			type = Type.union(type, this._element(state.next(), scope));
		}
		return type;
	}

	protected _element(state: ParserState, scope: LexicalScope): Type {
		if (state.isType) { // literal type
			let type = state.type;
			if (state.next().isQuestion) {
				type = type.toOptional();
				state.next();
			}
			return type;
		}
		else if (state.isBracketsOpen) { // array or object type
			if (state.next().isEllipsis) {
				const object = state.next().isColon;
				if (object) {
					state.next();
				}
				const valType = this.parse(state, scope);
				state.closeBrackets();
				state.next();
				return object ? Type.objectType(valType) : Type.arrayType(valType);
			}
			const valTypes: [string, Type][] = [];
			let index = 0, colon = state.isColon;
			if (colon) {
				state.next().closeBrackets();
			}
			while (!state.isBracketsClose) {
				if (state.isLiteral && typeof state.literal.value === "string") {
					const key = state.literal.value;
					state.next().separateByColon();
					valTypes.push([key, this.parse(state.next(), scope)]);
					colon = true;
				}
				else {
					valTypes.push([String(index++), this.parse(state, scope)]);
				}
				if (!state.isComma) {
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
		else if (state.isTilda) { // function type
			state.next().openParentheses();
			let variadic = false;
			const argTypes: Type[] = [];
			while (!state.next().isParenthesesClose) {
				variadic = state.isEllipsis;
				if (variadic) {
					state.next();
				}
				const argType = this.parse(state, scope);
				argTypes.push(variadic ? Type.arrayType(argType) : argType);
				if (variadic) {
					break;
				}
				if (!state.isComma) {
					break;
				}
			}
			state.closeParentheses();
			state.next();
			const retType = state.isColon ? this.parse(state.next(), scope) : Type.Unknown;
			return Type.functionType([[retType, argTypes, variadic]]);
		}
		else if (state.isParenthesesOpen) { // type grouping
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
