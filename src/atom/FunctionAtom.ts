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
		let ix = 0;
		while (ix < this._argTypes.length && !this._argTypes[ix].isOptional) {
			++ix;
		}
		this._minArity = ix;
		while (ix < this._argTypes.length && this._argTypes[ix].isOptional) {
			++ix;
		}
		if (ix < this._argTypes.length) {
			throw new Error("a required parameter illegally follows an optional one");
		}
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
			&& this._retType.equate(signature._retType)
			&& this._argTypes.every((type, index) => type.equate(signature._argTypes[index]));
	}

	accept(signature: FunctionSignature): boolean {
		if (this._generic || signature._generic) {
			return true;
		}
		if (this._isVariadic !== signature._isVariadic
			|| this._isVariadic && this.arity !== signature.arity
			|| !this._retType.accept(signature._retType)
			|| this.minArity > signature.maxArity
			|| this.maxArity < signature.minArity) {
			return false;
		}
		const argc = Math.min(this.arity, signature.arity);
		for (let i = 0; i < argc; ++i) {
			const type = this.argType(i)?.toMandatory();
			const argType = signature.argType(i);
			if (type && (!argType || !argType.accept(type))) {
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
			|| !this._retType.intersect(signature._retType)
			|| this.minArity > signature.maxArity
			|| this.maxArity < signature.minArity) {
			return false;
		}
		const argc = Math.max(this.minArity, signature.minArity);
		for (let i = 0; i < argc; ++i) {
			const type = this.argType(i);
			const argType = signature.argType(i);
			if (!type || !argType || !type.intersect(argType)) {
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
		const argTypes = this._argTypes.map((type, ix) => ix === this._argTypes.length - 1 && this._isVariadic ? `...${type}` : type.toString()).join(",");
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

	equate(atom: IAtom): boolean {
		return atom instanceof FunctionAtom
			&& this._isVolatile === atom._isVolatile
			&& this._signatures.length === atom._signatures.length
			&& this._signatures.every((signature) => atom._signatures.some((i) => signature.equate(i)));
	}

	accept(atom: IAtom): boolean {
		return atom instanceof FunctionAtom
			&& this._signatures.every((signature) => atom._signatures.some((i) => signature.accept(i)));
	}

	intersect(atom: IAtom): boolean {
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
