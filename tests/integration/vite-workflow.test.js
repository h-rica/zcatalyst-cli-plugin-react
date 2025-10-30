'use strict';

const path = require('path');
const fs = require('fs-extra');
const BuildToolDetector = require('../../lib/detector/build-tool-detector');
const ViteAdapter = require('../../lib/adapters/vite-adapter');

describe('Vite Workflow Integration Tests', () => {
	const fixtureDir = path.join(__dirname, '../fixtures/vite-project');
	let detector;
	let adapter;
	let paths;

	beforeAll(() => {
		// Ensure fixture directory exists
		if (!fs.existsSync(fixtureDir)) {
			throw new Error(`Vite fixture not found at ${fixtureDir}`);
		}
	});

	beforeEach(() => {
		detector = new BuildToolDetector(fixtureDir);
		
		// Create paths configuration for the fixture
		paths = {
			dotenv: path.join(fixtureDir, '.env'),
			appPath: fixtureDir,
			appBuild: path.join(fixtureDir, 'build'),
			appPublic: path.join(fixtureDir, 'public'),
			appHtml: path.join(fixtureDir, 'index.html'),
			appIndexJs: path.join(fixtureDir, 'src', 'main.tsx'),
			appPackageJson: path.join(fixtureDir, 'package.json'),
			appSrc: path.join(fixtureDir, 'src'),
			appTsConfig: path.join(fixtureDir, 'tsconfig.json'),
			appJsConfig: path.join(fixtureDir, 'jsconfig.json'),
			appNodeModules: path.join(fixtureDir, 'node_modules'),
			publicUrlOrPath: '/app/',
			moduleFileExtensions: ['tsx', 'ts', 'jsx', 'js', 'json']
		};
		
		adapter = new ViteAdapter(fixtureDir, paths);
	});

	afterEach(async () => {
		// Clean up build directory after each test
		const buildDir = path.join(fixtureDir, 'build');
		if (fs.existsSync(buildDir)) {
			await fs.remove(buildDir);
		}
	});

	describe('Build Tool Detection', () => {
		test('should detect Vite from package.json', () => {
			const buildTool = detector.detect();
			expect(buildTool).toBe('vite');
		});

		test('should detect Vite from vite.config.js', () => {
			const buildTool = detector.detect();
			expect(buildTool).toBe('vite');
			
			const viteConfigPath = path.join(fixtureDir, 'vite.config.js');
			expect(fs.existsSync(viteConfigPath)).toBe(true);
		});

		test('should return detailed build tool information', () => {
			const details = detector.getDetails();
			
			expect(details.buildTool).toBe('vite');
			expect(details.hasConfigFile).toBe(true);
			expect(details.configFilePath).toContain('vite.config.js');
			expect(details.version).toBeDefined();
		});
	});

	describe('Validation', () => {
		test('should validate Vite project structure', async () => {
			// Note: This test requires Vite to be installed in the fixture
			// In a real scenario, you would run npm install in the fixture first
			
			// Check that required files exist
			expect(fs.existsSync(paths.appHtml)).toBe(true);
			expect(fs.existsSync(paths.appIndexJs)).toBe(true);
			expect(fs.existsSync(paths.appPackageJson)).toBe(true);
			expect(fs.existsSync(path.join(fixtureDir, 'vite.config.js'))).toBe(true);
		});

		test('should detect TypeScript support', () => {
			const tsConfigPath = path.join(fixtureDir, 'tsconfig.json');
			expect(fs.existsSync(tsConfigPath)).toBe(true);
			
			const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
			expect(tsConfig.compilerOptions.jsx).toBe('react-jsx');
		});

		test('should verify entry point is TypeScript', () => {
			expect(paths.appIndexJs).toContain('.tsx');
			expect(fs.existsSync(paths.appIndexJs)).toBe(true);
		});
	});

	describe('Project Structure', () => {
		test('should have correct file structure', () => {
			const expectedFiles = [
				'package.json',
				'vite.config.js',
				'index.html',
				'tsconfig.json',
				'src/main.tsx',
				'src/App.tsx',
				'src/index.css'
			];

			expectedFiles.forEach(file => {
				const filePath = path.join(fixtureDir, file);
				expect(fs.existsSync(filePath)).toBe(true);
			});
		});

		test('should have index.html at project root', () => {
			const indexHtmlPath = path.join(fixtureDir, 'index.html');
			expect(fs.existsSync(indexHtmlPath)).toBe(true);
			
			const content = fs.readFileSync(indexHtmlPath, 'utf8');
			expect(content).toContain('<div id="root"></div>');
			expect(content).toContain('src/main.tsx');
		});

		test('should have valid React components', () => {
			const appPath = path.join(fixtureDir, 'src', 'App.tsx');
			const content = fs.readFileSync(appPath, 'utf8');
			
			expect(content).toContain('import React');
			expect(content).toContain('function App()');
			expect(content).toContain('export default App');
		});
	});

	describe('Configuration', () => {
		test('should have valid Vite configuration', () => {
			const viteConfigPath = path.join(fixtureDir, 'vite.config.js');
			const content = fs.readFileSync(viteConfigPath, 'utf8');
			
			expect(content).toContain('defineConfig');
			expect(content).toContain('@vitejs/plugin-react');
			expect(content).toContain('outDir: \'build\'');
		});

		test('should have valid package.json', () => {
			const packageJsonPath = path.join(fixtureDir, 'package.json');
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
			
			expect(packageJson.dependencies).toHaveProperty('react');
			expect(packageJson.dependencies).toHaveProperty('react-dom');
			expect(packageJson.devDependencies).toHaveProperty('vite');
			expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react');
		});
	});

	describe('Adapter Methods', () => {
		test('should return correct build tool name', () => {
			expect(adapter.getBuildToolName()).toBe('Vite');
		});

		test('should have all required adapter methods', () => {
			expect(typeof adapter.validate).toBe('function');
			expect(typeof adapter.build).toBe('function');
			expect(typeof adapter.start).toBe('function');
			expect(typeof adapter.getBuildToolName).toBe('function');
		});
	});
});
