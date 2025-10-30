# Catalyst React Plugin Documentation

Welcome to the Catalyst React Plugin documentation. This plugin enables you to develop and deploy React applications with Zoho Catalyst.

## Table of Contents

### Getting Started
- [Main README](../README.md) - Installation and basic configuration

### Features
- [Build Tool Detection](build-tool-detection.md) - How the plugin detects Vite vs Webpack

### Build Tools
- **Vite Support** - Modern, fast build tool with HMR
- **Webpack Support** - Traditional Create React App support

## Quick Links

- [Catalyst Documentation](https://catalyst.zoho.com/help/cli-init.html#React)
- [Catalyst CLI](https://www.npmjs.com/package/zcatalyst-cli)
- [Vite Documentation](https://vitejs.dev/)
- [Create React App Documentation](https://create-react-app.dev/)

## Plugin Architecture

The plugin is organized into several key modules:

- **`lib/detector/`** - Build tool detection logic
- **`lib/config/`** - Configuration management
- **`lib/build/`** - Build operations
- **`lib/start/`** - Development server
- **`lib/validate/`** - Project validation
- **`lib/utils/`** - Shared utilities

## Contributing

When contributing to this plugin, please ensure:
1. All new features are documented
2. Code follows the existing style conventions
3. Tests are added for new functionality
4. The README is updated with any user-facing changes

## Support

For issues and questions:
- [GitHub Issues](https://github.com/zoho/zcatalyst-cli-plugin-react/issues)
- [Catalyst Community](https://community.zoho.com/catalyst)
