import { IAtom } from "./Atom.js";
import { Type } from "../Type.js";
import { FunctionSignature } from "./FunctionSignature.js";

export { FunctionSignature };

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

	get isVariadic() {
		return this._signatures.every((signature) => signature.isVariadic);
	}

	get isVolatile() {
		return this._isVolatile;
	}

	signatures(argc: number) {
		return this._signatures.filter((signature) => signature.minArity <= argc && argc <= signature.maxArity);
	}

	retType(): Type {
		return Type.union(...this._signatures.map((signature) => signature.retType));
	}

	argType(index: number): Type | undefined {
		const types = this._signatures.map((signature) => signature.argType(index)).filter((type) => type !== undefined);
		return types.length ? Type.union(...types) : undefined;
	}

	firstArgOptional(): FunctionAtom {
		const signatures = this._signatures.flatMap((signature): [Type, Type[], boolean][] => {
			const retType = signature.retType.toOptional();
			const argTypes = [...signature.argTypes];
			if (signature.isVariadic && signature.arity === 1) {
				return argTypes[0].arrayAtoms().map((array) => {
					const itemType = array.valTypes()[0];
					return [retType, [itemType.toOptional(), Type.arrayType(itemType)], true];
				});
			}
			if (argTypes.length) {
				argTypes[0] = argTypes[0].toOptional();
			}
			return [[retType, argTypes, signature.isVariadic]];
		});
		return new FunctionAtom(signatures, this._isVolatile);
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
