"use strict";

const BaseBuildAdapter = require("./base-adapter");

/**
 * Webpack build adapter that wraps the existing Webpack implementation.
 * This adapter delegates all operations to the existing Webpack modules
 * to maintain backward compatibility with existing projects.
 *
 * @extends BaseBuildAdapter
 */
class WebpackAdapter extends BaseBuildAdapter {
  /**
   * Creates a new Webpack adapter instance.
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
   * @returns {string} The name 'Webpack'
   */
  getBuildToolName() {
    return "Webpack";
  }

  /**
   * Validates the Webpack project structure and dependencies.
   * Delegates to the existing lib/validate/index.js module.
   *
   * @param {string} command - The command being executed ('build' or 'serve')
   * @param {string} [cliVersion] - The version of the Catalyst CLI being used
   * @returns {Promise<boolean>} Returns true if validation passes
   * @throws {Error} Throws an error if validation fails
   */
  async validate(command, cliVersion) {
    const validateMod = require("../validate");
    return validateMod(command, this.userDir, cliVersion);
  }

  /**
   * Creates an optimized production build using Webpack.
   * Delegates to the existing lib/build/index.js module.
   *
   * @param {string} packageJsonFile - The absolute path to the package.json file
   * @returns {Promise<string>} Returns the absolute path to the build output directory
   * @throws {Error} Throws an error if the build fails
   */
  async build(packageJsonFile) {
    const buildMod = require("../build");
    return buildMod(this.userDir, packageJsonFile);
  }

  /**
   * Starts the Webpack development server.
   * Delegates to the existing lib/start/index.js module.
   *
   * @param {number} httpPort - The port number for the development server
   * @param {number} masterPort - The master port number for URL construction
   * @param {boolean} watchMode - Whether to enable file watching
   * @returns {Promise<Object>} Returns an object with eventListener and urls
   */
  async start(httpPort, masterPort, watchMode) {
    const startMod = require("../start");
    return startMod(this.userDir, httpPort, masterPort, watchMode);
  }
}

module.exports = WebpackAdapter;
