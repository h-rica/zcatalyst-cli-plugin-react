# Build Tool Detection

The Catalyst React plugin automatically detects which build tool your project uses and configures itself accordingly. This allows seamless support for both modern Vite projects and traditional Create React App (Webpack) projects.

## Supported Build Tools

### Vite (Recommended for new projects)
- **Fast HMR** - Lightning-fast Hot Module Replacement
- **Modern ESM** - Native ES modules support
- **Optimized builds** - Rollup-based production builds
- **TypeScript** - First-class TypeScript support

### Webpack (via Create React App)
- **Mature ecosystem** - Battle-tested tooling
- **Full compatibility** - Works with existing CRA projects
- **Zero config** - Managed by react-scripts

## Detection Logic

The plugin uses the following priority order to detect your build tool:

### 1. Vite Detection (Highest Priority)
The plugin detects Vite if **any** of the following conditions are met:
- `vite` is listed in `dependencies` or `devDependencies` in package.json
- A Vite configuration file exists:
  - `vite.config.js`
  - `vite.config.ts`
  - `vite.config.mjs`

### 2. Webpack Detection
The plugin detects Webpack if **any** of the following conditions are met:
- `react-scripts` is listed in `dependencies` or `devDependencies`
- `webpack` is listed in `dependencies` or `devDependencies`
- `webpack.config.js` exists in the project root

### 3. Priority Rules
- **Vite takes precedence** - If both Vite and Webpack are detected, Vite will be used
- This allows for gradual migration from Webpack to Vite

## Environment Variables

The plugin handles environment variables differently based on the detected build tool:

### Vite Projects
- Use the `VITE_` prefix for environment variables
- Example: `VITE_API_URL`, `VITE_APP_TITLE`
- Variables are exposed via `import.meta.env`

### Webpack Projects
- Use the `REACT_APP_` prefix for environment variables
- Example: `REACT_APP_API_URL`, `REACT_APP_TITLE`
- Variables are exposed via `process.env`

### Environment Files
Both build tools support the standard `.env` file hierarchy:
- `.env` - Default environment variables
- `.env.local` - Local overrides (not committed to git)
- `.env.production` - Production-specific variables
- `.env.production.local` - Local production overrides

## Project Structure

### Vite Project Structure
```
my-vite-app/
├── index.html          # Entry HTML (at root)
├── vite.config.js      # Vite configuration
├── package.json
├── src/
│   ├── main.tsx        # Entry point (or main.jsx)
│   ├── App.tsx
│   └── ...
└── public/             # Static assets
```

### Webpack (CRA) Project Structure
```
my-react-app/
├── package.json
├── public/
│   └── index.html      # Entry HTML (in public/)
└── src/
    ├── index.tsx       # Entry point (or index.jsx)
    ├── App.tsx
    └── ...
```

## Troubleshooting

### No Build Tool Detected
If you see an error about no supported build tool being detected:

1. **For Vite projects**, ensure you have:
   ```bash
   npm install vite @vitejs/plugin-react --save-dev
   ```

2. **For Webpack projects**, ensure you have:
   ```bash
   npm install react-scripts --save-dev
   ```

### Wrong Build Tool Detected
If the wrong build tool is being detected:

1. Check your `package.json` dependencies
2. Look for conflicting configuration files
3. Remember: Vite takes priority over Webpack

### Migration from Webpack to Vite
If you're migrating from Webpack to Vite:

1. Install Vite dependencies
2. Create a `vite.config.js` file
3. The plugin will automatically detect and use Vite
4. Update environment variables from `REACT_APP_` to `VITE_` prefix
5. Move `index.html` from `public/` to project root
6. Update entry point from `src/index.tsx` to `src/main.tsx` (optional)

## Debugging

To see which build tool was detected, check the CLI output when running commands:
```
Detected build tool: vite
```

For more detailed debugging information, check the plugin logs during validation, build, or serve operations.
