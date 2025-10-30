# Design Document

## Overview

This document outlines the design for modernizing the Zoho Catalyst CLI React plugin to support modern build tools while maintaining backward compatibility. The current plugin is tightly coupled to Webpack and Create React App (CRA), making it difficult to support newer, faster build tools like Vite.

The modernization introduces a **Build Adapter Pattern** that abstracts build-tool-specific logic behind a common interface. This allows the plugin to support multiple build tools (Vite, Webpack, and potentially others in the future) without duplicating core functionality.

### Key Design Goals

1. **Build Tool Agnostic**: Support multiple build tools through a common adapter interface
2. **Backward Compatible**: Existing Webpack/CRA projects continue to work without changes
3. **Vite First**: Prioritize Vite for new projects while supporting legacy Webpack projects
4. **Minimal Configuration**: Automatic detection of build tools based on project structure
5. **Maintainable**: Clear separation of concerns with modular architecture

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Catalyst CLI                             │
│                  (calls plugin methods)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Plugin Entry Point                          │
│                   (lib/index.js)                             │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │  validate()  │   build()    │      start()         │    │
│  └──────┬───────┴──────┬───────┴──────────┬───────────┘    │
└─────────┼──────────────┼──────────────────┼─────────────────┘
          │              │                  │
          ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Build Tool Detector                             │
│         (detects Vite vs Webpack)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  Vite Adapter    │    │ Webpack Adapter  │
│                  │    │                  │
│  - validate()    │    │  - validate()    │
│  - build()       │    │  - build()       │
│  - start()       │    │  - start()       │
└──────────────────┘    └──────────────────┘
```

### Component Breakdown

#### 1. Plugin Entry Point (`lib/index.js`)

The main entry point remains largely unchanged but now delegates to build adapters:

- **Responsibilities**:
  - Expose the plugin API (validate, build, start, logs)
  - Add user project node_modules to NODE_PATH
  - Delegate operations to the appropriate build adapter
  - Manage the log stream

- **Changes**:
  - Import and use BuildToolDetector
  - Instantiate the correct adapter based on detection
  - Pass adapter instance to operation modules

#### 2. Build Tool Detector (`lib/detector/index.js`)

New module responsible for identifying which build tool a project uses:

- **Detection Strategy**:
  1. Check package.json dependencies/devDependencies for "vite"
  2. Check for vite.config.js or vite.config.ts files
  3. Check package.json dependencies/devDependencies for "webpack" or "react-scripts"
  4. Check for webpack.config.js file
  5. If multiple tools detected, prioritize Vite
  6. If no tools detected, throw error with helpful message

- **API**:
  ```javascript
  {
    detect(userDir): Promise<BuildToolType>
    // Returns: 'vite' | 'webpack'
  }
  ```

#### 3. Build Adapter Interface (`lib/adapters/base-adapter.js`)

Abstract base class defining the contract all adapters must implement:

```javascript
class BaseBuildAdapter {
  constructor(userDir, paths) {
    this.userDir = userDir;
    this.paths = paths;
  }

  // Validate project structure and dependencies
  async validate(command, cliVersion) {
    throw new Error('validate() must be implemented');
  }

  // Create production build
  async build(packageJsonFile) {
    throw new Error('build() must be implemented');
  }

  // Start development server
  async start(httpPort, masterPort, watchMode) {
    throw new Error('start() must be implemented');
  }

