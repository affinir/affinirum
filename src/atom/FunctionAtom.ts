import { IAtom } from "./Atom.js";
import { Type } from "../Type.js";

export class FunctionSignature {

	protected readonly _retType: Type;
	protected readonly _argTypes: readonly Type[];
	protected readonly _minArity: number;
	protected readonly _isVariadic: boolean;

	constructor(
		retType: Type = Type.Unknown,
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

	private get _generic(): boolean {
		return this._retType.isUnknown && this._argTypes.length === 0 && this._isVariadic;
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

	get isVariadic() {
		return this._isVariadic;
	}

	get arity() {
		return this._argTypes.length;
	}

	argType(index: number): Type | undefined {
		return this._argTypes[index] ?? (this._isVariadic ? this._argTypes[this._argTypes.length - 1] : undefined);
	}

	paramType(index: number): Type | undefined {
		if (!this._isVariadic) {
			return this.argType(index);
		}
		if (!this._argTypes.length) {
			return Type.Unknown;
		}
		const variadicIndex = this._argTypes.length - 1;
		if (index < variadicIndex) {
			return this.argType(index);
		}
		return this.argType(variadicIndex)?.arrayAtomValType(index - variadicIndex);
	}

	equate(signature: FunctionSignature): boolean {
		return this._isVariadic === signature._isVariadic
			&& this._argTypes.length === signature._argTypes.length
			&& this._retType.equals(signature._retType)
			&& this._argTypes.every((type, index) => type.equals(signature._argTypes[index]));
	}

	accept(signature: FunctionSignature): boolean {
		if (this._generic || signature._generic) {
			return true;
		}
		if (this._isVariadic !== signature._isVariadic
			|| this._isVariadic && this.arity !== signature.arity
			|| !this._retType.accepts(signature._retType)
			|| signature.minArity > this.minArity) {
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
		if (this._generic || signature._generic) {
			return true;
		}
		if (this._isVariadic !== signature._isVariadic
			|| this._isVariadic && this.arity !== signature.arity
			|| !this._retType.intersects(signature._retType)
			|| this.minArity > signature.maxArity
			|| this.maxArity < signature.minArity) {
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
		if (this._generic) {
			return "function";
		}
		const argTypes = this._argTypes.map((type, ix) =>
			this._isVariadic && ix === this.arity - 1 ? `...${type.arrayAtomValType()}` : type.toString()
		).join(",");
		return `~(${argTypes}):${this._retType}`;
	}

}

export class FunctionAtom implements IAtom {

	protected readonly _signatures: readonly FunctionSignature[];
	protected readonly _isVolatile: boolean;

	constructor(
		signatures: readonly [retType: Type, argTypes: Type[], variadic?: boolean][],
		volatile = false,
	) {
		if (!signatures.length) {
			throw new Error("a function must have at least one signature");
		}
		const unique: FunctionSignature[] = [];
		for (const s of signatures) {
			const signature = new FunctionSignature(...s);
			if (!unique.some((i) => i.equate(signature))) {
				unique.push(signature);
			}
		}
		this._signatures = unique;
		this._isVolatile = volatile;
	}

	get signatures() {
		return this._signatures;
	}

	get isVariadic() {
		return this._signatures.every((signature) => signature.isVariadic);
	}

	get isVolatile() {
		return this._isVolatile;
	}

	equals(atom: IAtom): boolean {
		return atom instanceof FunctionAtom
			&& this._isVolatile === atom._isVolatile
			&& this._signatures.length === atom._signatures.length
			&& this._signatures.every((signature) => atom._signatures.some((i) => signature.equate(i)));
	}

	accepts(atom: IAtom): boolean {
		return atom instanceof FunctionAtom
			&& this._signatures.every((signature) => atom._signatures.some((i) => signature.accept(i)));
	}

	intersects(atom: IAtom): boolean {
		return atom instanceof FunctionAtom
			&& this._signatures.some((signature) => atom._signatures.some((i) => signature.intersect(i)));
	}

	weight(): number {
		return 0x1000000000000 + this._signatures.reduce((acc, signature) => acc + signature.weight(), 0);
	}

	toString(): string {
		return this._signatures.length === 1
			? this._signatures[0].toString()
			: this._signatures.map((signature) => `(${signature})`).join("&");
	}

}
