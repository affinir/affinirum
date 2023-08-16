import { ExpressionFunction } from './ExpressionFunction.js';
import { ExpressionVariable } from './ExpressionVariable.js';

export class ExpressionNode {

	constructor(
		protected _pos: number,
		protected _obj: ExpressionFunction | ExpressionVariable | boolean | number | string,
		protected _subnodes: ExpressionNode[] | undefined = undefined,
	) {}

	get pos(): number {
		return this._pos;
	}

	get type(): 'boolean' | 'number' | 'string' | undefined {
		return this._obj instanceof ExpressionFunction || this._obj instanceof ExpressionVariable ?
			this._obj.type :
			typeof this._obj as 'boolean' | 'number' | 'string';
	}

	compile(): ExpressionNode | undefined {
		if ( this._obj instanceof ExpressionFunction ) {
			const func = this._obj;
			const subs = this._subnodes!;
			let constant = true;
			for ( let i = 0; i < subs.length; ++i ) {
				const sub = subs[ i ];
				const errnode = sub.compile();
				if ( errnode != null ) {
					return errnode;
				}
				const type = func.getArgType( i );
				if ( type != null ) {
					if ( sub.type != null ) {
						if ( sub.type !== type ) {
							return sub;
						}
					}
					else {
						( sub._obj as ExpressionVariable ).type = type;
					}
				}
				if ( sub._obj instanceof ExpressionFunction || sub._obj instanceof ExpressionVariable ) {
					constant = false;
				}
			}
			if ( constant ) {
				this._obj = func.func( ...subs.map( node => node._obj ) );
			}
		}
		return;
	}

	evaluate(): boolean | number | string {
		if ( this._obj instanceof ExpressionFunction ) {
			return this._obj.func( ...this._subnodes!.map( node => node.evaluate() ) );
		}
		if ( this._obj instanceof ExpressionVariable ) {
			return this._obj.value!;
		}
		return this._obj;
	}

}
