import { Node } from "./Node.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";
import { CallFrame } from "../CallFrame.js";

export interface AssignmentResolver {
	readonly type?: Type;
	set: (value: Value) => Value;
	get: () => Value;
}

export abstract class AssignableNode extends Node {

	abstract get assignable(): boolean;
	abstract override compile(hint: Type): Node;
	abstract compileAssignment(type: Type): AssignableNode;
	abstract resolver(frame: CallFrame): AssignmentResolver;

	reduceAssignmentType(type: Type): Type | undefined {
		const target = this.type;
		const hasFunction = target.hasFunction();
		if (hasFunction && !target.accept(type)) {
			return undefined;
		}
		return target.reduce(type) ?? (hasFunction ? target : undefined);
	}

}
