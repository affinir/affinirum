import { Node } from "./Node.js";
import { Type } from "../Type.js";
import { Value } from "../Value.js";
import { CallFrame } from "../CallFrame.js";

export abstract class AssignableNode extends Node {

	abstract override compile(type: Type): AssignableNode;
	abstract resolver(frame: CallFrame): (value: Value) => Value;

}
