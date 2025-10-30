'use strict';

const WebpackAdapter = require('../lib/adapters/webpack-adapter');

// Mock the existing modules
jest.mock('../lib/validate', () => jest.fn());
jest.mock('../lib/build', () => jest.fn());
jest.mock('../lib/start', () => jest.fn());

const validateMod = require('../lib/validate');
const buildMod = require('../lib/build');
const startMod = require('../lib/start');

describe('WebpackAdapter', () => {
	let adapter;
	let mockUserDir;
	let mockPaths;

	beforeEach(() => {
		mockUserDir = '/mock/webpack-project';
		mockPaths = {
			appPath: mockUserDir,
			appBuild: '/mock/webpack-project/build',
			appPublic: '/mock/webpack-project/public',
			appHtml: '/mock/webpack-project/public/index.html',
			appIndexJs: '/mock/webpack-project/src/index.tsx',
			appPackageJson: '/mock/webpack-project/package.json'
		};
		adapter = new WebpackAdapter(mockUserDir, mockPaths);
		jest.clearAllMocks();
	});

	describe('getBuildToolName()', () => {
		test('should return "Webpack"', () => {
			expect(adapter.getBuildToolName()).toBe('Webpack');
		});
	});

	describe('validate()', () => {
		test('should delegate to existing validate module', async () => {
			validateMod.mockResolvedValue(true);

			const result = await adapter.validate('build', '1.13.2');

			expect(validateMod).toHaveBeenCalledWith('build', mockUserDir, '1.13.2');
			expect(result).toBe(true);
		});

		test('should propagate validation errors', async () => {
			const error = new Error('Validation failed');
			validateMod.mockRejectedValue(error);

			await expect(adapter.validate('build', '1.13.2')).rejects.toThrow(
				'Validation failed'
			);
		});

		test('should work without CLI version', async () => {
			validateMod.mockResolvedValue(true);

			await adapter.validate('build');

			expect(validateMod).toHaveBeenCalledWith('build', mockUserDir, undefined);
		});
	});

	describe('build()', () => {
		test('should delegate to existing build module', async () => {
			const mockBuildPath = '/mock/webpack-project/build';
			buildMod.mockResolvedValue(mockBuildPath);

			const result = await adapter.build('/mock/package.json');

			expect(buildMod).toHaveBeenCalledWith(mockUserDir, '/mock/package.json');
			expect(result).toBe(mockBuildPath);
		});

		test('should propagate build errors', async () => {
			const error = new Error('Build failed');
			buildMod.mockRejectedValue(error);

			await expect(adapter.build('/mock/package.json')).rejects.toThrow(
				'Build failed'
			);
		});
	});

	describe('start()', () => {
		test('should delegate to existing start module', async () => {
			const mockResult = {
				eventListener: { on: jest.fn() },
				urls: { localUrlForBrowser: 'http://localhost:3000' }
			};
			startMod.mockResolvedValue(mockResult);

			const result = await adapter.start(3000, 9000, true);

			expect(startMod).toHaveBeenCalledWith(mockUserDir, 3000, 9000, true);
			expect(result).toBe(mockResult);
		});

		test('should propagate start errors', async () => {
			const error = new Error('Start failed');
			startMod.mockRejectedValue(error);

			await expect(adapter.start(3000, 9000, true)).rejects.toThrow(
				'Start failed'
			);
		});

		test('should work with different port configurations', async () => {
			const mockResult = {
				eventListener: { on: jest.fn() },
				urls: { localUrlForBrowser: 'http://localhost:8080' }
			};
			startMod.mockResolvedValue(mockResult);

			await adapter.start(8080, 9000, false);

			expect(startMod).toHaveBeenCalledWith(mockUserDir, 8080, 9000, false);
		});
	});

	describe('backward compatibility', () => {
		test('should maintain existing API contract', async () => {
			// Validate
			validateMod.mockResolvedValue(true);
			await expect(adapter.validate('build', '1.13.2')).resolves.toBe(true);

			// Build
			buildMod.mockResolvedValue('/build/path');
			await expect(adapter.build('/package.json')).resolves.toBe('/build/path');

			// Start
			const mockStartResult = { eventListener: {}, urls: {} };
			startMod.mockResolvedValue(mockStartResult);
			await expect(adapter.start(3000, 9000, true)).resolves.toBe(mockStartResult);
		});

		test('should not modify or transform arguments', async () => {
			validateMod.mockResolvedValue(true);
			buildMod.mockResolvedValue('/build');
			startMod.mockResolvedValue({});

			const command = 'build';
			const cliVersion = '1.13.2';
			const packageJson = '/path/to/package.json';
			const httpPort = 3000;
			const masterPort = 9000;
			const watchMode = true;

			await adapter.validate(command, cliVersion);
			expect(validateMod).toHaveBeenCalledWith(command, mockUserDir, cliVersion);

			await adapter.build(packageJson);
			expect(buildMod).toHaveBeenCalledWith(mockUserDir, packageJson);

			await adapter.start(httpPort, masterPort, watchMode);
			expect(startMod).toHaveBeenCalledWith(mockUserDir, httpPort, masterPort, watchMode);
		});
	});
});
