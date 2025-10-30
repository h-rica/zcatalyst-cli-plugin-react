'use strict';

const path = require('path');
const BuildToolDetector = require('./detector/build-tool-detector');
const WebpackAdapter = require('./adapters/webpack-adapter');
const ViteAdapter = require('./adapters/vite-adapter');
const log = require('./utils/logger').logger;
const chalk = require('react-dev-utils/chalk');

// Store adapter instance for reuse across validate, build, and start
let adapterInstance = null;
let detectedBuildTool = null;

function addNodePath(sourceDir) {
	const modDir = path.join(sourceDir, 'node_modules');
	process.env.NODE_PATH = process.env.NODE_PATH
		? [process.env.NODE_PATH, modDir].join(path.delimiter)
		: modDir;
}

/**
 * Creates an adapter instance based on the detected build tool
 * @param {string} buildTool - The detected build tool ('webpack' or 'vite')
 * @param {string} userDir - The user's project directory
 * @param {Object} paths - The paths configuration object
 * @returns {BaseBuildAdapter} The appropriate adapter instance
 */
function createAdapter(buildTool, userDir, paths) {
	if (buildTool === 'vite') {
		return new ViteAdapter(userDir, paths);
	} else {
		return new WebpackAdapter(userDir, paths);
	}
}

async function validate(command, sourceDir, runtime) {
	addNodePath(sourceDir);
	
	// Detect build tool
	const detector = new BuildToolDetector(sourceDir);
	detectedBuildTool = detector.detect();
	
	log(chalk.cyan(`Detected build tool: ${chalk.bold(detectedBuildTool)}`));
	
	// Get paths configuration
	const paths = require('./config/paths')(sourceDir);
	
	// Create appropriate adapter
	adapterInstance = createAdapter(detectedBuildTool, sourceDir, paths);
	
	// Validate using the adapter
	const cliVersion = runtime.get('cli.package.version', undefined);
	return adapterInstance.validate(command, cliVersion);
}

async function build(sourceDir, runtime) {
	addNodePath(sourceDir);
	
	// If adapter wasn't created during validation, create it now
	if (!adapterInstance) {
		const detector = new BuildToolDetector(sourceDir);
		detectedBuildTool = detector.detect();
		const paths = require('./config/paths')(sourceDir);
		adapterInstance = createAdapter(detectedBuildTool, sourceDir, paths);
	}
	
	const packageJsonFile = runtime.get('context.client.package_json');
	
	try {
		return await adapterInstance.build(packageJsonFile);
	} catch (err) {
		log(chalk.red('Build failed:'));
		log(err.message || err);
		throw err;
	}
}

async function start(targetDetails, masterPort) {
	addNodePath(targetDetails.target.source);
	
	// If adapter wasn't created during validation, create it now
	if (!adapterInstance) {
		const detector = new BuildToolDetector(targetDetails.target.source);
		detectedBuildTool = detector.detect();
		const paths = require('./config/paths')(targetDetails.target.source);
		adapterInstance = createAdapter(detectedBuildTool, targetDetails.target.source, paths);
	}
	
	const openBrowser = require('react-dev-utils/openBrowser');
	
	try {
		const { eventListener, urls } = await adapterInstance.start(
			targetDetails.httpPort,
			masterPort,
			targetDetails.target.opts.watch
		);
		
		eventListener.once(
			'start',
			() =>
				targetDetails.target.opts.open &&
				urls.localUrlForBrowser &&
				openBrowser(urls.localUrlForBrowser)
		);
		
		return eventListener;
	} catch (err) {
		log(chalk.red('Failed to start development server:'));
		log(err.message || err);
		throw err;
	}
}

async function logs() {
	return require('./utils/logger').logStream;
}

module.exports = {
	start,
	validate,
	build,
	logs
};
