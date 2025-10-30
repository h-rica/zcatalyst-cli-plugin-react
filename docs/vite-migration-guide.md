# Migrating from Webpack to Vite

This guide will help you migrate your existing Create React App (Webpack) project to Vite for faster development and optimized builds.

## Why Migrate to Vite?

- **⚡ Lightning Fast** - Instant server start and HMR
- **🔧 Modern Tooling** - Built on native ES modules
- **📦 Optimized Builds** - Smaller bundle sizes with Rollup
- **🎯 Better DX** - Simpler configuration and faster feedback

## Migration Steps

### 1. Install Vite Dependencies

```bash
npm install vite @vitejs/plugin-react --save-dev
```

### 2. Create Vite Configuration

Create a `vite.config.js` file in your project root:

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

### 3. Move index.html

Move `public/index.html` to the project root and update it:

**Before (public/index.html):**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**After (index.html):**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 4. Update Entry Point

Rename `src/index.tsx` to `src/main.tsx` (or keep it as index.tsx and update the script tag in index.html):

**src/main.tsx:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 5. Update Environment Variables

Replace all `REACT_APP_` prefixed environment variables with `VITE_` prefix:

**Before (.env):**
```
REACT_APP_API_URL=https://api.example.com
REACT_APP_ENV=production
```

**After (.env):**
```
VITE_API_URL=https://api.example.com
VITE_ENV=production
```

**Update code references:**
```typescript
// Before
const apiUrl = process.env.REACT_APP_API_URL;

// After
const apiUrl = import.meta.env.VITE_API_URL;
```

### 6. Update Public Asset References

Replace `%PUBLIC_URL%` with absolute paths:

**Before:**
```html
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
<img src={process.env.PUBLIC_URL + '/logo.png'} />
```

**After:**
```html
<link rel="icon" href="/favicon.ico" />
<img src="/logo.png" />
```

### 7. Update TypeScript Configuration (if using TypeScript)

Update `tsconfig.json` to include Vite types:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json` for Vite config:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 8. Add Vite Type Definitions

Create `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENV: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 9. Update Package Scripts (Optional)

While the Catalyst CLI will handle this automatically, you can update your package.json scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 10. Test Your Application

Run the Catalyst CLI commands to verify everything works:

```bash
# Validate the project
catalyst serve

# Build for production
catalyst deploy
```

## Common Issues and Solutions

### Issue: Module not found errors

**Solution:** Vite uses native ES modules. Ensure all imports use file extensions or are properly configured in `vite.config.js`:

```javascript
export default defineConfig({
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  }
});
```

### Issue: CSS imports not working

**Solution:** Vite handles CSS differently. Import CSS files directly:

```typescript
import './App.css'; // This works in Vite
```

### Issue: SVG imports not working

**Solution:** Use Vite's asset import or the React plugin's SVG support:

```typescript
// As URL
import logoUrl from './logo.svg';
<img src={logoUrl} />

// As React component (with @vitejs/plugin-react)
import { ReactComponent as Logo } from './logo.svg?react';
<Logo />
```

### Issue: Environment variables not accessible

**Solution:** Remember to:
1. Prefix with `VITE_` instead of `REACT_APP_`
2. Use `import.meta.env` instead of `process.env`
3. Restart the dev server after changing .env files

### Issue: Build output in wrong directory

**Solution:** Configure the output directory in `vite.config.js`:

```javascript
export default defineConfig({
  build: {
    outDir: 'build' // or 'dist'
  }
});
```

## Rollback Plan

If you need to rollback to Webpack:

1. Remove or rename `vite.config.js`
2. The plugin will automatically detect and use Webpack
3. Revert environment variable changes
4. Move `index.html` back to `public/` directory

## Performance Comparison

After migration, you should see:
- **Dev server start:** ~10-50x faster
- **HMR updates:** Near-instant
- **Build time:** 20-50% faster
- **Bundle size:** 10-30% smaller

## Next Steps

- Review [Vite documentation](https://vitejs.dev/) for advanced features
- Optimize your build with [code splitting](https://vitejs.dev/guide/features.html#code-splitting)
- Configure [PWA support](https://vite-pwa-org.netlify.app/)
- Set up [environment-specific builds](https://vitejs.dev/guide/env-and-mode.html)

## Need Help?

- Check the [Build Tool Detection](./build-tool-detection.md) documentation
- Review Vite's [troubleshooting guide](https://vitejs.dev/guide/troubleshooting.html)
- Open an issue on the plugin repository
