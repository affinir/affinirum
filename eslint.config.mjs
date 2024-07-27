import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import rules from './eslint.ts.mjs';

export default tseslint.config(
	eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
		languageOptions: {
			parserOptions: {
				project: [ 'tsconfig.json', 'tsconfig.spec.json' ],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		files: [ '**/*.ts' ],
		rules: rules,
	}
);
