import { Type } from "./Type.js";
import { ParserState } from "./ParserState.js";

export class TypeParser {

	parse(state: ParserState): Type {
		let type = this._function(state);
		while (state.equals("|")) { // type union
			type = Type.union(type, this._function(state.next()));
		}
		return type;
	}

	protected _function(state: ParserState): Type {
		let type = this._optional(state);
		const signatures = type.functionSignatures();
		while (type.isAtom && type.isFunction && state.equals("&")) {
			const span = state.next().start();
			const next = this._optional(state);
			if (!next.isAtom || !next.isFunction) {
				span.throwError("missing function types");
			}
			signatures.push(...next.functionSignatures());
			type = Type.functionType(signatures);
		}
		return type;
	}

	protected _optional(state: ParserState): Type {
		let type = this._element(state);
		if (state.equals("?")) {
			if (type.isNull || type.isNever) {
				state.throwError(`optional suffix is invalid on type ${type}`);
			}
			type = type.toOptional();
			state.next();
		}
		return type;
	}

	protected _element(state: ParserState): Type {
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
				const valType = this.parse(state);
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
					valTypes.push([key, this.parse(state.next())]);
					colon = true;
				}
				else {
					valTypes.push([String(index++), this.parse(state)]);
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
			if (state.next().equals(":")) {
				state.next().closeBraces();
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
				const argType = this.parse(state);
				argTypes.push(variadic ? Type.arrayType(argType) : argType);
				if (variadic) {
					break;
				}
				if (!state.equals(",")) {
					break;
				}
			}
			state.closeParentheses();
			state.next().assertColon();
			const retType = this.parse(state.next());
			state.closeBraces();
			state.next();
			return Type.functionType([[retType, argTypes, variadic]]);
		}
		else if (state.equals("(")) { // type grouping
			state.next();
			const type = this.parse(state);
			state.closeParentheses();
			state.next();
			return type;
		}
		else {
			state.throwError("missing type name");
		}
	}

}
