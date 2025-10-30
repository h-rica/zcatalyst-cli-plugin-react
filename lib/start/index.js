'use strict';

// Modified to use Vite instead of Webpack for Catalyst-Vite compatibility

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.FAST_REFRESH = true;

const { spawn } = require('child_process');
const path = require('path');
const chalk = require('react-dev-utils/chalk');
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const events = require('events');

module.exports = async (userDir, startPort, masterPort, watch) => {
	require('../config/env').loadClientEnv(); // load client env variables
	const paths = require('../config/paths')(userDir);

	const HOST = '0.0.0.0';
	const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
	const appName = require(paths.appPackageJson).name;

	const urls = prepareUrls(protocol, HOST, startPort, paths.publicUrlOrPath.slice(0, -1));
	urls.lanUrlForTerminal = urls.lanUrlForTerminal
		? urls.lanUrlForTerminal.replace(startPort, masterPort) + '/'
		: urls.lanUrlForTerminal;
	urls.localUrlForBrowser = urls.localUrlForBrowser
		? urls.localUrlForBrowser.replace(startPort, masterPort) + '/'
		: urls.localUrlForBrowser;
	urls.localUrlForTerminal = urls.localUrlForTerminal.replace(startPort, masterPort) + '/';

	console.log('\n🔧 Catalyst-Vite Compatibility Layer');
	console.log('📦 Starting Vite development server');
	console.log('⚡ Using Vite instead of Webpack\n');
	console.log(chalk.cyan('Starting the development server...\n'));

	// Start Vite process using npx to ensure it's found
	const viteBin = path.join(userDir, 'node_modules', '.bin', 'vite');
	const viteProcess = spawn(viteBin, [], {
		stdio: 'inherit',
		shell: true,
		cwd: userDir,
		env: {
			...process.env,
			PORT: startPort.toString(),
			HOST: HOST
		}
	});

	const eventListener = new events.EventEmitter();

	// Handle Vite process events
	viteProcess.on('error', (err) => {
		console.error('\n❌ Failed to start Vite process');
		console.error('Error:', err.message);
		
		if (err.code === 'ENOENT') {
			console.error('\n💡 Vite may not be installed. Try running:');
			console.error('   npm install\n');
		}
		
		eventListener.emit('error', err);
	});

	viteProcess.on('exit', (code) => {
		if (code !== 0 && code !== null) {
			console.error(`\n❌ Vite process exited with code ${code}`);
		}
	});

	// Emit start event after a short delay to allow Vite to initialize
	setTimeout(() => {
		eventListener.emit('start');
	}, 2000);

	eventListener.on('close', () => {
		viteProcess.kill();
	});

	if (process.env.CI !== 'true') {
		// Gracefully exit when stdin ends
		process.stdin.on('end', () => {
			viteProcess.kill();
		});
	}

	return {
		eventListener: eventListener,
		urls
	};
};
