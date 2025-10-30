"use strict";

const fs = require("fs");
const path = require("path");
const log = require("../utils/logger").logger;
const ansi = require("ansi-colors");

/**
 * Build tool types supported by the plugin
 * @typedef {'vite' | 'webpack'} BuildToolType
 */

/**
 * BuildToolDetector identifies which build tool a project uses
 * by examining package.json dependencies and configuration files.
 */
class BuildToolDetector {
  /**
   * @param {string} userDir - The user project directory path
   */
  constructor(userDir) {
    this.userDir = userDir;
    this.packageJson = null;
  }

  /**
   * Detect the build tool used by the project
   * @returns {Promise<BuildToolType>} The detected build tool type
   * @throws {Error} If no supported build tool is detected
   */
  async detect() {
    this.packageJson = await this.readPackageJson();

    // Check for Vite first (priority over Webpack)
    if (this.hasVite()) {
      log(ansi.cyan("Detected build tool: Vite"));
      return "vite";
    }

    // Check for Webpack
    if (this.hasWebpack()) {
      log(ansi.cyan("Detected build tool: Webpack"));
      return "webpack";
    }

    // No supported build tool found
    throw new Error(
      "No supported build tool detected.\n" +
        "Please install one of the following:\n" +
        "  - Vite: npm install vite @vitejs/plugin-react --save-dev\n" +
        "  - Webpack: npm install react-scripts --save-dev\n" +
        "\n" +
        "For more information, visit:\n" +
        "  - Vite: https://vitejs.dev/guide/\n" +
        "  - Create React App: https://create-react-app.dev/"
    );
  }

  /**
   * Check if Vite is present in the project
   * @returns {boolean} True if Vite is detected
   */
  hasVite() {
    const hasViteDependency = this.hasDependency("vite");
    const hasViteConfig =
      this.hasConfigFile("vite.config.js") ||
      this.hasConfigFile("vite.config.ts") ||
      this.hasConfigFile("vite.config.mjs") ||
      this.hasConfigFile("vite.config.mts");

    if (hasViteDependency || hasViteConfig) {
      log(
        ansi.dim(
          `  Vite detected: ${hasViteDependency ? "package.json" : ""} ${
            hasViteConfig ? "config file" : ""
          }`
        )
      );
      return true;
    }

    return false;
  }

  /**
   * Check if Webpack is present in the project
   * @returns {boolean} True if Webpack is detected
   */
  hasWebpack() {
    const hasWebpackDependency = this.hasDependency("webpack");
    const hasReactScripts = this.hasDependency("react-scripts");
    const hasWebpackConfig = this.hasConfigFile("webpack.config.js");

    if (hasWebpackDependency || hasReactScripts || hasWebpackConfig) {
      log(
        ansi.dim(
          `  Webpack detected: ${
            hasReactScripts
              ? "react-scripts"
              : hasWebpackDependency
              ? "webpack"
              : "config file"
          }`
        )
      );
      return true;
    }

    return false;
  }

  /**
   * Check if a dependency exists in package.json
   * @param {string} name - The dependency name
   * @returns {boolean} True if the dependency exists
   */
  hasDependency(name) {
    if (!this.packageJson) {
      return false;
    }

    const deps = this.packageJson.dependencies || {};
    const devDeps = this.packageJson.devDependencies || {};

    return !!(deps[name] || devDeps[name]);
  }

  /**
   * Check if a configuration file exists
   * @param {string} filename - The config file name
   * @returns {boolean} True if the file exists
   */
  hasConfigFile(filename) {
    try {
      const filePath = path.join(this.userDir, filename);
      return fs.existsSync(filePath);
    } catch (err) {
      return false;
    }
  }

  /**
   * Read and parse package.json
   * @returns {Promise<Object>} The parsed package.json
   * @throws {Error} If package.json cannot be read or parsed
   */
  async readPackageJson() {
    try {
      const packageJsonPath = path.join(this.userDir, "package.json");
      const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
      return JSON.parse(packageJsonContent);
    } catch (err) {
      throw new Error(
        `Failed to read package.json in ${this.userDir}: ${err.message}`
      );
    }
  }

  /**
   * Get the detected build tool name for display purposes
   * @param {BuildToolType} buildToolType - The build tool type
   * @returns {string} The display name
   */
  static getBuildToolName(buildToolType) {
    const names = {
      vite: "Vite",
      webpack: "Webpack",
    };
    return names[buildToolType] || buildToolType;
  }
}

module.exports = BuildToolDetector;
