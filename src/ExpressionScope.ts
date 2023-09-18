import { ExpressionVariable } from './ExpressionVariable';

export class ExpressionScope {

	protected _superscope: ExpressionScope | undefined = undefined;
	protected _subscopes: ExpressionScope[] = [];
	protected _variables = new Map<string, ExpressionVariable>();
	protected _statements = new Set<string>();

	get( name: string ): ExpressionVariable | undefined {
		return this._variables.get( name ) ?? this._superscope?.get( name );
	}

	set( name: string, variable: ExpressionVariable, statement?: boolean ): ExpressionScope {
		this._variables.set( name, variable );
		if ( statement ) {
			this._statements.add( name );
		}
		return this;
	}

	subscope( variables: Map<string, ExpressionVariable> ): ExpressionScope {
		const scope = new ExpressionScope();
		scope._superscope = this;
		this._subscopes.push( scope );
		for ( const [ name, variable ] of variables ) {
			scope.set( name, variable, true );
		}
		return scope;
	}

	variables(): Record<string, ExpressionVariable> {
		const variables: Record<string, ExpressionVariable> = {};
		for ( const [ name, variable ] of this._variables ) {
			if ( !this._statements.has( name ) ) {
				variables[ name ] = variable;
			}
		}
		this._subscopes.forEach( subscope => Object.assign( variables, subscope.variables() ) );
		return variables;
	}

}
