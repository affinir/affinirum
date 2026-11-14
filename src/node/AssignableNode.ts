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
	abstract compileAssignment(type: Type): AssignableNode;
	abstract resolver(frame: CallFrame): AssignmentResolver;

	reduceAssignmentType(type: Type): Type | undefined {
		const targetType = this.type;
		if (!targetType.accepts(type)) {
			return undefined;
		}
		const compiledType = targetType.reduce(type);
		return compiledType?.accepts(type) ? compiledType : targetType;
	}

}
