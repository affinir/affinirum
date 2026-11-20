import { Node } from "./Node.js";
import { Type } from "../Type.js";

export abstract class InvocationNode extends Node {

	protected compileArguments(functionType: Type, args: Node[], compiledCount = 0): Type {
		const argc = args.length;
		const candidateGroups = functionType.functionAtoms().map((atom) => atom.signatures(argc));
		const candidates = candidateGroups.flat();
		let hints = candidates.filter((signature) =>
			args.every((node, index) => node.type.isNever || node.type.intersects(signature.paramType(index) ?? Type.Any))
		);
		for (let i = compiledCount; i < argc; ++i) {
			const parameters = (hints.length ? hints : candidates).map((signature) => signature.paramType(i) ?? Type.Any);
			const union = Type.union(...parameters);
			// An inferred union must fit a candidate parameter to stay a concrete type.
			const hint = parameters.some((type) => type.accepts(union)) ? union : Type.Any;
			const node = args[i] = args[i].compile(hint);
			hints = hints.filter((signature) =>
				node.type.isNever || node.type.intersects(signature.paramType(i) ?? Type.Any)
			);
		}
		const compiledArgTypes = args.map((node) => node.type);
		if (functionType.isNever || functionType.isFunction && compiledArgTypes.some((type) => type.isNever)) {
			return Type.Never;
		}
		const groups = candidateGroups.map((group) => group.filter((signature) =>
			args.every((node, i) => node.satisfies(signature.paramType(i) ?? Type.Any)) &&
			signature.acceptsVariadic(compiledArgTypes)
		));
		if (!functionType.isFunction || groups.some((group) => !group.length)) {
			this.throwError(`value of type ${functionType} cannot be called with ${argc} argument(s)`);
		}
		const dynamic = compiledArgTypes.some((type) => type.isAny);
		const signatures = groups.flatMap((group) => dynamic ? group : group.slice(0, 1));
		return Type.union(...signatures.map((signature) => signature.retType));
	}

}
