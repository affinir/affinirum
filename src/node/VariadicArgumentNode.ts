import { ArrayNode } from "./ArrayNode.js";

export class VariadicArgumentNode extends ArrayNode {

	override get constant(): boolean {
		return this._subnodes.every((node) => node.constant);
	}

}
