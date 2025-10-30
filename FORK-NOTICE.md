# Fork Notice

## About This Project

**`@hr/zcatalyst-cli-plugin-react`** is a fork of the official **`zcatalyst-cli-plugin-react`** package created and maintained by the **Zoho Catalyst Team**.

## Original Project

- **Package Name**: `zcatalyst-cli-plugin-react`
- **Author**: Catalyst (Zoho Corporation)
- **Homepage**: https://www.zoho.com/catalyst/
- **npm**: https://www.npmjs.com/package/zcatalyst-cli-plugin-react
- **License**: MIT

## Why This Fork Exists

The official `zcatalyst-cli-plugin-react` plugin is tightly coupled to Webpack and Create React App (CRA). As the React ecosystem evolves, modern build tools like Vite have become increasingly popular due to their speed and developer experience improvements.

This fork was created to:

1. **Add Vite Support**: Enable developers to use Vite with Catalyst projects
2. **Maintain Compatibility**: Keep 100% backward compatibility with existing Webpack projects
3. **Modernize Architecture**: Introduce an adapter pattern for extensibility
4. **Improve Developer Experience**: Provide automatic build tool detection

## Key Differences

### Original Plugin (`zcatalyst-cli-plugin-react`)
- ✅ Webpack support
- ✅ Create React App support
- ✅ TypeScript support
- ❌ No Vite support
- ❌ Tightly coupled to Webpack

### This Fork (`@hr/zcatalyst-cli-plugin-react`)
- ✅ Webpack support (unchanged)
- ✅ Create React App support (unchanged)
- ✅ TypeScript support (unchanged)
- ✨ **NEW**: Vite support
- ✨ **NEW**: Automatic build tool detection
- ✨ **NEW**: Adapter architecture for extensibility
- ✨ **NEW**: Enhanced documentation and tests

## Compatibility

This fork is **100% backward compatible** with the original plugin. If you're using Webpack or Create React App, you can switch to this fork without any code changes.

```bash
# Replace original plugin
npm uninstall zcatalyst-cli-plugin-react
npm install @hr/zcatalyst-cli-plugin-react

# Update catalyst.json
{
  "client": {
    "plugin": "@hr/zcatalyst-cli-plugin-react"
  }
}
```

Your existing Webpack projects will continue to work exactly as before.

## Relationship to Original Project

- **Independent Fork**: This is an independent fork, not a pull request or official extension
- **Not Affiliated**: Not officially affiliated with or endorsed by Zoho Corporation
- **Separate Maintenance**: Maintained independently by the fork author
- **Same License**: Uses the same MIT license as the original
- **Credit Given**: Full credit to the Zoho Catalyst Team for the original work

## When to Use Which Package?

### Use the Original (`zcatalyst-cli-plugin-react`)
- You only need Webpack/CRA support
- You prefer official, vendor-supported packages
- You want the most conservative, stable option

### Use This Fork (`@hr/zcatalyst-cli-plugin-react`)
- You want to use Vite with Catalyst
- You want automatic build tool detection
- You want the latest features and improvements
- You're okay with community-maintained packages

## Contributing

Contributions to this fork are welcome! However, please note:

- This fork focuses on build tool modernization
- Core Catalyst integration remains unchanged
- For issues with Catalyst platform itself, contact Zoho support
- For issues with this fork's features, open an issue here

## Support

### For This Fork
- **Issues**: https://github.com/h-rica/zcatalyst-cli-plugin-react/issues
- **Documentation**: See [docs/](docs/) directory
- **Maintainer**: Harivonjy Rica

### For Original Plugin
- **Official Support**: Zoho Catalyst Team
- **Documentation**: https://catalyst.zoho.com/help/cli-init.html#React
- **Platform Support**: https://www.zoho.com/catalyst/

## Disclaimer

This fork is provided "as is" without warranty of any kind. While it maintains full compatibility with the original plugin's Webpack functionality, the Vite support is a new addition. Please test thoroughly in your environment before deploying to production.

**This project is not officially affiliated with, authorized, maintained, sponsored, or endorsed by Zoho Corporation or any of its affiliates or subsidiaries.**

## License

MIT License - Same as the original project

Copyright (c) Original work by Catalyst (Zoho Corporation)  
Copyright (c) Modified work by Harivonjy Rica

See [LICENSE](LICENSE) file for details.

---

**Thank you to the Zoho Catalyst Team for creating the original plugin that made this fork possible!** 🙏
