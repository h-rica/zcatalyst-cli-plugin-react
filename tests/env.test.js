'use strict';

const { getClientEnvironment } = require('../lib/config/env');

describe('Environment Variable Handling', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		// Reset process.env before each test
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	describe('getClientEnvironment()', () => {
		test('should filter REACT_APP_ variables for webpack', () => {
			process.env.REACT_APP_API_URL = 'https://api.example.com';
			process.env.REACT_APP_ENV = 'production';
			process.env.VITE_API_URL = 'https://vite.example.com';
			process.env.OTHER_VAR = 'should-not-appear';

			const env = getClientEnvironment('/', 'webpack');

			expect(env.raw.REACT_APP_API_URL).toBe('https://api.example.com');
			expect(env.raw.REACT_APP_ENV).toBe('production');
			expect(env.raw.VITE_API_URL).toBeUndefined();
			expect(env.raw.OTHER_VAR).toBeUndefined();
		});

		test('should filter VITE_ variables for vite', () => {
			process.env.REACT_APP_API_URL = 'https://api.example.com';
			process.env.VITE_API_URL = 'https://vite.example.com';
			process.env.VITE_ENV = 'production';
			process.env.OTHER_VAR = 'should-not-appear';

			const env = getClientEnvironment('/', 'vite');

			expect(env.raw.VITE_API_URL).toBe('https://vite.example.com');
			expect(env.raw.VITE_ENV).toBe('production');
			expect(env.raw.REACT_APP_API_URL).toBeUndefined();
			expect(env.raw.OTHER_VAR).toBeUndefined();
		});

		test('should default to webpack behavior when buildTool not specified', () => {
			process.env.REACT_APP_TEST = 'test-value';
			process.env.VITE_TEST = 'vite-value';

			const env = getClientEnvironment('/');

			expect(env.raw.REACT_APP_TEST).toBe('test-value');
			expect(env.raw.VITE_TEST).toBeUndefined();
		});

		test('should include NODE_ENV and PUBLIC_URL', () => {
			process.env.NODE_ENV = 'production';
			process.env.REACT_APP_TEST = 'test';

			const env = getClientEnvironment('/app', 'webpack');

			expect(env.raw.NODE_ENV).toBe('production');
			expect(env.raw.PUBLIC_URL).toBe('/app');
		});

		test('should stringify environment variables', () => {
			process.env.REACT_APP_TEST = 'test-value';

			const env = getClientEnvironment('/', 'webpack');

			expect(env.stringified['process.env'].REACT_APP_TEST).toBe('"test-value"');
			expect(env.stringified['process.env'].NODE_ENV).toBeDefined();
		});
	});
});
