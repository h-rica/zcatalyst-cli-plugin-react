# API Documentation

This document provides detailed API documentation for the Catalyst React Plugin's internal architecture.

## Table of Contents
- [Build Tool Detector](#build-tool-detector)
- [Adapter Interface](#adapter-interface)
- [Vite Adapter](#vite-adapter)
- [Webpack Adapter](#webpack-adapter)
- [Environment Configuration](#environment-configuration)
- [Error Handling](#error-handling)

---

## Build Tool Detector

### `BuildToolDetector`

Detects which build tool (Vite or Webpack) a project is using.

#### Constructor

```javascript
new BuildToolDetector(userDir)
```

**Parameters:**
- `userDir` (string): Absolute path to the user's project directory

**Example:**
```javascript
const detector = new BuildToolDetector('/path/to/project');
```

#### Methods

##### `detect()`

Detects the build tool being used in the project.

**Returns:** `string` - Either `'vite'` or `'webpack'`

**Throws:** `Error` if no supported build tool is detected

**Detection Priority:**
1. Vite (highest priority)
   - `vite` in dependencies/devDependencies
   - `vite.config.js`, `vite.config.ts`, or `vite.config.mjs` exists
2. Webpack
   - `webpack` or `react-scripts` in dependencies/devDependencies
   - `webpack.config.js` exists

**Example:**
```javascript
const buildTool = detector.detect();
console.log(buildTool); // 'vite' or 'webpack'
```

##### `getDetails()`

Gets detailed information about the detected build tool.

**Returns:** `Object`
```javascript
{
  buildTool: string,        // 'vite' or 'webpack'
  hasConfigFile: boolean,   // Whether a config file exists
  configFilePath: string,   // Path to config file (if exists)
  version: string          // Version from package.json (if available)
}
```

**Example:**
```javascript
const details = detector.getDetails();
console.log(details);
// {
//   buildTool: 'vite',
//   hasConfigFile: true,
//   configFilePath: '/path/to/project/vite.config.js',
//   version: '^5.0.0'
// }
```

---

## Adapter Interface

### `BaseBuildAdapter` (Abstract Class)

Base class that defines the interface for build tool adapters.

#### Constructor

```javascript
new BaseBuildAdapter(userDir, paths)
```

**Parameters:**
- `userDir` (string): Absolute path to the user's project directory
- `paths` (Object): Paths configuration object

#### Abstract Methods

All adapters must implement these methods:

##### `getBuildToolName()`

Returns the name of the build tool.

**Returns:** `string`

##### `validate(command, cliVersion)`

Validates the project structure and dependencies.

**Parameters:**
- `command` (string): The command being executed ('build' or 'serve')
- `cliVersion` (string, optional): Version of the Catalyst CLI

**Returns:** `Promise<boolean>`

**Throws:** `Error` if validation fails

##### `build(packageJsonFile)`

Creates an optimized production build.

**Parameters:**
- `packageJsonFile` (string): Absolute path to package.json

**Returns:** `Promise<string>` - Path to build output directory

**Throws:** `Error` if build fails

##### `start(httpPort, masterPort, watchMode)`

Starts the development server.

**Parameters:**
- `httpPort` (number): Port for the development server
- `masterPort` (number): Master port for URL construction
- `watchMode` (boolean): Whether to enable file watching

**Returns:** `Promise<Object>`
```javascript
{
  eventListener: EventEmitter,  // Emits 'start' event when ready
  urls: {
    localUrlForBrowser: string, // URL to open in browser
    localUrlForTerminal: string // URL to display in terminal
  }
}
```

---

## Vite Adapter

### `ViteAdapter extends BaseBuildAdapter`

Adapter for Vite-based React projects.

#### Validation Checks

The `validate()` method performs these checks:

1. **Vite Installation**: Checks for `node_modules/vite`
2. **Required Files**:
   - `index.html` (at project root)
   - Entry point: `src/main.tsx`, `src/main.jsx`, `src/index.tsx`, or `src/index.jsx`
3. **React Version**: Must be >= 16.10.0
4. **CLI Version**: Must be >= 1.13.2 (if provided)
5. **Vite Config**: Detects `vite.config.js` or `vite.config.ts`

#### Build Process

The `build()` method:

1. Loads environment variables from `.env` files
2. Cleans the build output directory
3. Spawns `npx vite build` process
4. Monitors build output for errors
5. Validates build output (checks for `index.html`)
6. Measures and reports file sizes
7. Copies `package.json` to build directory
8. Returns build output path

**Environment Variables:**
- Uses `VITE_` prefix
- Automatically loads `.env`, `.env.local`, `.env.production`, etc.

#### Development Server

The `start()` method:

1. Loads environment variables
2. Spawns `npx vite --port <port> --host` process
3. Monitors stdout for server ready message
4. Prepares URLs with master port replacement
5. Emits 'start' event when ready
6. Handles graceful shutdown on close signal

**Example:**
```javascript
const adapter = new ViteAdapter('/path/to/project', paths);

// Validate
await adapter.validate('build', '1.13.2');

// Build
const buildPath = await adapter.build('/path/to/package.json');

// Start dev server
const { eventListener, urls } = await adapter.start(3000, 9000, true);
eventListener.on('start', () => {
  console.log('Server ready at:', urls.localUrlForBrowser);
});
```

---

## Webpack Adapter

### `WebpackAdapter extends BaseBuildAdapter`

Adapter for Webpack-based React projects (Create React App).

#### Delegation Pattern

The Webpack adapter delegates all operations to existing modules:

- `validate()` → `lib/validate/index.js`
- `build()` → `lib/build/index.js`
- `start()` → `lib/start/index.js`

This ensures **100% backward compatibility** with existing Webpack projects.

**Example:**
```javascript
const adapter = new WebpackAdapter('/path/to/project', paths);

// All methods delegate to existing implementations
await adapter.validate('build', '1.13.2');
const buildPath = await adapter.build('/path/to/package.json');
const { eventListener, urls } = await adapter.start(3000, 9000, true);
```

---

## Environment Configuration

### `getClientEnvironment(publicUrl, buildTool)`

Gets environment variables filtered by build tool.

**Location:** `lib/config/env.js`

**Parameters:**
- `publicUrl` (string): The public URL for the application
- `buildTool` (string, optional): `'webpack'` or `'vite'` (defaults to `'webpack'`)

**Returns:** `Object`
```javascript
{
  raw: {
    NODE_ENV: string,
    PUBLIC_URL: string,
    // ... filtered environment variables
  },
  stringified: {
    'process.env': {
      NODE_ENV: '"production"',
      PUBLIC_URL: '"/app"',
      // ... stringified variables
    }
  }
}
```

**Environment Variable Prefixes:**
- **Webpack**: `REACT_APP_` prefix
- **Vite**: `VITE_` prefix

**Example:**
```javascript
// For Webpack projects
const env = getClientEnvironment('/app', 'webpack');
// Includes: REACT_APP_API_URL, REACT_APP_ENV, etc.

// For Vite projects
const env = getClientEnvironment('/app', 'vite');
// Includes: VITE_API_URL, VITE_ENV, etc.
```

### Environment File Hierarchy

Both build tools support:
1. `.env` - Default variables
2. `.env.local` - Local overrides (gitignored)
3. `.env.[mode]` - Mode-specific (e.g., `.env.production`)
4. `.env.[mode].local` - Mode-specific local overrides

**Priority:** More specific files override less specific ones.

---

## Error Handling

### `PluginError`

Custom error class for plugin-specific errors.

**Location:** `lib/utils/plugin-error.js`

#### Constructor

```javascript
new PluginError(message, category, details)
```

**Parameters:**
- `message` (string): Error message
- `category` (string): Error category from `ErrorCategory`
- `details` (Object, optional):
  - `suggestion` (string): Suggested fix
  - `buildTool` (string): Build tool being used
  - `originalError` (Error): Original error if wrapping

#### Error Categories

```javascript
const ErrorCategory = {
  VALIDATION: 'VALIDATION',
  BUILD: 'BUILD',
  DEV_SERVER: 'DEV_SERVER',
  CONFIGURATION: 'CONFIGURATION',
  DEPENDENCY: 'DEPENDENCY'
};
```

#### Methods

##### `format()`

Formats the error with ANSI colors and suggestions.

**Returns:** `string` - Formatted error message

**Example:**
```javascript
const { PluginError, ErrorCategory } = require('./lib/utils/plugin-error');

const error = new PluginError(
  'Vite is not installed',
  ErrorCategory.DEPENDENCY,
  {
    suggestion: 'Run: npm install vite @vitejs/plugin-react --save-dev',
    buildTool: 'vite'
  }
);

console.log(error.format());
// [DEPENDENCY] Vite is not installed
// Build tool: vite
// 
// Suggestion:
//   Run: npm install vite @vitejs/plugin-react --save-dev
```

---

## Path Configuration

### `paths(userDir)`

Generates path configuration for the project.

**Location:** `lib/config/paths.js`

**Parameters:**
- `userDir` (string): User's project directory

**Returns:** `Object` - Paths configuration

**Vite-Specific Paths:**
- Entry point: `src/main.tsx` or `src/main.jsx` (falls back to `src/index.*`)
- HTML: `index.html` at project root
- Build output: `build` directory

**Webpack-Specific Paths:**
- Entry point: `src/index.tsx` or `src/index.jsx`
- HTML: `public/index.html`
- Build output: `build` directory

**Example:**
```javascript
const paths = require('./lib/config/paths');

const projectPaths = paths('/path/to/project');
console.log(projectPaths.appIndexJs);  // Entry point
console.log(projectPaths.appHtml);     // HTML file
console.log(projectPaths.appBuild);    // Build output
```

---

## Usage Example

Complete example of using the plugin API:

```javascript
const BuildToolDetector = require('./lib/detector/build-tool-detector');
const ViteAdapter = require('./lib/adapters/vite-adapter');
const WebpackAdapter = require('./lib/adapters/webpack-adapter');
const paths = require('./lib/config/paths');

async function buildProject(projectDir) {
  // Detect build tool
  const detector = new BuildToolDetector(projectDir);
  const buildTool = detector.detect();
  console.log(`Detected: ${buildTool}`);

  // Get paths
  const projectPaths = paths(projectDir);

  // Create appropriate adapter
  const Adapter = buildTool === 'vite' ? ViteAdapter : WebpackAdapter;
  const adapter = new Adapter(projectDir, projectPaths);

  // Validate
  await adapter.validate('build', '1.13.2');

  // Build
  const buildPath = await adapter.build(projectPaths.appPackageJson);
  console.log(`Build complete: ${buildPath}`);

  return buildPath;
}
```

---

## Custom Configuration

### Vite Configuration

Create `vite.config.js` in your project root:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
});
```

### Webpack Configuration

For Webpack projects using Create React App, configuration is managed by `react-scripts`. For custom Webpack configurations, create `webpack.config.js`.

---

## Best Practices

1. **Always validate before building or starting**
   ```javascript
   await adapter.validate('build', cliVersion);
   await adapter.build(packageJsonFile);
   ```

2. **Handle errors gracefully**
   ```javascript
   try {
     await adapter.build(packageJsonFile);
   } catch (error) {
     if (error instanceof PluginError) {
       console.error(error.format());
     } else {
       console.error(error.message);
     }
   }
   ```

3. **Use the detector for automatic tool selection**
   ```javascript
   const detector = new BuildToolDetector(userDir);
   const buildTool = detector.detect();
   // Automatically use the right adapter
   ```

4. **Respect environment variable prefixes**
   - Use `VITE_` for Vite projects
   - Use `REACT_APP_` for Webpack projects

---

## Support

For issues or questions:
- Check the [Build Tool Detection](./build-tool-detection.md) guide
- Review the [Migration Guide](./vite-migration-guide.md)
- Open an issue on the repository
