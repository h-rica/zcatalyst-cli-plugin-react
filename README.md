<center>
    <a href="https://www.zoho.com/catalyst/">
        <img width="200" height="200" src="https://www.zohowebstatic.com/sites/default/files/catalyst/catalyst-logo.svg">
    </a>
</center>

<center><h1>Catalyst React plugin</h1></center>

![catalyst](https://img.shields.io/badge/%E2%9A%A1-catalyst-blue.svg)
![npm](https://img.shields.io/npm/v/zcatalyst-cli-plugin-react.svg?color=blue)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/zcatalyst-cli-plugin-react.svg)
![license](https://img.shields.io/npm/l/zcatalyst-cli-plugin-react.svg?color=brightgreen)
<br>

The official plugin for [Catalyst CLI](https://www.npmjs.com/package/zcatalyst-cli) to develop and deploy [React](https://reactjs.org/) Applications with [Catalyst](https://zoho.com/catalyst).
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
npm install zcatalyst-cli-plugin-react --save-dev

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
npm install zcatalyst-cli-plugin-react -g
```
**_catalyst.json_**
```json
{
    "client": {
        "source": "react-app",
        "plugin": "zcatalyst-cli-plugin-react"
    }
}
```

### Local installation
The plugin can be installed in the local **_node_modules_** directory of the React App and configured as follows

**Installation**
```bash
# to be executed within the React App directory
npm install zcatalyst-cli-plugin-react --save-dev
```

**_catalyst.json_**
```json
{
    "client": {
        "source": "react-app",
        "plugin": "react-app/node_modules/zcatalyst-cli-plugin-react"
    }
}
```





