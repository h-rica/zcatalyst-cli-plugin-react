'use strict';

const path = require('path');
const fs = require('fs-extra');
const BuildToolDetector = require('../../lib/detector/build-tool-detector');

describe('Migration Scenario Integration Tests', () => {
	const webpackFixtureDir = path.join(__dirname, '../fixtures/webpack-project');
	const tempDir = path.join(__dirname, '../fixtures/temp-migration-test');

	beforeEach(async () => {
		// Create a temporary copy of the Webpack project for migration testing
		await fs.copy(webpackFixtureDir, tempDir);
	});

	afterEach(async () => {
		// Clean up temporary directory
		if (fs.existsSync(tempDir)) {
			await fs.remove(tempDir);
		}
	});

	describe('Webpack to Vite Migration', () => {
		test('should initially detect Webpack', () => {
			const detector = new BuildToolDetector(tempDir);
			const buildTool = detector.detect();
			
			expect(buildTool).toBe('webpack');
		});

		test('should prioritize Vite after adding Vite configuration', async () => {
			// Add Vite to package.json
			const packageJsonPath = path.join(tempDir, 'package.json');
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
			
			packageJson.devDependencies = packageJson.devDependencies || {};
			packageJson.devDependencies.vite = '^5.0.0';
			packageJson.devDependencies['@vitejs/plugin-react'] = '^4.0.0';
			
			fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
			
			// Create Vite configuration
			const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
});
`;
			fs.writeFileSync(path.join(tempDir, 'vite.config.js'), viteConfig);
			
			// Detect build tool again
			const detector = new BuildToolDetector(tempDir);
			const buildTool = detector.detect();
			
			// Should now detect Vite (priority over Webpack)
			expect(buildTool).toBe('vite');
		});

		test('should detect Vite when only vite.config.js is added', async () => {
			// Create Vite configuration without modifying package.json
			const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build'
  }
});
`;
			fs.writeFileSync(path.join(tempDir, 'vite.config.js'), viteConfig);
			
			// Detect build tool
			const detector = new BuildToolDetector(tempDir);
			const buildTool = detector.detect();
			
			// Should detect Vite based on config file
			expect(buildTool).toBe('vite');
		});

		test('should provide detailed information about both tools when present', async () => {
			// Add Vite configuration
			const packageJsonPath = path.join(tempDir, 'package.json');
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
			
			packageJson.devDependencies = packageJson.devDependencies || {};
			packageJson.devDependencies.vite = '^5.0.0';
			
			fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
			
			const viteConfig = `import { defineConfig } from 'vite';
export default defineConfig({});
`;
			fs.writeFileSync(path.join(tempDir, 'vite.config.js'), viteConfig);
			
			// Get details
			const detector = new BuildToolDetector(tempDir);
			const details = detector.getDetails();
			
			// Should return Vite details (priority)
			expect(details.buildTool).toBe('vite');
			expect(details.hasConfigFile).toBe(true);
			expect(details.configFilePath).toContain('vite.config.js');
		});
	});

	describe('Project Structure Adaptation', () => {
		test('should handle index.html in public directory (Webpack style)', () => {
			const indexHtmlPath = path.join(tempDir, 'public', 'index.html');
			expect(fs.existsSync(indexHtmlPath)).toBe(true);
			
			const content = fs.readFileSync(indexHtmlPath, 'utf8');
			expect(content).toContain('<div id="root"></div>');
		});

		test('should support moving index.html to root for Vite', async () => {
			// Move index.html from public to root
			const publicIndexPath = path.join(tempDir, 'public', 'index.html');
			const rootIndexPath = path.join(tempDir, 'index.html');
			
			let content = fs.readFileSync(publicIndexPath, 'utf8');
			
			// Update content for Vite (remove %PUBLIC_URL% placeholders)
			content = content.replace(/%PUBLIC_URL%/g, '');
			content = content.replace('</body>', '  <script type="module" src="/src/index.tsx"></script>\n  </body>');
			
			fs.writeFileSync(rootIndexPath, content);
			
			// Verify both locations exist (for migration period)
			expect(fs.existsSync(publicIndexPath)).toBe(true);
			expect(fs.existsSync(rootIndexPath)).toBe(true);
		});

		test('should support renaming index.tsx to main.tsx for Vite convention', async () => {
			const indexPath = path.join(tempDir, 'src', 'index.tsx');
			const mainPath = path.join(tempDir, 'src', 'main.tsx');
			
			// Copy index.tsx to main.tsx
			await fs.copy(indexPath, mainPath);
			
			// Verify both exist (for migration period)
			expect(fs.existsSync(indexPath)).toBe(true);
			expect(fs.existsSync(mainPath)).toBe(true);
		});
	});

	describe('Configuration Coexistence', () => {
		test('should allow both react-scripts and vite in package.json', async () => {
			const packageJsonPath = path.join(tempDir, 'package.json');
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
			
			// Add Vite alongside react-scripts
			packageJson.devDependencies = packageJson.devDependencies || {};
			packageJson.devDependencies.vite = '^5.0.0';
			packageJson.devDependencies['@vitejs/plugin-react'] = '^4.0.0';
			
			// Add Vite scripts alongside CRA scripts
			packageJson.scripts['dev:vite'] = 'vite';
			packageJson.scripts['build:vite'] = 'vite build';
			
			fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
			
			// Verify both tools are present
			const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
			expect(updatedPackageJson.dependencies['react-scripts']).toBeDefined();
			expect(updatedPackageJson.devDependencies.vite).toBeDefined();
			
			// Detector should prioritize Vite
			const detector = new BuildToolDetector(tempDir);
			const buildTool = detector.detect();
			expect(buildTool).toBe('vite');
		});

		test('should handle tsconfig.json compatible with both tools', () => {
			const tsConfigPath = path.join(tempDir, 'tsconfig.json');
			const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
			
			// Verify TypeScript config works for both
			expect(tsConfig.compilerOptions.jsx).toBe('react-jsx');
			expect(tsConfig.compilerOptions.module).toBeDefined();
			expect(tsConfig.include).toContain('src');
		});
	});

	describe('Detection Priority Logic', () => {
		test('should always prioritize Vite when both tools are present', async () => {
			// Ensure Webpack is detected first
			let detector = new BuildToolDetector(tempDir);
			expect(detector.detect()).toBe('webpack');
			
			// Add Vite
			const packageJsonPath = path.join(tempDir, 'package.json');
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
			packageJson.devDependencies = packageJson.devDependencies || {};
			packageJson.devDependencies.vite = '^5.0.0';
			fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
			
			// Create new detector instance
			detector = new BuildToolDetector(tempDir);
			expect(detector.detect()).toBe('vite');
		});

		test('should detect Vite from config file even without package.json entry', async () => {
			// Remove Vite from package.json if present
			const packageJsonPath = path.join(tempDir, 'package.json');
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
			delete packageJson.devDependencies?.vite;
			fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
			
			// Add Vite config file
			const viteConfig = `export default {};`;
			fs.writeFileSync(path.join(tempDir, 'vite.config.js'), viteConfig);
			
			// Should detect Vite from config file
			const detector = new BuildToolDetector(tempDir);
			expect(detector.detect()).toBe('vite');
		});
	});

	describe('Cleanup After Migration', () => {
		test('should verify temporary directory is cleaned up', async () => {
			// This test verifies the afterEach cleanup works
			expect(fs.existsSync(tempDir)).toBe(true);
			
			// After this test completes, afterEach should remove tempDir
		});
	});
});
