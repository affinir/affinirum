import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionVariable } from './ExpressionVariable.js';
import { ExpressionType, ExpressionValue } from './ExpressionType.js';

export class ExpressionStatementNode extends ExpressionNode {

	constructor(
		_pos: number,
		protected _variable: ExpressionVariable,
		protected _subnode: ExpressionNode,
		protected _nextnode: ExpressionNode
	) {
		super( _pos );
	}

	get type(): ExpressionType {
		return this._nextnode.type;
	}

	refine( type: ExpressionType ): ExpressionNode {
		this._subnode = this._subnode.refine( this._variable.type );
		this._nextnode = this._nextnode.refine( type );
		return this;
	}

	evaluate(): ExpressionValue {
		this._variable.value = this._subnode.evaluate();
		return this._nextnode.evaluate();
	}

}
