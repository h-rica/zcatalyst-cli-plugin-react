"use strict";

/**
 * Abstract base class for build tool adapters.
 * All build tool adapters must extend this class and implement its abstract methods.
 *
 * @abstract
 */
class BaseBuildAdapter {
  /**
   * Creates a new build adapter instance.
   *
   * @param {string} userDir - The absolute path to the user's project directory
   * @param {Object} paths - The paths configuration object containing all project paths
   * @param {string} paths.dotenv - Path to .env file
   * @param {string} paths.appPath - Path to application root
   * @param {string} paths.appBuild - Path to build output directory
   * @param {string} paths.appPublic - Path to public assets directory
   * @param {string} paths.appHtml - Path to index.html file
   * @param {string} paths.appIndexJs - Path to application entry point
   * @param {string} paths.appPackageJson - Path to package.json file
   * @param {string} paths.appSrc - Path to source directory
   * @param {string} paths.appTsConfig - Path to tsconfig.json file
   * @param {string} paths.appJsConfig - Path to jsconfig.json file
   * @param {string} paths.appNodeModules - Path to node_modules directory
   * @param {string} paths.publicUrlOrPath - Public URL or path for the application
   * @param {string[]} paths.moduleFileExtensions - Array of supported file extensions
   */
  constructor(userDir, paths) {
    if (new.target === BaseBuildAdapter) {
      throw new TypeError(
        "Cannot construct BaseBuildAdapter instances directly"
      );
    }
    this.userDir = userDir;
    this.paths = paths;
  }

  /**
   * Validates the project structure, dependencies, and configuration.
   * This method should check for:
   * - Required files and directories
   * - Build tool installation
   * - Dependency version compatibility
   * - Configuration file validity
   *
   * @param {string} command - The command being executed ('build' or 'serve')
   * @param {string} [cliVersion] - The version of the Catalyst CLI being used
   * @returns {Promise<boolean>} Returns true if validation passes
   * @throws {Error} Throws an error if validation fails with details about the issue
   * @abstract
   */
  async validate(_command, _cliVersion) {
    throw new Error("validate() must be implemented by subclass");
  }

  /**
   * Creates an optimized production build of the application.
   * This method should:
   * - Load environment variables
   * - Clean the build output directory
   * - Execute the build process
   * - Copy necessary files to the build output
   * - Validate the build output
   *
   * @param {string} packageJsonFile - The absolute path to the package.json file to copy to build output
   * @returns {Promise<string>} Returns the absolute path to the build output directory
   * @throws {Error} Throws an error if the build fails
   * @abstract
   */
  async build(_packageJsonFile) {
    throw new Error("build() must be implemented by subclass");
  }

  /**
   * Starts the development server for the application.
   * This method should:
   * - Load environment variables
   * - Configure the development server
   * - Start the server process
   * - Monitor for startup completion
   * - Handle graceful shutdown
   *
   * @param {number} httpPort - The port number for the development server to listen on
   * @param {number} masterPort - The master port number used by Catalyst CLI for URL construction
   * @param {boolean} watchMode - Whether to enable file watching and hot reload
   * @returns {Promise<Object>} Returns an object containing:
   *   - eventListener: EventEmitter that emits 'start', 'error', and 'close' events
   *   - urls: Object containing localUrlForBrowser, localUrlForTerminal, and lanUrlForTerminal
   * @throws {Error} Throws an error if the server fails to start
   * @abstract
   */
  async start(_httpPort, _masterPort, _watchMode) {
    throw new Error("start() must be implemented by subclass");
  }

  /**
   * Returns the human-readable name of the build tool.
   * Used for logging and error messages.
   *
   * @returns {string} The name of the build tool (e.g., 'Webpack', 'Vite')
   * @abstract
   */
  getBuildToolName() {
    throw new Error("getBuildToolName() must be implemented by subclass");
  }
}

module.exports = BaseBuildAdapter;