  // Get build tool name for logging
  getBuildToolName() {
    throw new Error('getBuildToolName() must be implemented');
  }
}
```

#### 4. Vite Adapter (`lib/adapters/vite-adapter.js`)

Implements the adapter interface for Vite projects:

- **validate()**:
  - Check for required files (index.html, src/main.tsx or src/main.jsx)
  - Verify Vite is installed in node_modules
  - Check React version compatibility
  - Validate CLI version compatibility
  - Check for vite.config.js/ts

- **build()**:
  - Load environment variables (.env files)
  - Execute `vite build` command
  - Wait for build completion
  - Validate build output (dist directory)
  - Copy package.json to build output
  - Return build output path

- **start()**:
  - Load environment variables
  - Spawn Vite dev server process with configured port
  - Monitor process output for startup confirmation
  - Emit start event when ready
  - Return event emitter and URLs
  - Handle process cleanup on close

#### 5. Webpack Adapter (`lib/adapters/webpack-adapter.js`)

Wraps existing Webpack implementation:

- **validate()**:
  - Delegate to existing `lib/validate/index.js`
  - Maintain all current validation logic

- **build()**:
  - Delegate to existing `lib/build/index.js`
  - Maintain all current build logic

- **start()**:
  - Delegate to existing `lib/start/index.js`
  - Maintain all current dev server logic

This adapter serves as a thin wrapper to preserve backward compatibility.

## Components and Interfaces

### File Structure

```
lib/
├── index.js                          # Main entry point (modified)
├── detector/
│   └── index.js                      # Build tool detection (new)
├── adapters/
│   ├── base-adapter.js               # Abstract adapter interface (new)
│   ├── vite-adapter.js               # Vite implementation (new)
│   └── webpack-adapter.js            # Webpack wrapper (new)
├── build/
│   └── index.js                      # Webpack build logic (existing)
├── start/
│   └── index.js                      # Webpack dev server (existing)
├── validate/
│   └── index.js                      # Webpack validation (existing)
├── config/
│   ├── env.js                        # Environment loading (modified)
│   ├── paths.js                      # Path resolution (modified)
│   ├── modules.js                    # Module resolution (existing)
│   ├── webpack.config.js             # Webpack config (existing)
│   └── webpackDevServer.config.js    # Dev server config (existing)
└── utils/
    └── logger.js                     # Logging utility (existing)
```

### Build Tool Detector Interface

```javascript
// lib/detector/index.js
class BuildToolDetector {
  constructor(userDir) {
    this.userDir = userDir;
    this.packageJson = null;
  }

  async detect() {
    this.packageJson = await this.readPackageJson();
    
    // Check for Vite
    if (this.hasVite()) {
      return 'vite';
    }
    
    // Check for Webpack
    if (this.hasWebpack()) {
      return 'webpack';
    }
    
    throw new Error(
      'No supported build tool detected. ' +
      'Please install either Vite or Webpack.'
    );
  }

  hasVite() {
    return (
      this.hasDependency('vite') ||
      this.hasConfigFile('vite.config.js') ||
      this.hasConfigFile('vite.config.ts')
    );
  }

  hasWebpack() {
    return (
      this.hasDependency('webpack') ||
      this.hasDependency('react-scripts') ||
      this.hasConfigFile('webpack.config.js')
    );
  }

  hasDependency(name) {
    const deps = this.packageJson.dependencies || {};
    const devDeps = this.packageJson.devDependencies || {};
    return deps[name] || devDeps[name];
  }

  hasConfigFile(filename) {
    return fs.existsSync(path.join(this.userDir, filename));
  }
}
```

### Vite Adapter Implementation Details

```javascript
// lib/adapters/vite-adapter.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const events = require('events');

class ViteAdapter extends BaseBuildAdapter {
  getBuildToolName() {
    return 'Vite';
  }

