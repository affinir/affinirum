import { Node } from "./Node.js";
import { Type } from "../Type.js";

export abstract class InvocationNode extends Node {

	protected compileArguments(functionType: Type, args: Node[], compiledCount = 0): Type {
		const functionAtoms = functionType.functionAtoms();
		const argc = args.length;
		const candidates = functionAtoms.flatMap((atom) => atom.signatures)
			.filter((signature) => signature.minArity <= argc && argc <= signature.maxArity);
		let hints = candidates.filter((signature) =>
			args.every((node, index) => node.type.isNever || node.type.intersect(signature.paramType(index) ?? Type.Unknown))
		);
		for (let i = compiledCount; i < argc; ++i) {
			const parameters = (hints.length ? hints : candidates).map((signature) => signature.paramType(i) ?? Type.Unknown);
			const union = Type.union(...parameters);
			// An inferred union must fit a candidate parameter to stay a concrete type.
			const hint = parameters.some((type) => type.accept(union)) ? union : Type.Unknown;
			const node = args[i] = args[i].compile(hint);
			hints = hints.filter((signature) =>
				node.type.isNever || node.type.intersect(signature.paramType(i) ?? Type.Unknown)
			);
		}
		const compiledArgTypes = args.map((node) => node.type);
		const never = functionType.isNever || compiledArgTypes.some((type) => type.isNever);
		const groups = functionAtoms.map((atom) => atom.signatures.filter((signature) => {
			if (!candidates.includes(signature)) {
				return false;
			}
			if (!args.every((node, i) => node.acceptType(signature.paramType(i) ?? Type.Unknown))) {
				return false;
			}
			const index = signature.isVariadic ? signature.arity - 1 : -1;
			if (never || index < 0) {
				return true;
			}
			const restType = Type.arrayType(compiledArgTypes.slice(index));
			const tail = signature.argType(index) ?? Type.Unknown;
			return tail.accept(restType);
		}));
		if (!functionType.isNever && !functionType.isFunction || !never && groups.some((group) => !group.length)) {
			this.throwError(`value of type ${functionType} cannot be called with ${argc} argument(s)`);
		}
		const dynamic = compiledArgTypes.some((type) => type.isUnknown);
		const signatures = groups.flatMap((group) => dynamic ? group : group.slice(0, 1));
		for (let i = 0; i < argc; ++i) {
			const node = args[i];
			const parameterType = Type.union(...signatures.map((signature) => signature.paramType(i) ?? Type.Unknown));
			if (parameterType.accept(node.type)) {
				node.validateType(parameterType);
			}
		}
		return never ? Type.Never : Type.union(...signatures.map((signature) => signature.retType));
	}

}
