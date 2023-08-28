import { ExpressionValueType, ExpressionType } from './ExpressionType.js';

export interface ExpressionNode {

	pos: number;
	type: ExpressionType;
	compile( types: ExpressionType ): ExpressionNode;
	evaluate(): ExpressionValueType;

}
