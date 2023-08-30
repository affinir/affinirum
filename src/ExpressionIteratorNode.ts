import { ExpressionNode } from './ExpressionNode.js';
import { ExpressionConstant } from './ExpressionConstant.js';
import { ExpressionConstantNode } from './ExpressionConstantNode.js';
import { ExpressionValueType, ExpressionType, typeAnyArray } from './ExpressionType.js';
import { ExpressionVariable } from './ExpressionVariable.js';

export class ExpressionIteratorNode extends ExpressionNode {

	constructor(
		protected _pos: number,
		protected _iterator: string,
		protected _variable: ExpressionVariable,
		protected _array: ExpressionNode,
		protected _subnode: ExpressionNode,
	) {
		super( _pos );
	}

	get type(): ExpressionType {
		return this._subnode.type.toArray();
	}

	compile( type: ExpressionType ): ExpressionNode {
		const inferredType = this._subnode.type.toArray().infer( type );
		if ( inferredType.invalid ) {
			throw this;
		}
		return this;
	}

	evaluate(): ExpressionValueType {
		const array = this._array.evaluate() as [];
		return array.map( iterator => {
			this._variable.value = iterator;
			return this._subnode.evaluate();
		} ) as ExpressionValueType;
	}

}
