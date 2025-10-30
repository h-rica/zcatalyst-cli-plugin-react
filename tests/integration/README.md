# Integration Tests

This directory contains end-to-end integration tests for the Catalyst React Plugin modernization.

## Test Structure

### Fixtures (`../fixtures/`)

- **vite-project/**: A minimal Vite + React + TypeScript project
  - Includes vite.config.js with React plugin
  - TypeScript configuration (tsconfig.json)
  - Sample React components (App.tsx)
  - Entry point at src/main.tsx
  - index.html at project root

- **webpack-project/**: A standard Create React App project
  - Uses react-scripts
  - TypeScript configuration
  - Sample React components
  - Entry point at src/index.tsx
  - index.html in public/ directory

### Test Files

#### `vite-workflow.test.js`
Tests the complete Vite workflow including:
- Build tool detection from package.json and vite.config.js
- Project structure validation
- TypeScript support verification
- Configuration validation
- Adapter method functionality

#### `webpack-workflow.test.js`
Tests the complete Webpack workflow including:
- Build tool detection from react-scripts
- CRA project structure validation
- TypeScript support verification
- Backward compatibility with existing projects
- Standard CRA scripts support

#### `migration.test.js`
Tests migration scenarios including:
- Webpack to Vite migration
- Build tool priority logic (Vite over Webpack)
- Configuration coexistence
- Project structure adaptation
- Detection from config files vs package.json

## Running Tests

```bash
# Run all tests
npm test

# Run only integration tests
npm test -- tests/integration

# Run specific integration test
npm test -- tests/integration/vite-workflow.test.js
```

## Test Coverage

The integration tests validate:

✅ Build tool detection logic
✅ Project structure requirements
✅ TypeScript support
✅ Configuration file handling
✅ Adapter interface implementation
✅ Migration scenarios
✅ Backward compatibility
✅ Priority logic when multiple tools present

## Notes

- Integration tests use real project fixtures (no mocking)
- Tests verify file structure and configuration validity
- Migration tests create temporary copies to avoid modifying fixtures
- All tests clean up after themselves (build directories, temp files)
