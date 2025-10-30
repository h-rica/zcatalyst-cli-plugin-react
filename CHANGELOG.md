# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## About This Fork

This package is a fork of the [official zcatalyst-cli-plugin-react](https://www.npmjs.com/package/zcatalyst-cli-plugin-react) maintained by the Zoho Catalyst Team. The fork was created to add support for modern build tools (Vite) while maintaining full backward compatibility with the original Webpack-based implementation.

**Original Package**: `zcatalyst-cli-plugin-react` by Zoho Catalyst Team  
**Fork**: `@hr/zcatalyst-cli-plugin-react` by HR  
**Key Addition**: Vite support with automatic build tool detection

---

## [1.0.0] - 2025-01-XX

### Added

#### Build Tool Support
- **Vite Support**: Full support for Vite-based React projects
  - Automatic detection of Vite projects via package.json and vite.config.js
  - Vite development server integration
  - Vite production build support
  - Hot Module Replacement (HMR) support
  
- **Build Tool Detection**: Automatic detection of build tools
  - Priority logic: Vite > Webpack when both are present
  - Detection from package.json dependencies
  - Detection from configuration files (vite.config.js, webpack.config.js)
  
- **Adapter Architecture**: Modular build tool support
  - BaseBuildAdapter interface for extensibility
  - ViteAdapter for Vite projects
  - WebpackAdapter for backward compatibility
  - Easy to add support for future build tools

#### Environment Variables
- Support for VITE_ prefixed environment variables (Vite projects)
- Support for REACT_APP_ prefixed environment variables (Webpack projects)
- Automatic environment variable filtering based on build tool

#### Configuration
- Flexible path resolution for both Vite and Webpack project structures
- Support for index.html at root (Vite) or public/ (Webpack)
- Support for multiple entry point names (main.tsx, main.jsx, index.tsx, index.jsx)
- Configurable build output directories (dist for Vite, build for Webpack)

#### Error Handling
- Enhanced error messages with suggestions
- PluginError class with categorization
- ANSI color formatting for better readability
- Detailed diagnostic information

#### Testing
- Comprehensive integration tests for Vite workflows
- Comprehensive integration tests for Webpack workflows
- Migration scenario tests
- 40+ integration tests covering all major features

#### Documentation
- Complete API documentation
- Vite migration guide
- Build tool detection guide
- Troubleshooting guide
- Integration test documentation

### Changed

- **Package Name**: Changed from `zcatalyst-cli-plugin-react` to `@hr/zcatalyst-cli-plugin-react`
- **Version**: Bumped to 1.0.0 for initial scoped package release
- **Architecture**: Refactored to use adapter pattern for build tool support
- **Path Resolution**: Enhanced to support both Vite and Webpack project structures
- **Environment Handling**: Updated to support both VITE_ and REACT_APP_ prefixes

### Maintained

- **Backward Compatibility**: Full backward compatibility with existing Webpack/CRA projects
- **API Compatibility**: No breaking changes to the plugin API
- **Webpack Support**: All existing Webpack functionality preserved
- **TypeScript Support**: Continued support for TypeScript projects

### Fixed

- Build tool detection now properly prioritizes Vite over Webpack
- Environment variable filtering now works correctly for both build tools
- Path resolution handles edge cases for both project structures

## [0.0.4] - Previous Release

### Legacy Version
- Original Webpack-only implementation
- Create React App (CRA) support
- Basic TypeScript support

---

## Migration Guide

### From 0.0.4 to 1.0.0

#### For Existing Webpack Projects
No changes required! Your existing projects will continue to work exactly as before.

#### For New Vite Projects
1. Install Vite and dependencies:
   ```bash
   npm install vite @vitejs/plugin-react --save-dev
   ```

2. Create `vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     build: {
       outDir: 'build'
     }
   });
   ```

3. The plugin will automatically detect and use Vite!

#### Migrating from Webpack to Vite
See the [Vite Migration Guide](docs/vite-migration-guide.md) for detailed instructions.

---

## Upgrade Instructions

### From zcatalyst-cli-plugin-react to @hr/zcatalyst-cli-plugin-react

1. Uninstall the old package:
   ```bash
   npm uninstall zcatalyst-cli-plugin-react
   ```

2. Install the new scoped package:
   ```bash
   npm install @hr/zcatalyst-cli-plugin-react
   ```

3. Update your catalyst.json (if needed):
   ```json
   {
     "plugins": ["@hr/zcatalyst-cli-plugin-react"]
   }
   ```

---

## Support

- **Issues**: https://github.com/hr/zcatalyst-cli-plugin-react/issues
- **Documentation**: https://github.com/hr/zcatalyst-cli-plugin-react/tree/main/docs
- **Migration Help**: See [Vite Migration Guide](docs/vite-migration-guide.md)
