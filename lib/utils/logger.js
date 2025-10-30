'use strict';
const { PassThrough } = require('stream');
const chalk = require('react-dev-utils/chalk');

const logStream = new PassThrough();

/**
 * Log levels for severity-based logging
 */
const LogLevel = {
	DEBUG: 'DEBUG',
	INFO: 'INFO',
	WARN: 'WARN',
	ERROR: 'ERROR'
};

/**
 * Current log level (can be set via environment variable)
 */
const currentLogLevel = process.env.REACT_PLUGIN_LOG_LEVEL || LogLevel.INFO;

/**
 * Log level priorities for filtering
 */
const logLevelPriority = {
	[LogLevel.DEBUG]: 0,
	[LogLevel.INFO]: 1,
	[LogLevel.WARN]: 2,
	[LogLevel.ERROR]: 3
};

/**
 * Checks if a message should be logged based on current log level
 * 
 * @param {string} level - The log level of the message
 * @returns {boolean} True if the message should be logged
 */
function shouldLog(level) {
	return logLevelPriority[level] >= logLevelPriority[currentLogLevel];
}

/**
 * Gets the color function for a log level
 * 
 * @param {string} level - The log level
 * @returns {Function} Chalk color function
 */
function getColorForLevel(level) {
	switch (level) {
		case LogLevel.DEBUG:
			return chalk.gray;
		case LogLevel.INFO:
			return chalk.white;
		case LogLevel.WARN:
			return chalk.yellow;
		case LogLevel.ERROR:
			return chalk.red;
		default:
			return chalk.white;
	}
}

/**
 * Basic logger function (maintains backward compatibility)
 * 
 * @param {string} message - The message to log
 */
function logger(message = '') {
	const logStr = `[react-plugin]: ${message}`;
	logStream.push(logStr);
}

/**
 * Enhanced logger with severity levels
 * 
 * @param {string} level - The log level (DEBUG, INFO, WARN, ERROR)
 * @param {string} message - The message to log
 * @param {Object} [context] - Additional context to log
 */
function log(level, message, context = {}) {
	if (!shouldLog(level)) {
		return;
	}
	
	const color = getColorForLevel(level);
	const prefix = `[react-plugin:${level}]`;
	const logStr = color(`${prefix} ${message}`);
	
	logStream.push(logStr);
	
	// Log context if provided and in debug mode
	if (context && Object.keys(context).length > 0 && level === LogLevel.DEBUG) {
		logStream.push(chalk.gray(JSON.stringify(context, null, 2)));
	}
}

/**
 * Convenience methods for different log levels
 */
const debug = (message, context) => log(LogLevel.DEBUG, message, context);
const info = (message, context) => log(LogLevel.INFO, message, context);
const warn = (message, context) => log(LogLevel.WARN, message, context);
const error = (message, context) => log(LogLevel.ERROR, message, context);

module.exports = {
	logger,
	logStream,
	log,
	debug,
	info,
	warn,
	error,
	LogLevel
};
