# Build Tool Detection

The Catalyst React plugin automatically detects whether your project uses Vite or Webpack as its build tool.

## Overview

The plugin includes a `BuildToolDetector` module that examines your project's `package.json` and configuration files to determine which build tool to use. This allows the plugin to support both modern Vite-based projects and traditional Webpack/Create React App projects.

## Detection Logic

The detector uses the following priority order:

### 1. Vite Detection (Highest Priority)

The plugin detects Vite if any of the following are present:
- `vite` in package.json dependencies or devDependencies
- `vite.config.js` configuration file
- `vite.config.ts` configuration file
- `vite.config.mjs` configuration file
- `vite.config.mts` configuration file

### 2. Webpack Detection

The plugin detects Webpack if any of the following are present:
- `webpack` in package.json dependencies or devDependencies
- `react-scripts` in package.json (Create React App)
- `webpack.config.js` configuration file

### 3. No Build Tool Found

If neither Vite nor Webpack is detected, the plugin will throw an error with installation instructions.

## Priority Rules

**When both Vite and Webpack are detected, Vite takes priority.**

This design decision supports gradual migration scenarios where a project might have both build tools during a transition period. The plugin will automatically use Vite in these cases.

## Error Handling

If no supported build tool is detected, the plugin provides a helpful error message that includes:
- List of supported build tools
- Installation commands for each tool
- Links to official documentation

Example error message:
```
No supported build tool detected.
Please install one of the following:
  - Vite: npm install vite @vitejs/plugin-react --save-dev
  - Webpack: npm install react-scripts --save-dev

For more information, visit:
  - Vite: https://vitejs.dev/guide/
  - Create React App: https://create-react-app.dev/
```

## Usage in Plugin Code

The detector is used internally by the plugin during the validation phase:

```javascript
const BuildToolDetector = require('./detector');

// Detect build tool
const detector = new BuildToolDetector(projectPath);
const buildTool = await detector.detect(); // Returns 'vite' or 'webpack'

// Get display name
const displayName = BuildToolDetector.getBuildToolName(buildTool); // 'Vite' or 'Webpack'
```

## Logging

The detector logs its findings for debugging purposes:
```
[react-plugin]: Detected build tool: Vite
  Vite detected: package.json config file
```

## API Reference

### `BuildToolDetector`

#### Constructor
```javascript
new BuildToolDetector(userDir: string)
```
Creates a new detector instance for the specified project directory.

#### Methods

##### `detect(): Promise<'vite' | 'webpack'>`
Detects and returns the build tool type. Throws an error if no supported build tool is found.

##### `hasVite(): boolean`
Checks if Vite is present in the project.

##### `hasWebpack(): boolean`
Checks if Webpack is present in the project.

##### `hasDependency(name: string): boolean`
Checks if a specific dependency exists in package.json.

##### `hasConfigFile(filename: string): boolean`
Checks if a configuration file exists in the project directory.

#### Static Methods

##### `BuildToolDetector.getBuildToolName(buildToolType: string): string`
Returns a human-readable display name for a build tool type.

## Supported Build Tools

### Vite
- **Version Support:** Vite 3.x and above
- **Configuration Files:** vite.config.js, vite.config.ts, vite.config.mjs, vite.config.mts
- **Package Name:** `vite`
- **Typical Setup:** Modern React projects, especially those created with `npm create vite@latest`

### Webpack
- **Version Support:** Webpack 5.x (via react-scripts 5.x)
- **Configuration Files:** webpack.config.js
- **Package Names:** `webpack`, `react-scripts`
- **Typical Setup:** Create React App projects, custom Webpack configurations

## Migration Scenarios

### Migrating from Webpack to Vite

If you're migrating a project from Webpack to Vite:

1. Install Vite and its dependencies
2. Create a `vite.config.js` file
3. The plugin will automatically detect and use Vite
4. You can keep Webpack installed during the transition
5. Remove Webpack dependencies once migration is complete

The plugin's priority system ensures Vite is used even if Webpack is still present in the project.

## Troubleshooting

### "No supported build tool detected" Error

**Cause:** Neither Vite nor Webpack is installed or configured in your project.

**Solution:** Install one of the supported build tools:

For Vite:
```bash
npm install vite @vitejs/plugin-react --save-dev
```

For Webpack (Create React App):
```bash
npm install react-scripts --save-dev
```

### Wrong Build Tool Detected

**Cause:** Multiple build tools are present and the priority system is selecting the wrong one.

**Solution:** Remove the unused build tool's dependencies and configuration files. Remember that Vite takes priority over Webpack.

### Configuration File Not Found

**Cause:** The build tool is installed but no configuration file exists.

**Solution:** The plugin can detect build tools from package.json alone. However, for better control, create the appropriate configuration file:

For Vite, create `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});
```

For Webpack, the plugin uses the configuration from react-scripts or your custom webpack.config.js.
