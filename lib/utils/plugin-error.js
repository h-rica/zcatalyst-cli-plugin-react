'use strict';

const chalk = require('react-dev-utils/chalk');

/**
 * Error categories for plugin errors
 */
const ErrorCategory = {
	VALIDATION: 'VALIDATION',
	BUILD: 'BUILD',
	DEV_SERVER: 'DEV_SERVER',
	CONFIGURATION: 'CONFIGURATION',
	DEPENDENCY: 'DEPENDENCY'
};

/**
 * Custom error class for plugin-specific errors with enhanced formatting
 * and suggestions for resolution.
 */
class PluginError extends Error {
	/**
	 * Creates a new PluginError instance
	 * 
	 * @param {string} message - The error message
	 * @param {string} category - The error category (from ErrorCategory)
	 * @param {Object} [details] - Additional error details
	 * @param {string} [details.suggestion] - Suggested fix for the error
	 * @param {string} [details.buildTool] - The build tool being used
	 * @param {Error} [details.originalError] - The original error if wrapping
	 */
	constructor(message, category, details = {}) {
		super(message);
		this.name = 'PluginError';
		this.category = category;
		this.details = details;
		
		// Capture stack trace
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, PluginError);
		}
	}

	/**
	 * Formats the error message with ANSI colors and suggestions
	 * 
	 * @returns {string} Formatted error message
	 */
	format() {
		const lines = [];
		
		// Category header with color
		const categoryColor = this._getCategoryColor();
		lines.push(chalk.bold(categoryColor(`[${this.category}]`)) + ' ' + chalk.red(this.message));
		
		// Build tool context if available
		if (this.details.buildTool) {
			lines.push(chalk.dim(`Build tool: ${this.details.buildTool}`));
		}
		
		// Suggestion if available
		if (this.details.suggestion) {
			lines.push('');
			lines.push(chalk.yellow('Suggestion:'));
			lines.push(chalk.yellow('  ' + this.details.suggestion));
		}
		
		// Original error if available
		if (this.details.originalError) {
			lines.push('');
			lines.push(chalk.dim('Original error:'));
			lines.push(chalk.dim('  ' + this.details.originalError.message));
		}
		
		return lines.join('\n');
	}

	/**
	 * Gets the appropriate color for the error category
	 * 
	 * @returns {Function} Chalk color function
	 * @private
	 */
	_getCategoryColor() {
		switch (this.category) {
			case ErrorCategory.VALIDATION:
				return chalk.magenta;
			case ErrorCategory.BUILD:
				return chalk.red;
			case ErrorCategory.DEV_SERVER:
				return chalk.cyan;
			case ErrorCategory.CONFIGURATION:
				return chalk.yellow;
			case ErrorCategory.DEPENDENCY:
				return chalk.blue;
			default:
				return chalk.white;
		}
	}
}

module.exports = {
	PluginError,
	ErrorCategory
};
