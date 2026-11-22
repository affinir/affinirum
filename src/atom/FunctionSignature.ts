import { Type } from "../Type.js";

export class FunctionSignature {

	protected readonly _retType: Type;
	protected readonly _argTypes: readonly Type[];
	protected readonly _minArity: number;
	protected readonly _isVariadic: boolean;

	constructor(
		retType: Type,
		argTypes: readonly Type[] = [],
		variadic = false,
	) {
		this._retType = retType;
		this._argTypes = [...argTypes];
		this._isVariadic = variadic;
		let minArity = variadic ? Math.max(0, this._argTypes.length - 1) : this._argTypes.length;
		while (minArity > 0 && this._argTypes[minArity - 1].isOptional) {
			--minArity;
		}
		this._minArity = minArity;
		if (this._isVariadic && this._argTypes.length > 0 && !this._argTypes[this._argTypes.length - 1].isUniformArray) {
			throw new Error("variadic function argument must be of uniform array type");
		}
	}

	get retType() {
		return this._retType;
	}

	get argTypes() {
		return this._argTypes;
	}

	get minArity() {
		return this._minArity;
	}

	get maxArity() {
		return this._isVariadic ? Number.POSITIVE_INFINITY : this._argTypes.length;
	}

	get arity() {
		return this._argTypes.length;
	}

	get isVariadic() {
		return this._isVariadic;
	}

	get isGeneric(): boolean {
		return this._retType.isAny && this._argTypes.length === 0 && this._isVariadic;
	}

	argType(index: number): Type | undefined {
		return this._argTypes[index] ?? (this._isVariadic ? this._argTypes[this._argTypes.length - 1] : undefined);
	}

	paramType(index: number): Type | undefined {
		if (!this._isVariadic) {
			return this.argType(index);
		}
		if (!this._argTypes.length) {
			return Type.Any;
		}
		const variadicIndex = this._argTypes.length - 1;
		if (index < variadicIndex) {
			return this.argType(index);
		}
		return this.argType(variadicIndex)?.arrayAtomValType(index - variadicIndex);
	}

	acceptsVariadic(argTypes: readonly Type[]): boolean {
		const index = this.isVariadic ? this.arity - 1 : -1;
		if (index < 0) {
			return true;
		}
		const restType = Type.arrayType(argTypes.slice(index));
		const tail = this.argType(index) ?? Type.Any;
		return tail.accepts(restType);
	}

	equate(signature: FunctionSignature): boolean {
		return this._isVariadic === signature._isVariadic &&
			this._argTypes.length === signature._argTypes.length &&
			this._retType.equals(signature._retType) &&
			this._argTypes.every((type, index) => type.equals(signature._argTypes[index]));
	}

	accept(signature: FunctionSignature): boolean {
		if (this.isGeneric || signature.isGeneric) {
			return true;
		}
		if (this._isVariadic !== signature._isVariadic ||
			this._isVariadic && this.arity !== signature.arity ||
			!this._retType.accepts(signature._retType) ||
			signature.minArity > this.minArity) {
			return false;
		}
		const argc = Math.min(this.arity, signature.arity);
		for (let i = 0; i < argc; ++i) {
			const type = this.argType(i);
			const argType = signature.argType(i);
			if (type && (!argType || !argType.accepts(type))) {
				return false;
			}
		}
		return true;
	}

	intersect(signature: FunctionSignature): boolean {
		if (this.isGeneric || signature.isGeneric) {
			return true;
		}
		if (this._isVariadic !== signature._isVariadic ||
			this._isVariadic && this.arity !== signature.arity ||
			!this._retType.intersects(signature._retType) ||
			this.minArity > signature.maxArity ||
			this.maxArity < signature.minArity) {
			return false;
		}
		const argc = Math.max(this.minArity, signature.minArity);
		for (let i = 0; i < argc; ++i) {
			const type = this.argType(i);
			const argType = signature.argType(i);
			if (!type || !argType || !type.intersects(argType)) {
				return false;
			}
		}
		return true;
	}

	weight(): number {
		return this._argTypes.reduce((acc, type) => acc + type.weight(), this._retType.weight());
	}

	toString(): string {
		if (this.isGeneric) {
			return "{:}";
		}
		const argTypes = this._argTypes.map((type, ix) =>
			this._isVariadic && ix === this.arity - 1 ? `...${type.arrayAtomValType()}` : type.toString()
		).join(",");
		const retType = this._retType.toString();
		return `{(${argTypes}):${retType}}`;
	}

}
