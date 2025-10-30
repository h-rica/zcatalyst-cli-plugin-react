'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ViteAdapter = require('../lib/adapters/vite-adapter');

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('ViteAdapter', () => {
	let adapter;
	let mockUserDir;
	let mockPaths;

	beforeEach(() => {
		mockUserDir = '/mock/vite-project';
		mockPaths = {
			appPath: mockUserDir,
			appBuild: path.join(mockUserDir, 'build'),
			appPublic: path.join(mockUserDir, 'public'),
			appHtml: path.join(mockUserDir, 'index.html'),
			appIndexJs: path.join(mockUserDir, 'src', 'main.tsx'),
			appPackageJson: path.join(mockUserDir, 'package.json'),
			appSrc: path.join(mockUserDir, 'src'),
			appNodeModules: path.join(mockUserDir, 'node_modules')
		};
		adapter = new ViteAdapter(mockUserDir, mockPaths);
		jest.clearAllMocks();
	});

	describe('getBuildToolName()', () => {
		test('should return "Vite"', () => {
			expect(adapter.getBuildToolName()).toBe('Vite');
		});
	});

	describe('validate()', () => {
		test('should validate successfully with all requirements met', async () => {
			// Mock Vite installation
			fs.existsSync.mockImplementation((filePath) => {
				if (filePath.includes('node_modules/vite')) return true;
				if (filePath.includes('index.html')) return true;
				if (filePath.includes('main.tsx')) return true;
				if (filePath.includes('vite.config.js')) return true;
				return false;
			});

			// Mock package.json with valid React version
			const mockPackageJson = {
				dependencies: {
					react: '^18.0.0',
					'react-dom': '^18.0.0'
				}
			};
			fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

			const result = await adapter.validate('build', '1.13.2');
			expect(result).toBe(true);
		});

		test('should throw error when Vite is not installed', async () => {
			fs.existsSync.mockReturnValue(false);

			await expect(adapter.validate('build', '1.13.2')).rejects.toThrow(
				'Vite is not installed'
			);
		});

		test('should throw error when index.html is missing', async () => {
			fs.existsSync.mockImplementation((filePath) => {
				if (filePath.includes('node_modules/vite')) return true;
				if (filePath.includes('index.html')) return false;
				return true;
			});

			await expect(adapter.validate('build', '1.13.2')).rejects.toThrow(
				'Required file missing: index.html'
			);
		});

		test('should throw error when entry point is missing', async () => {
			fs.existsSync.mockImplementation((filePath) => {
				if (filePath.includes('node_modules/vite')) return true;
				if (filePath.includes('index.html')) return true;
				if (filePath.includes('src/')) return false;
				return true;
			});

			await expect(adapter.validate('build', '1.13.2')).rejects.toThrow(
				'Required file missing: entry point'
			);
		});

		test('should throw error when React version is too old', async () => {
			fs.existsSync.mockReturnValue(true);

			const mockPackageJson = {
				dependencies: {
					react: '^16.8.0', // Too old
					'react-dom': '^16.8.0'
				}
			};
			fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

			await expect(adapter.validate('build', '1.13.2')).rejects.toThrow(
				'React version must be >= 16.10.0'
			);
		});

		test('should throw error when CLI version is too old', async () => {
			fs.existsSync.mockReturnValue(true);

			const mockPackageJson = {
				dependencies: {
					react: '^18.0.0',
					'react-dom': '^18.0.0'
				}
			};
			fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

			await expect(adapter.validate('build', '1.10.0')).rejects.toThrow(
				'Catalyst CLI version must be >= 1.13.2'
			);
		});
	});

	describe('build()', () => {
		test('should spawn Vite build process', async () => {
			const mockSpawn = {
				on: jest.fn((event, callback) => {
					if (event === 'close') {
						setTimeout(() => callback(0), 10);
					}
					return mockSpawn;
				}),
				stdout: {
					on: jest.fn()
				},
				stderr: {
					on: jest.fn()
				}
			};

			spawn.mockReturnValue(mockSpawn);
			fs.existsSync.mockReturnValue(true);
			fs.readdirSync.mockReturnValue(['index.html', 'assets']);
			fs.statSync.mockReturnValue({ isFile: () => true });
			fs.readFileSync.mockReturnValue(Buffer.from('test'));
			fs.copyFileSync = jest.fn();

			const result = await adapter.build('/mock/package.json');

			expect(spawn).toHaveBeenCalledWith(
				'npx',
				['vite', 'build'],
				expect.objectContaining({
					cwd: mockUserDir,
					stdio: 'pipe'
				})
			);
			expect(result).toBe(mockPaths.appBuild);
		});

		test('should throw error when build fails', async () => {
			const mockSpawn = {
				on: jest.fn((event, callback) => {
					if (event === 'close') {
						setTimeout(() => callback(1), 10);
					}
					return mockSpawn;
				}),
				stdout: {
					on: jest.fn()
				},
				stderr: {
					on: jest.fn((event, callback) => {
						if (event === 'data') {
							callback(Buffer.from('Build error'));
						}
					})
				}
			};

			spawn.mockReturnValue(mockSpawn);

			await expect(adapter.build('/mock/package.json')).rejects.toThrow(
				'Vite build failed'
			);
		});
	});

	describe('start()', () => {
		test('should spawn Vite dev server', async () => {
			const mockSpawn = {
				on: jest.fn(),
				stdout: {
					on: jest.fn((event, callback) => {
						if (event === 'data') {
							setTimeout(() => {
								callback(Buffer.from('Local:   http://localhost:3000/'));
							}, 10);
						}
					})
				},
				stderr: {
					on: jest.fn()
				},
				kill: jest.fn()
			};

			spawn.mockReturnValue(mockSpawn);

			const result = await adapter.start(3000, 9000, true);

			expect(spawn).toHaveBeenCalledWith(
				'npx',
				['vite', '--port', '3000', '--host'],
				expect.objectContaining({
					cwd: mockUserDir,
					stdio: 'pipe'
				})
			);
			expect(result).toHaveProperty('eventListener');
			expect(result).toHaveProperty('urls');
		});

		test('should handle dev server startup errors', async () => {
			const mockSpawn = {
				on: jest.fn((event, callback) => {
					if (event === 'error') {
						setTimeout(() => callback(new Error('Spawn error')), 10);
					}
				}),
				stdout: {
					on: jest.fn()
				},
				stderr: {
					on: jest.fn()
				},
				kill: jest.fn()
			};

			spawn.mockReturnValue(mockSpawn);

			await expect(adapter.start(3000, 9000, true)).rejects.toThrow();
		});
	});
});