  async validate(command, cliVersion) {
    // Check for Vite installation
    const vitePath = path.join(
      this.paths.appNodeModules,
      'vite'
    );
    
    if (!fs.existsSync(vitePath)) {
      throw new Error(
        'Vite is not installed. Run: npm install vite'
      );
    }

    // Check for required files
    const requiredFiles = [
      this.paths.appHtml,  // public/index.html or index.html
      this.paths.appIndexJs // src/main.tsx or src/main.jsx
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    // Check React version
    const react = require(
      require.resolve('react', { paths: [this.paths.appPath] })
    );
    
    if (semver.lt(react.version, '16.10.0')) {
      throw new Error(
        `React ${react.version} is not supported. ` +
        `Minimum version: 16.10.0`
      );
    }

    // Check CLI compatibility
    if (cliVersion && !semver.satisfies(
      cliVersion,
      packageJson.compatibility['zcatalyst-cli']
    )) {
      log(
        chalk.yellow(
          `Warning: CLI version ${cliVersion} may not be compatible`
        )
      );
    }

    return true;
  }

  async build(packageJsonFile) {
    // Load environment variables
    require('../config/env').loadClientEnv();

    log('Creating optimized production build with Vite...');

    // Clean build directory
    await fs.emptyDir(this.paths.appBuild);

    // Execute Vite build
    const viteBin = path.join(
      this.paths.appNodeModules,
      '.bin',
      'vite'
    );

    return new Promise((resolve, reject) => {
      const buildProcess = spawn(viteBin, ['build'], {
        cwd: this.userDir,
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      });

      buildProcess.on('error', (err) => {
        reject(new Error(`Vite build failed: ${err.message}`));
      });

      buildProcess.on('exit', async (code) => {
        if (code !== 0) {
          reject(new Error(`Vite build exited with code ${code}`));
          return;
        }

        try {
          // Copy package.json
          await fs.copyFile(
            packageJsonFile,
            path.join(this.paths.appBuild, 'package.json')
          );

          // Validate build output
          if (!fs.existsSync(this.paths.appBuild)) {
            throw new Error('Build output directory not found');
          }

          const indexHtml = path.join(
            this.paths.appBuild,
            'index.html'
          );
          
          if (!fs.existsSync(indexHtml)) {
            throw new Error('index.html not found in build output');
          }

          log(chalk.green('Build completed successfully!'));
          resolve(this.paths.appBuild);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async start(httpPort, masterPort, watchMode) {
    // Load environment variables
    require('../config/env').loadClientEnv();

    const HOST = '0.0.0.0';
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';

    // Prepare URLs
    const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
    const urls = prepareUrls(
      protocol,
      HOST,
      httpPort,
      this.paths.publicUrlOrPath.slice(0, -1)
    );

    // Adjust URLs to use master port
    urls.lanUrlForTerminal = urls.lanUrlForTerminal
      ? urls.lanUrlForTerminal.replace(httpPort, masterPort) + '/'
      : urls.lanUrlForTerminal;
    urls.localUrlForBrowser = urls.localUrlForBrowser
      ? urls.localUrlForBrowser.replace(httpPort, masterPort) + '/'
      : urls.localUrlForBrowser;
    urls.localUrlForTerminal = 
      urls.localUrlForTerminal.replace(httpPort, masterPort) + '/';

    log(chalk.cyan('Starting Vite development server...\n'));

    // Start Vite dev server
    const viteBin = path.join(
      this.paths.appNodeModules,
      '.bin',
      'vite'
    );

    const viteProcess = spawn(viteBin, [], {
      cwd: this.userDir,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: httpPort.toString(),
        HOST: HOST,
        NODE_ENV: 'development'
      }
    });

    const eventListener = new events.EventEmitter();

    viteProcess.on('error', (err) => {
      log(chalk.red(`Failed to start Vite: ${err.message}`));
      
      if (err.code === 'ENOENT') {
        log(chalk.yellow('Vite may not be installed. Run: npm install'));
      }
      
      eventListener.emit('error', err);
    });

    viteProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(chalk.red(`Vite exited with code ${code}`));
      }
    });

    // Emit start event after Vite initializes
    setTimeout(() => {
      eventListener.emit('start');
    }, 2000);

    eventListener.on('close', () => {
      viteProcess.kill();
    });

    // Graceful shutdown
    if (process.env.CI !== 'true') {
      process.stdin.on('end', () => {
        viteProcess.kill();
      });
    }

    return {
      eventListener,
      urls
    };
  }
}
```

## Data Models

### BuildToolType

```typescript
type BuildToolType = 'vite' | 'webpack';
```

### AdapterConfig

```typescript
interface AdapterConfig {
  userDir: string;
  paths: PathsConfig;
  packageJson: PackageJson;
}
```

### PathsConfig

```typescript
interface PathsConfig {
  dotenv: string;
  appPath: string;
  appBuild: string;
  appPublic: string;
  appHtml: string;
  appIndexJs: string;
  appPackageJson: string;
  appSrc: string;
  appTsConfig: string;
  appJsConfig: string;
  appNodeModules: string;
  publicUrlOrPath: string;
  moduleFileExtensions: string[];
}
```

### StartResult

```typescript
interface StartResult {
  eventListener: EventEmitter;
  urls: {
    localUrlForBrowser: string;
    localUrlForTerminal: string;
    lanUrlForTerminal: string;
  };
}
```

## Error Handling

### Error Categories

1. **Detection Errors**: No supported build tool found
2. **Validation Errors**: Missing required files or incompatible versions
3. **Build Errors**: Compilation failures, missing dependencies
4. **Runtime Errors**: Dev server crashes, port conflicts

### Error Handling Strategy

```javascript
// Centralized error handler
class PluginError extends Error {
  constructor(message, category, details = {}) {
    super(message);
    this.name = 'PluginError';
    this.category = category;
    this.details = details;
  }

  format() {
    const messages = [
      chalk.red.bold(`Error: ${this.message}`),
      ''
    ];

    if (this.details.suggestion) {
      messages.push(
        chalk.yellow('Suggestion:'),
        `  ${this.details.suggestion}`,
        ''
      );
    }

    if (this.details.documentation) {
      messages.push(
        chalk.blue('Documentation:'),
        `  ${this.details.documentation}`,
        ''
      );
    }

    return messages.join('\n');
  }
}

// Usage
throw new PluginError(
  'Vite is not installed',
  'validation',
  {
    suggestion: 'Run: npm install vite --save-dev',
    documentation: 'https://vitejs.dev/guide/'
  }
);
```

### Error Recovery

- **Build Tool Not Found**: Provide installation instructions
- **Port Conflict**: Let build tool handle (Vite auto-increments, Webpack prompts)
- **Missing Files**: List all missing files with expected locations
- **Version Mismatch**: Show current vs required versions

## Testing Strategy

### Unit Tests

Test individual components in isolation:

1. **BuildToolDetector**
   - Test Vite detection with various package.json configurations
   - Test Webpack detection with various configurations
   - Test priority when both tools present
   - Test error when no tools found

2. **ViteAdapter**
   - Test validation with valid/invalid projects
   - Test build process (mock spawn)
   - Test dev server startup (mock spawn)
   - Test error handling

3. **WebpackAdapter**
   - Test delegation to existing modules
   - Test backward compatibility

4. **Environment Loading**
   - Test .env file loading
   - Test variable expansion
   - Test VITE_ vs REACT_APP_ prefixes

### Integration Tests

Test complete workflows:

1. **Vite Project Workflow**
   - Create sample Vite project
   - Run validate → build → verify output
   - Run validate → start → verify server

2. **Webpack Project Workflow**
   - Create sample CRA project
   - Run validate → build → verify output
   - Run validate → start → verify server

3. **Migration Scenario**
   - Start with Webpack project
   - Add Vite configuration
   - Verify Vite is detected and used

### Test Structure

```
tests/
├── unit/
│   ├── detector.test.js
│   ├── vite-adapter.test.js
│   ├── webpack-adapter.test.js
│   └── env.test.js
├── integration/
│   ├── vite-workflow.test.js
│   ├── webpack-workflow.test.js
│   └── migration.test.js
└── fixtures/
    ├── vite-project/
    ├── webpack-project/
    └── mixed-project/
```

### Testing Tools

- **Jest**: Test runner and assertion library
- **Mock Spawn**: Mock child_process.spawn for process tests
- **Temp Directories**: Create temporary test projects
- **Snapshot Testing**: Verify generated configurations

## Configuration Management

### Environment Variables

The plugin supports different environment variable prefixes based on the build tool:

**Vite Projects**:
- `VITE_*` variables are exposed to the client
- Standard Vite environment variable handling

**Webpack Projects**:
- `REACT_APP_*` variables are exposed to the client
- Existing CRA-style environment handling

### Configuration Files

**Vite Configuration** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
});
```

**Webpack Configuration**:
- Existing `lib/config/webpack.config.js` remains unchanged
- Supports customization through `config-overrides.js` (react-app-rewired)

### Path Resolution

Both adapters use the same path resolution logic from `lib/config/paths.js`:

- Vite projects may have `index.html` at root or in `public/`
- Entry point can be `src/main.tsx`, `src/main.jsx`, `src/index.tsx`, or `src/index.jsx`
- Build output defaults to `build/` directory

## Performance Considerations

### Build Performance

**Vite Advantages**:
- Native ES modules in development (no bundling)
- esbuild for dependency pre-bundling
- Rollup for optimized production builds
- Faster cold starts and HMR

**Webpack Considerations**:
- Maintain existing caching strategies
- Keep webpack cache enabled
- Use persistent caching for faster rebuilds

### Memory Management

- Spawn build processes in separate child processes
- Clean up event listeners on process termination
- Clear require cache when switching between projects

### Optimization Strategies

1. **Lazy Loading**: Only load adapter when needed
2. **Caching**: Cache detection results during plugin lifecycle
3. **Parallel Operations**: Don't block on non-critical operations
4. **Stream Processing**: Use streams for large file operations

## Migration Path

### For Plugin Users

**Existing Webpack Projects**:
- No changes required
- Plugin automatically detects and uses Webpack
- All existing functionality preserved

**New Projects**:
- Install Vite: `npm install vite @vitejs/plugin-react --save-dev`
- Create `vite.config.js`
- Plugin automatically detects and uses Vite

**Migrating to Vite**:
1. Install Vite dependencies
2. Create Vite configuration
3. Move `index.html` to project root (optional)
4. Update entry point to `src/main.tsx` (optional)
5. Plugin automatically switches to Vite

### For Plugin Maintainers

**Phase 1: Foundation**
- Implement BuildToolDetector
- Create adapter interface
- Implement WebpackAdapter (wrapper)

**Phase 2: Vite Support**
- Implement ViteAdapter
- Add Vite-specific validation
- Add Vite build and dev server logic

**Phase 3: Testing & Documentation**
- Write comprehensive tests
- Update documentation
- Create migration guide

**Phase 4: Release**
- Beta release for testing
- Gather feedback
- Stable release

## Security Considerations

### Dependency Management

- Pin major versions of build tools in peerDependencies
- Regularly update dependencies for security patches
- Use npm audit to check for vulnerabilities

### Environment Variables

- Never log sensitive environment variables
- Validate environment variable names
- Sanitize user input in configuration

### Process Spawning

- Validate binary paths before spawning
- Use shell: true only when necessary
- Set appropriate process permissions
- Handle process cleanup to prevent zombies

### File System Operations

- Validate all file paths
- Use path.join() to prevent directory traversal
- Check file permissions before operations
- Handle symlinks carefully

## Backward Compatibility

### API Compatibility

The plugin maintains the same public API:

```javascript
module.exports = {
  validate(command, sourceDir, runtime),
  build(sourceDir, runtime),
  start(targetDetails, masterPort),
  logs()
};
```

### Configuration Compatibility

- Existing `catalyst.json` configurations work unchanged
- Webpack projects continue using existing configurations
- No breaking changes to CLI integration

### Deprecation Strategy

- No features are deprecated in this release
- Future releases may deprecate Webpack support with advance notice
- Migration tools will be provided when deprecation occurs

## Future Enhancements

### Potential Additions

1. **Rollup Support**: Add adapter for Rollup-based projects
2. **Turbopack Support**: Add adapter when Turbopack stabilizes
3. **Custom Adapters**: Allow users to provide custom adapters
4. **Configuration Presets**: Provide optimized configurations for common scenarios
5. **Build Analytics**: Collect and display build performance metrics
6. **Hot Reload Improvements**: Enhanced HMR for better DX

### Extensibility Points

- Adapter plugin system for custom build tools
- Configuration hooks for advanced customization
- Event system for build lifecycle hooks
- Custom validation rules

## Documentation Requirements

### User Documentation

1. **Getting Started Guide**
   - Installation instructions
   - Quick start for Vite projects
   - Quick start for Webpack projects

2. **Migration Guide**
   - Webpack to Vite migration steps
   - Common issues and solutions
   - Configuration examples

3. **Configuration Reference**
   - Environment variables
   - Build tool detection
   - Custom configurations

4. **Troubleshooting**
   - Common errors and fixes
   - Debug mode instructions
   - Support resources

### Developer Documentation

1. **Architecture Overview**
   - Component diagram
   - Data flow
   - Extension points

2. **Adapter Development Guide**
   - Creating custom adapters
   - Testing adapters
   - Publishing adapters

3. **Contributing Guide**
   - Development setup
   - Testing requirements
   - Pull request process

## Conclusion

This design provides a solid foundation for modernizing the Catalyst React plugin while maintaining backward compatibility. The adapter pattern allows for flexible support of multiple build tools, and the modular architecture makes the codebase more maintainable and extensible.

The design prioritizes:
- **Developer Experience**: Automatic detection, clear errors, fast builds
- **Maintainability**: Clean separation of concerns, testable components
- **Flexibility**: Easy to add new build tools in the future
- **Stability**: Backward compatible, well-tested, robust error handling

By following this design, the plugin will be well-positioned to support modern React development workflows while continuing to serve existing users.
