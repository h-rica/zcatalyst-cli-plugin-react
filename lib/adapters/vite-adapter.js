'use strict';

const BaseBuildAdapter = require('./base-adapter');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const events = require('events');
const semver = require('semver');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const chalk = require('react-dev-utils/chalk');
const log = require('../utils/logger').logger;
const packageJson = require('../../package.json');
const ansi = require('ansi-colors');

/**
 * Vite build adapter that implements support for Vite-based React projects.
 * This adapter provides validation, build, and development server functionality
 * specifically tailored for Vite projects.
 * 
 * @extends BaseBuildAdapter
 */
class ViteAdapter extends BaseBuildAdapter {
	/**
	 * Creates a new Vite adapter instance.
	 * 
	 * @param {string} userDir - The absolute path to the user's project directory
	 * @param {Object} paths - The paths configuration object containing all project paths
	 */
	constructor(userDir, paths) {
		super(userDir, paths);
	}

	/**
	 * Returns the build tool name for logging purposes.
	 * 
	 * @returns {string} The name 'Vite'
	 */
	getBuildToolName() {
		return 'Vite';
	}

	/**
	 * Validates the Vite project structure and dependencies.
	 * Checks for:
	 * - Vite installation in node_modules
	 * - Required files (index.html, entry point)
	 * - React version compatibility (>= 16.10.0)
	 * - CLI version compatibility
	 * - Vite configuration file
	 * 
	 * @param {string} command - The command being executed ('build' or 'serve')
	 * @param {string} [cliVersion] - The version of the Catalyst CLI being used
	 * @returns {Promise<boolean>} Returns true if validation passes
	 * @throws {Error} Throws an error if validation fails
	 */
	async validate(command, cliVersion) {
		// Check for Vite installation
		const vitePath = path.join(this.paths.appNodeModules, 'vite');
		if (!fs.existsSync(vitePath)) {
			throw new Error(
				'Vite is not installed in node_modules. ' +
				'Please run: npm install vite --save-dev'
			);
		}

		// Check for vite.config.js or vite.config.ts
		const viteConfigJs = path.join(this.userDir, 'vite.config.js');
		const viteConfigTs = path.join(this.userDir, 'vite.config.ts');
		const hasViteConfig = fs.existsSync(viteConfigJs) || fs.existsSync(viteConfigTs);
		
		if (hasViteConfig) {
			log(`Detected Vite configuration file`);
		}

		// Check for required files - try multiple possible locations for index.html
		const possibleHtmlPaths = [
			path.join(this.userDir, 'index.html'),
			path.join(this.userDir, 'public', 'index.html'),
			this.paths.appHtml
		];
		
		const htmlPath = possibleHtmlPaths.find(p => fs.existsSync(p));
		if (!htmlPath) {
			throw new Error(
				'Required file missing: index.html\n' +
				'Expected location: project root or public/ directory'
			);
		}

		// Check for entry point - try multiple possible entry points
		const possibleEntryPoints = [
			path.join(this.userDir, 'src', 'main.tsx'),
			path.join(this.userDir, 'src', 'main.jsx'),
			path.join(this.userDir, 'src', 'index.tsx'),
			path.join(this.userDir, 'src', 'index.jsx'),
			this.paths.appIndexJs
		];
		
		const entryPoint = possibleEntryPoints.find(p => fs.existsSync(p));
		if (!entryPoint) {
			throw new Error(
				'Required file missing: entry point\n' +
				'Expected location: src/main.tsx, src/main.jsx, src/index.tsx, or src/index.jsx'
			);
		}

		// Check React version
		let react;
		try {
			react = require(require.resolve('react', { paths: [this.paths.appPath] }));
		} catch (e) {
			throw new Error('react module missing in ' + this.paths.appPath);
		}

		if (command === 'serve' && semver.lt(react.version, '16.10.0')) {
			throw new Error(
				`Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
			);
		}

		// Check CLI version compatibility
		if (cliVersion && !semver.satisfies(cliVersion, packageJson.compatibility['zcatalyst-cli'])) {
			log(ansi.bold.yellow('Warning: React Plugin may not work properly!'));
			log(
				ansi.yellow(
					`This version of ZCATALYST-CLI(${cliVersion}) is not compatible with the version of ZCATALYST-CLI-PLUGIN-REACT being used.`
				)
			);
			log(
				ansi.yellow('Compatible version(s): ZCATALYST-CLI: ') +
					ansi.green(packageJson.compatibility['zcatalyst-cli'])
			);
		}

		return true;
	}

	/**
	 * Creates an optimized production build using Vite.
	 * - Loads environment variables from .env files
	 * - Cleans build output directory
	 * - Spawns Vite build process with proper environment
	 * - Monitors build process for errors
	 * - Validates build output (dist/build directory, index.html)
	 * - Copies package.json to build output
	 * - Returns build output path
	 * 
	 * @param {string} packageJsonFile - The absolute path to the package.json file
	 * @returns {Promise<string>} Returns the absolute path to the build output directory
	 * @throws {Error} Throws an error if the build fails
	 */
	async build(packageJsonFile) {
		// Load environment variables
		require('../config/env').loadClientEnv();

		log('Creating an optimized production build with Vite...');

		// Clean build output directory
		await fs.emptyDir(this.paths.appBuild);

		// Copy public folder if it exists (excluding index.html)
		if (fs.existsSync(this.paths.appPublic)) {
			await fs.copy(this.paths.appPublic, this.paths.appBuild, {
				dereference: true,
				filter: (file) => {
					// Exclude index.html as Vite will generate it
					const htmlPaths = [
						this.paths.appHtml,
						path.join(this.paths.appPublic, 'index.html')
					];
					return !htmlPaths.includes(file);
				}
			});
		}

		// Execute Vite build
		const viteBin = path.join(this.paths.appNodeModules, '.bin', 'vite');
		const viteBinCmd = process.platform === 'win32' ? `${viteBin}.cmd` : viteBin;

		return new Promise((resolve, reject) => {
			const buildProcess = spawn(viteBinCmd, ['build'], {
				cwd: this.userDir,
				stdio: 'inherit',
				shell: true,
				env: {
					...process.env,
					NODE_ENV: 'production'
				}
			});

			buildProcess.on('error', (err) => {
				if (err.code === 'ENOENT') {
					reject(new Error(
						'Vite executable not found. ' +
						'Please ensure Vite is installed: npm install vite --save-dev'
					));
				} else {
					reject(new Error(`Vite build failed: ${err.message}`));
				}
			});

			buildProcess.on('exit', async (code) => {
				if (code !== 0) {
					reject(new Error(`Vite build exited with code ${code}`));
					return;
				}

				try {
					// Validate build output directory exists
					if (!fs.existsSync(this.paths.appBuild)) {
						throw new Error(
							`Build output directory not found: ${this.paths.appBuild}\n` +
							'Vite may be configured to output to a different directory.'
						);
					}

					// Validate index.html exists in build output
					const indexHtml = path.join(this.paths.appBuild, 'index.html');
					if (!fs.existsSync(indexHtml)) {
						throw new Error(
							'index.html not found in build output.\n' +
							'The build may have failed or Vite configuration may be incorrect.'
						);
					}

					// Copy package.json to build output
					await fs.copyFile(
						packageJsonFile,
						path.join(this.paths.appBuild, 'package.json')
					);

					log(chalk.green('Compiled successfully.\n'));
					log(`Build output: ${this.paths.appBuild}`);
					
					resolve(this.paths.appBuild);
				} catch (err) {
					reject(err);
				}
			});
		});
	}

	/**
	 * Starts the Vite development server.
	 * - Loads environment variables
	 * - Configures Vite dev server with specified port and host
	 * - Spawns Vite dev server process
	 * - Monitors process startup and emits start event
	 * - Prepares URLs with master port replacement
	 * - Handles process cleanup on close signal
	 * - Supports graceful shutdown
	 * 
	 * @param {number} httpPort - The port number for the development server
	 * @param {number} masterPort - The master port number for URL construction
	 * @param {boolean} watchMode - Whether to enable file watching
	 * @returns {Promise<Object>} Returns an object with eventListener and urls
	 */
	async start(httpPort, masterPort, watchMode) {
		// Load environment variables
		require('../config/env').loadClientEnv();

		const HOST = '0.0.0.0';
		const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';

		// Prepare URLs using react-dev-utils
		const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
		const urls = prepareUrls(
			protocol,
			HOST,
			httpPort,
			this.paths.publicUrlOrPath.slice(0, -1)
		);

		// Adjust URLs to use master port for external access
		if (urls.lanUrlForTerminal) {
			urls.lanUrlForTerminal = urls.lanUrlForTerminal.replace(
				`:${httpPort}`,
				`:${masterPort}`
			);
			if (!urls.lanUrlForTerminal.endsWith('/')) {
				urls.lanUrlForTerminal += '/';
			}
		}
		
		if (urls.localUrlForBrowser) {
			urls.localUrlForBrowser = urls.localUrlForBrowser.replace(
				`:${httpPort}`,
				`:${masterPort}`
			);
			if (!urls.localUrlForBrowser.endsWith('/')) {
				urls.localUrlForBrowser += '/';
			}
		}
		
		urls.localUrlForTerminal = urls.localUrlForTerminal.replace(
			`:${httpPort}`,
			`:${masterPort}`
		);
		if (!urls.localUrlForTerminal.endsWith('/')) {
			urls.localUrlForTerminal += '/';
		}

		log(chalk.cyan('Starting Vite development server...\n'));

		// Start Vite dev server
		const viteBin = path.join(this.paths.appNodeModules, '.bin', 'vite');
		const viteBinCmd = process.platform === 'win32' ? `${viteBin}.cmd` : viteBin;

		const viteProcess = spawn(viteBinCmd, [], {
			cwd: this.userDir,
			stdio: 'inherit',
			shell: true,
			env: {
				...process.env,
				PORT: httpPort.toString(),
				HOST: HOST,
				NODE_ENV: 'development'
			}
		});

		const eventListener = new events.EventEmitter();

		viteProcess.on('error', (err) => {
			if (err.code === 'ENOENT') {
				log(chalk.red('Failed to start Vite: Vite executable not found'));
				log(chalk.yellow('Vite may not be installed. Run: npm install vite --save-dev'));
			} else {
				log(chalk.red(`Failed to start Vite: ${err.message}`));
			}
			eventListener.emit('error', err);
		});

		viteProcess.on('exit', (code) => {
			if (code !== 0 && code !== null) {
				log(chalk.red(`Vite development server exited with code ${code}`));
			}
		});

		// Emit start event after Vite initializes
		// Vite typically starts quickly, so we wait a short period
		setTimeout(() => {
			eventListener.emit('start');
		}, 2000);

		// Handle close signal for graceful shutdown
		eventListener.on('close', () => {
			viteProcess.kill();
		});

		// Graceful shutdown on stdin end (non-CI environments)
		if (process.env.CI !== 'true') {
			process.stdin.on('end', () => {
				viteProcess.kill();
			});
		}

		return {
			eventListener,
			urls
		};
	}
}

module.exports = ViteAdapter;
