"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Detects which build tool (Vite or Webpack) a project is using.
 * Implements priority logic where Vite is preferred over Webpack when both are present.
 */
class BuildToolDetector {
  /**
   * Creates a new BuildToolDetector instance
   *
   * @param {string} userDir - The absolute path to the user's project directory
   */
  constructor(userDir) {
    this.userDir = userDir;
    this.packageJsonPath = path.join(userDir, "package.json");
  }

  /**
   * Detects the build tool being used in the project
   * Priority: Vite > Webpack
   *
   * @returns {string} The detected build tool ('vite' or 'webpack')
   * @throws {Error} If no supported build tool is detected
   */
  detect() {
    // Check for package.json
    if (!fs.existsSync(this.packageJsonPath)) {
      throw new Error(
        `package.json not found in ${this.userDir}\n` +
          "Please ensure you are in a valid Node.js project directory."
      );
    }

    const packageJson = this._readPackageJson();
    const allDeps = this._getAllDependencies(packageJson);

    // Check for Vite (highest priority)
    const hasVite = "vite" in allDeps;
    const hasViteConfig = this._hasViteConfig();

    // Check for Webpack
    const hasWebpack = "webpack" in allDeps || "react-scripts" in allDeps;
    const hasWebpackConfig = this._hasWebpackConfig();

    // Priority logic: Vite > Webpack
    if (hasVite || hasViteConfig) {
      return "vite";
    }

    if (hasWebpack || hasWebpackConfig) {
      return "webpack";
    }

    // No supported build tool found
    throw new Error(
      "No supported build tool detected.\n" +
        "Supported build tools: Vite, Webpack (via react-scripts or direct installation)\n" +
        "Please install one of the following:\n" +
        "  - Vite: npm install vite @vitejs/plugin-react --save-dev\n" +
        "  - Webpack: npm install react-scripts --save-dev"
    );
  }

  /**
   * Reads and parses the package.json file
   *
   * @returns {Object} The parsed package.json content
   * @private
   */
  _readPackageJson() {
    try {
      const content = fs.readFileSync(this.packageJsonPath, "utf8");
      return JSON.parse(content);
    } catch (err) {
      throw new Error(`Failed to read or parse package.json: ${err.message}`);
    }
  }

  /**
   * Gets all dependencies from package.json (dependencies + devDependencies)
   *
   * @param {Object} packageJson - The parsed package.json object
   * @returns {Object} Combined dependencies object
   * @private
   */
  _getAllDependencies(packageJson) {
    return {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };
  }

  /**
   * Checks if a Vite configuration file exists
   *
   * @returns {boolean} True if vite.config.js or vite.config.ts exists
   * @private
   */
  _hasViteConfig() {
    const viteConfigJs = path.join(this.userDir, "vite.config.js");
    const viteConfigTs = path.join(this.userDir, "vite.config.ts");
    const viteConfigMjs = path.join(this.userDir, "vite.config.mjs");

    return (
      fs.existsSync(viteConfigJs) ||
      fs.existsSync(viteConfigTs) ||
      fs.existsSync(viteConfigMjs)
    );
  }

  /**
   * Checks if a Webpack configuration file exists
   *
   * @returns {boolean} True if webpack.config.js exists
   * @private
   */
  _hasWebpackConfig() {
    const webpackConfigJs = path.join(this.userDir, "webpack.config.js");
    return fs.existsSync(webpackConfigJs);
  }

  /**
   * Gets detailed information about the detected build tool
   *
   * @returns {Object} Object containing build tool details
   */
  getDetails() {
    const buildTool = this.detect();
    const packageJson = this._readPackageJson();
    const allDeps = this._getAllDependencies(packageJson);

    const details = {
      buildTool,
      hasConfigFile: false,
      configFilePath: null,
      version: null,
    };

    if (buildTool === "vite") {
      details.version = allDeps.vite || null;
      details.hasConfigFile = this._hasViteConfig();

      if (details.hasConfigFile) {
        const possibleConfigs = [
          "vite.config.js",
          "vite.config.ts",
          "vite.config.mjs",
        ];

        for (const config of possibleConfigs) {
          const configPath = path.join(this.userDir, config);
          if (fs.existsSync(configPath)) {
            details.configFilePath = configPath;
            break;
          }
        }
      }
    } else if (buildTool === "webpack") {
      details.version = allDeps.webpack || allDeps["react-scripts"] || null;
      details.hasConfigFile = this._hasWebpackConfig();

      if (details.hasConfigFile) {
        details.configFilePath = path.join(this.userDir, "webpack.config.js");
      }
    }

    return details;
  }
}

module.exports = BuildToolDetector;
