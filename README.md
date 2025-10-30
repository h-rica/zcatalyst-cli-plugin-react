<center>
    <a href="https://www.zoho.com/catalyst/">
        <img width="200" height="200" src="https://www.zohowebstatic.com/sites/default/files/catalyst/catalyst-logo.svg">
    </a>
</center>

<center><h1>Catalyst React Plugin (Modernized)</h1></center>

![catalyst](https://img.shields.io/badge/%E2%9A%A1-catalyst-blue.svg)
![npm](https://img.shields.io/npm/v/@hrica/zcatalyst-cli-plugin-react.svg?color=blue)
![license](https://img.shields.io/npm/l/@hrica/zcatalyst-cli-plugin-react.svg?color=brightgreen)
![build-tools](https://img.shields.io/badge/build--tools-Vite%20%7C%20Webpack-orange)
<br>

> **Note**: This is a fork of the [official zcatalyst-cli-plugin-react](https://www.npmjs.com/package/zcatalyst-cli-plugin-react) from the Zoho Catalyst Team, modernized to support both **Vite** and **Webpack** build tools.

A modernized React plugin for [Catalyst CLI](https://www.npmjs.com/package/zcatalyst-cli) with support for both **Vite** and **Webpack** build tools. Develop and deploy [React](https://reactjs.org/) applications with [Catalyst](https://zoho.com/catalyst) using modern or traditional build tools.

## Why This Fork?

The official plugin only supports Webpack/Create React App. This fork adds:
- ✨ **Vite Support** - Fast, modern build tool with HMR
- 🔄 **Automatic Detection** - Seamlessly works with both Vite and Webpack
- 🏗️ **Adapter Architecture** - Extensible design for future build tools
- 📦 **Full Backward Compatibility** - Existing Webpack projects work without changes
<br>

## Plugin Capabilities
- This plugin allows you to serve and debug the React Application with Catalyst.
- With this plugin you'll be able to build a production ready version of your React Application and deploy it to Catalyst remote console.
- Supports both **Vite** and **Webpack** build tools with automatic detection.
<br>

## Prerequisites

**ZCatalyst-CLI:** To install ZCatalyst-CLI with npm, use this command
```bash
npm install -g zcatalyst-cli
```
Check this [documentation](https://catalyst.zoho.com/help/cli-init.html#React) to get started with React in Catalyst
> Note: zcatalyst-cli of versions 1.11.0 and above supports this plugin.

## Build Tool Support
This plugin automatically detects and supports both modern and traditional React build tools:
- **Vite** - Fast, modern build tool with HMR (recommended for new projects)
- **Webpack** - Traditional build tool via Create React App (react-scripts)

The plugin automatically detects which build tool your project uses based on your dependencies and configuration files.

### Documentation
- [Build Tool Detection](docs/build-tool-detection.md) - How the plugin detects your build tool
- [Vite Migration Guide](docs/vite-migration-guide.md) - Step-by-step guide to migrate from Webpack to Vite

### Quick Start with Vite
```bash
# Create a new Vite + React project
npm create vite@latest my-app -- --template react-ts

# Install the plugin
cd my-app
npm install @hrica/zcatalyst-cli-plugin-react --save-dev

# Configure catalyst.json
# The plugin will automatically detect Vite
```
<br>

## Configuring Plugin
The Plugin can be installed in two ways and needed  to be configured in the **catalyst.json** configuration file.

>Note: When setting up the React App from ZCatalyst-CLI the CLI will take care of the configuration  process.

### Global installation
The plugin can be installed in the global NPM **_node_modules_** directory and configured as follows

**Installation**
```bash
npm install @hrica/zcatalyst-cli-plugin-react -g
```
**_catalyst.json_**
```json
{
    "client": {
        "source": "react-app",
        "plugin": "@hrica/zcatalyst-cli-plugin-react"
    }
}
```

### Local installation
The plugin can be installed in the local **_node_modules_** directory of the React App and configured as follows

**Installation**
```bash
# to be executed within the React App directory
npm install @hrica/zcatalyst-cli-plugin-react --save-dev
```

**_catalyst.json_**
```json
{
    "client": {
        "source": "react-app",
        "plugin": "react-app/node_modules/@hrica/zcatalyst-cli-plugin-react"
    }
}
```







## Credits and Acknowledgments

This project is a fork of the [official zcatalyst-cli-plugin-react](https://www.npmjs.com/package/zcatalyst-cli-plugin-react) created and maintained by the **Zoho Catalyst Team**.

### Original Project
- **Package**: `zcatalyst-cli-plugin-react`
- **Author**: Catalyst (https://www.zoho.com/catalyst/)
- **Repository**: Official Zoho Catalyst CLI Plugin for React
- **License**: MIT

### This Fork
- **Package**: `@hrica/zcatalyst-cli-plugin-react`
- **Maintainer**: Harivonjy Rica <contact.harivonjy@gmail.com>
- **Key Enhancement**: Added Vite support alongside existing Webpack support
- **Architecture**: Introduced adapter pattern for multi-build-tool support
- **Compatibility**: 100% backward compatible with original plugin

### What's Different?

This fork extends the original plugin with:
- ✨ Vite build tool support
- 🔄 Automatic build tool detection
- 🏗️ Modular adapter architecture
- 📚 Enhanced documentation
- 🧪 Comprehensive integration tests

All original Webpack/Create React App functionality remains intact and unchanged.

### Contributing

Contributions are welcome! If you'd like to contribute:
1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### License

MIT License - Same as the original project

### Support

- **Issues**: [GitHub Issues](https://github.com/h-rica/zcatalyst-cli-plugin-react/issues)
- **Documentation**: [docs/](docs/)
- **Original Plugin**: [zcatalyst-cli-plugin-react](https://www.npmjs.com/package/zcatalyst-cli-plugin-react)
- **Catalyst Platform**: [Zoho Catalyst](https://www.zoho.com/catalyst/)

---

**Disclaimer**: This is an independent fork and is not officially affiliated with or endorsed by Zoho Corporation or the Catalyst Team. For the official plugin, please use [zcatalyst-cli-plugin-react](https://www.npmjs.com/package/zcatalyst-cli-plugin-react).
