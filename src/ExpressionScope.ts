import { ExpressionVariable } from './ExpressionVariable';

export class ExpressionScope {

	protected _superscope: ExpressionScope | undefined = undefined;
	protected _subscopes: ExpressionScope[] = [];
	protected _variables = new Map<string, ExpressionVariable>();
	protected _definitions = new Set<string>();

	has( name: string ): boolean {
		return this._variables.has( name ) || !!this._superscope?.has( name );
	}

	get( name: string ): ExpressionVariable | undefined {
		return this._variables.get( name ) ?? this._superscope?.get( name );
	}

	set( name: string, variable: ExpressionVariable ): ExpressionScope {
		this._variables.set( name, variable );
		return this;
	}

	define( name: string, variable: ExpressionVariable ): ExpressionScope {
		this._variables.set( name, variable );
		this._definitions.add( name );
		return this;
	}

	subscope( variables: Map<string, ExpressionVariable> ): ExpressionScope {
		const scope = new ExpressionScope();
		scope._superscope = this;
		this._subscopes.push( scope );
		for ( const [ name, variable ] of variables ) {
			scope.define( name, variable );
		}
		return scope;
	}

	variables(): Record<string, ExpressionVariable> {
		const variables: Record<string, ExpressionVariable> = {};
		for ( const [ name, variable ] of this._variables ) {
			if ( !this._definitions.has( name ) ) {
				variables[ name ] = variable;
			}
		}
		this._subscopes.forEach( subscope => Object.assign( variables, subscope.variables() ) );
		return variables;
	}

}
