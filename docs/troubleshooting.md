# Troubleshooting Guide

This guide helps you resolve common issues when using the Catalyst React Plugin with Vite or Webpack.

## Table of Contents
- [Build Tool Detection Issues](#build-tool-detection-issues)
- [Vite-Specific Issues](#vite-specific-issues)
- [Webpack-Specific Issues](#webpack-specific-issues)
- [Environment Variable Issues](#environment-variable-issues)
- [Build Errors](#build-errors)
- [Development Server Issues](#development-server-issues)
- [Debug Mode](#debug-mode)

---

## Build Tool Detection Issues

### Error: "No supported build tool detected"

**Symptoms:**
```
Error: No supported build tool detected.
Supported build tools: Vite, Webpack (via react-scripts or direct installation)
```

**Causes:**
- Neither Vite nor Webpack is installed
- Missing configuration files
- Incorrect package.json structure

**Solutions:**

1. **For Vite projects:**
   ```bash
   npm install vite @vitejs/plugin-react --save-dev
   ```

2. **For Webpack projects:**
   ```bash
   npm install react-scripts --save-dev
   ```

3. **Verify package.json:**
   ```json
   {
     "dependencies": {
       "react": "^18.0.0"
     },
     "devDependencies": {
       "vite": "^5.0.0"  // or "react-scripts": "^5.0.0"
     }
   }
   ```

### Wrong Build Tool Detected

**Symptoms:**
- Plugin detects Vite but you want to use Webpack
- Plugin detects Webpack but you want to use Vite

**Cause:**
Both build tools are present in the project (Vite takes priority).

**Solutions:**

1. **To force Webpack:**
   - Remove Vite from dependencies
   - Delete `vite.config.js`

2. **To force Vite:**
   - Ensure Vite is installed
   - Create `vite.config.js` (even if minimal)

3. **Check detection:**
   ```bash
   # The CLI will log which tool was detected
   catalyst serve
   # Look for: "Detected build tool: vite" or "Detected build tool: webpack"
   ```

---

## Vite-Specific Issues

### Error: "Vite is not installed"

**Symptoms:**
```
Error: Vite is not installed in node_modules
```

**Solution:**
```bash
npm install vite @vitejs/plugin-react --save-dev
```

### Error: "Required file missing: index.html"

**Symptoms:**
```
Error: Required file missing: index.html
Expected location: project root
```

**Cause:**
Vite requires `index.html` at the project root, not in `public/`.

**Solution:**

1. **Move index.html:**
   ```bash
   # Windows
   move public\index.html index.html
   
   # Linux/Mac
   mv public/index.html index.html
   ```

2. **Update index.html:**
   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="utf-8" />
       <title>React App</title>
     </head>
     <body>
       <div id="root"></div>
       <script type="module" src="/src/main.tsx"></script>
     </body>
   </html>
   ```

### Error: "Required file missing: entry point"

**Symptoms:**
```
Error: Required file missing: entry point
Expected location: src/main.tsx, src/main.jsx, src/index.tsx, or src/index.jsx
```

**Solution:**

1. **Rename your entry file:**
   ```bash
   # If you have src/index.tsx
   # Vite looks for main.tsx first, but index.tsx also works
   ```

2. **Or create src/main.tsx:**
   ```typescript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import App from './App';
   import './index.css';

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   ```

### Error: "React version must be >= 16.10.0"

**Symptoms:**
```
Error: React version must be >= 16.10.0 for Vite support
Current version: 16.8.0
```

**Solution:**
```bash
npm install react@latest react-dom@latest
```

### Vite Build Fails with Module Errors

**Symptoms:**
```
Error: Failed to resolve import "./Component"
```

**Cause:**
Vite requires explicit file extensions in imports.

**Solution:**

1. **Add file extensions:**
   ```typescript
   // Before
   import Component from './Component';
   
   // After
   import Component from './Component.tsx';
   ```

2. **Or configure Vite:**
   ```javascript
   // vite.config.js
   export default defineConfig({
     resolve: {
       extensions: ['.tsx', '.ts', '.jsx', '.js']
     }
   });
   ```

### HMR Not Working

**Symptoms:**
- Changes don't reflect in browser
- Page requires manual refresh

**Solutions:**

1. **Check Vite dev server is running:**
   ```bash
   catalyst serve
   ```

2. **Verify port is not blocked:**
   ```bash
   # Check if port 3000 is available
   netstat -ano | findstr :3000  # Windows
   lsof -i :3000                 # Linux/Mac
   ```

3. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   ```

---

## Webpack-Specific Issues

### Error: "react-scripts not found"

**Symptoms:**
```
Error: Cannot find module 'react-scripts'
```

**Solution:**
```bash
npm install react-scripts --save-dev
```

### Webpack Build Slow

**Symptoms:**
- Build takes several minutes
- Development server slow to start

**Solutions:**

1. **Consider migrating to Vite:**
   - See [Vite Migration Guide](./vite-migration-guide.md)
   - Vite is 10-50x faster

2. **Optimize Webpack:**
   - Clear cache: `rm -rf node_modules/.cache`
   - Update dependencies: `npm update`

---

## Environment Variable Issues

### Environment Variables Not Accessible

**Symptoms:**
- `process.env.REACT_APP_API_URL` is undefined (Webpack)
- `import.meta.env.VITE_API_URL` is undefined (Vite)

**Solutions:**

1. **Check variable prefix:**
   ```bash
   # Webpack projects - use REACT_APP_ prefix
   REACT_APP_API_URL=https://api.example.com
   
   # Vite projects - use VITE_ prefix
   VITE_API_URL=https://api.example.com
   ```

2. **Verify .env file location:**
   - Must be in project root
   - Not in `src/` or other subdirectories

3. **Restart dev server:**
   ```bash
   # Environment variables are loaded at startup
   # Stop and restart the server after changing .env
   ```

4. **Check .env file format:**
   ```bash
   # Correct
   VITE_API_URL=https://api.example.com
   
   # Incorrect (no spaces around =)
   VITE_API_URL = https://api.example.com
   ```

### Wrong Environment Variables Loaded

**Symptoms:**
- Getting development values in production
- Variables from wrong .env file

**Cause:**
Environment file hierarchy not understood.

**Solution:**

**File Priority (highest to lowest):**
1. `.env.[mode].local` (e.g., `.env.production.local`)
2. `.env.[mode]` (e.g., `.env.production`)
3. `.env.local`
4. `.env`

**Example:**
```bash
# .env (default)
VITE_API_URL=https://dev-api.example.com

# .env.production (overrides .env in production)
VITE_API_URL=https://api.example.com

# .env.local (overrides both, gitignored)
VITE_API_URL=https://localhost:8080
```

---

## Build Errors

### Error: "Build failed with exit code 1"

**Symptoms:**
```
Error: Vite build failed with exit code 1
```

**Solutions:**

1. **Check build logs:**
   - Look for specific error messages above this error
   - Common issues: TypeScript errors, missing dependencies

2. **Verify all dependencies installed:**
   ```bash
   npm install
   ```

3. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

4. **Clear build cache:**
   ```bash
   # Vite
   rm -rf node_modules/.vite
   rm -rf build
   
   # Webpack
   rm -rf node_modules/.cache
   rm -rf build
   ```

### Build Output Missing Files

**Symptoms:**
- Build completes but files missing
- index.html not in build directory

**Solutions:**

1. **Check build output directory:**
   ```javascript
   // vite.config.js
   export default defineConfig({
     build: {
       outDir: 'build'  // Ensure this matches expected directory
     }
   });
   ```

2. **Verify index.html location:**
   - Vite: Must be at project root
   - Webpack: Must be in `public/` directory

### Large Bundle Size Warnings

**Symptoms:**
```
Warning: The bundle size is significantly larger than recommended.
```

**Solutions:**

1. **Enable code splitting:**
   ```typescript
   // Use dynamic imports
   const Component = lazy(() => import('./Component'));
   ```

2. **Analyze bundle:**
   ```bash
   # Vite
   npm install rollup-plugin-visualizer --save-dev
   
   # Add to vite.config.js
   import { visualizer } from 'rollup-plugin-visualizer';
   
   export default defineConfig({
     plugins: [react(), visualizer()]
   });
   ```

3. **Remove unused dependencies:**
   ```bash
   npm uninstall <unused-package>
   ```

---

## Development Server Issues

### Error: "Port already in use"

**Symptoms:**
```
Error: Port 3000 is already in use
```

**Solutions:**

1. **Use different port:**
   ```bash
   # The CLI will automatically try another port
   # Or specify in vite.config.js
   export default defineConfig({
     server: {
       port: 3001
     }
   });
   ```

2. **Kill process using port:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

### Dev Server Won't Start

**Symptoms:**
- Server starts but immediately crashes
- No error message displayed

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version
   # Should be >= 12.0.0
   ```

2. **Clear all caches:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **Check for conflicting processes:**
   ```bash
   # Ensure no other dev servers running
   ps aux | grep vite    # Linux/Mac
   tasklist | findstr vite  # Windows
   ```

### Browser Doesn't Auto-Open

**Symptoms:**
- Dev server starts successfully
- Browser doesn't open automatically

**Cause:**
This is expected behavior - the plugin doesn't auto-open by default.

**Solution:**

Manually open the URL shown in the terminal:
```
Local:   http://localhost:3000/
```

Or configure auto-open in `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    open: true
  }
});
```

---

## Debug Mode

### Enable Verbose Logging

To get more detailed information about what the plugin is doing:

1. **Check CLI output:**
   ```bash
   catalyst serve
   # Look for: "Detected build tool: vite"
   ```

2. **Enable Node.js debugging:**
   ```bash
   NODE_DEBUG=* catalyst serve
   ```

3. **Check build tool logs:**
   ```bash
   # Vite shows detailed logs by default
   # Webpack logs are in the terminal
   ```

### Inspect Build Tool Detection

Create a test script to see detection details:

```javascript
// test-detection.js
const BuildToolDetector = require('./lib/detector/build-tool-detector');

const detector = new BuildToolDetector(process.cwd());
try {
  const details = detector.getDetails();
  console.log('Detection Details:', JSON.stringify(details, null, 2));
} catch (error) {
  console.error('Detection Error:', error.message);
}
```

Run it:
```bash
node test-detection.js
```

### Common Debug Checks

1. **Verify package.json:**
   ```bash
   cat package.json | grep -E "(vite|react-scripts|webpack)"
   ```

2. **Check config files:**
   ```bash
   ls -la | grep -E "(vite.config|webpack.config)"
   ```

3. **Verify node_modules:**
   ```bash
   ls node_modules | grep -E "(vite|react-scripts)"
   ```

---

## Getting Help

If you're still experiencing issues:

1. **Check existing documentation:**
   - [Build Tool Detection](./build-tool-detection.md)
   - [Vite Migration Guide](./vite-migration-guide.md)
   - [API Documentation](./api-documentation.md)

2. **Gather information:**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - Plugin version: Check `package.json`
   - Build tool detected: Check CLI output
   - Full error message and stack trace

3. **Create minimal reproduction:**
   - Isolate the issue in a small project
   - Include package.json and config files

4. **Open an issue:**
   - Include all gathered information
   - Describe expected vs actual behavior
   - Provide reproduction steps

---

## FAQ

### Q: Can I use both Vite and Webpack in the same project?

**A:** The plugin will detect and use Vite (priority). To use Webpack, remove Vite dependencies and config.

### Q: How do I switch from Webpack to Vite?

**A:** Follow the [Vite Migration Guide](./vite-migration-guide.md).

### Q: Will my existing Webpack project still work?

**A:** Yes! The plugin maintains 100% backward compatibility with Webpack projects.

### Q: Can I customize the build configuration?

**A:** Yes, create `vite.config.js` (Vite) or `webpack.config.js` (Webpack) in your project root.

### Q: Why is Vite so much faster?

**A:** Vite uses native ES modules and doesn't bundle during development, resulting in instant server start and fast HMR.

### Q: Do I need to change my code when switching to Vite?

**A:** Minimal changes needed:
- Update environment variable prefixes (`REACT_APP_` → `VITE_`)
- Move `index.html` to project root
- Update imports to use `import.meta.env` instead of `process.env`

### Q: What if I encounter a bug?

**A:** Open an issue on the repository with:
- Detailed description
- Steps to reproduce
- Environment information
- Error messages

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Create React App Documentation](https://create-react-app.dev/)
- [Catalyst CLI Documentation](https://catalyst.zoho.com/help/cli-init.html)
- [React Documentation](https://react.dev/)
