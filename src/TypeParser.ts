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
			const valTypes: [number | string | undefined, Type][] = [];
			let index = 0, colon = false;
			while (!state.next().isBracketsClose) {
				if (state.isLiteral && typeof state.literal.value === "string") {
					const key = state.literal.value;
					state.next();
					state.separateByColon();
					state.next();
					valTypes.push([key, this.parse(state, scope)]);
					colon = true;
				}
				else if (state.isColon) {
					colon = true;
					if (!state.next().isBracketsClose) {
						valTypes.push([undefined, this.parse(state, scope)]);
						break;
					}
				}
				else {
					valTypes.push([index++, this.parse(state, scope)]);
				}
				if (!state.isComma) {
					break;
				}
			}
			state.closeBrackets();
			state.next();
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
				const argType = this.parse(state, scope);
				argTypes.push(argType);
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