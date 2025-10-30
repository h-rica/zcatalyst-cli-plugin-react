module.exports = {
	env: {
		node: true,
		es2021: true
	},
	extends: ['eslint:recommended', 'prettier'],
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module'
	},
	plugins: ['prettier'],
	rules: {
		'prettier/prettier': 'error',
		'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
	}
};
