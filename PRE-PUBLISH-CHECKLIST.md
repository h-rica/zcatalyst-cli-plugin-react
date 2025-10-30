# Pre-Publish Checklist

Use this checklist before publishing `@hr/zcatalyst-cli-plugin-react` to npm.

## Code Quality

- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is properly formatted
- [ ] No console.log or debug statements in production code
- [ ] All TypeScript types are correct (if applicable)

## Documentation

- [ ] README.md is up to date
- [ ] CHANGELOG.md includes all changes for this version
- [ ] API documentation is current
- [ ] Migration guides are accurate
- [ ] All code examples work

## Package Configuration

- [ ] package.json version is correct
- [ ] package.json name is `@hr/zcatalyst-cli-plugin-react`
- [ ] package.json description is accurate
- [ ] package.json keywords are relevant
- [ ] package.json author/homepage/repository are correct
- [ ] package.json files array includes all necessary files
- [ ] package.json excludes test files and dev artifacts
- [ ] peerDependencies are correct
- [ ] dependencies are up to date

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Tested with Vite projects
- [ ] Tested with Webpack projects
- [ ] Tested migration scenarios
- [ ] No failing tests

## Build & Files

- [ ] Run `npm pack --dry-run` to verify package contents
- [ ] Verify lib/ directory contains all necessary files
- [ ] Verify docs/ directory is included
- [ ] Verify no sensitive files are included
- [ ] Check package size is reasonable

## Git

- [ ] All changes are committed
- [ ] Working directory is clean
- [ ] On the correct branch (main/master)
- [ ] Branch is up to date with remote
- [ ] No merge conflicts

## npm

- [ ] Logged in to npm (`npm whoami`)
- [ ] Have access to publish scoped packages
- [ ] Package name is available (first publish only)
- [ ] Version number doesn't conflict with existing versions

## Security

- [ ] No security vulnerabilities (`npm audit`)
- [ ] No exposed secrets or API keys
- [ ] Dependencies are from trusted sources
- [ ] No malicious code

## Compatibility

- [ ] Works with Node.js >= 12.0.0
- [ ] Works with zcatalyst-cli >= 1.13.2
- [ ] Backward compatible with existing projects
- [ ] Breaking changes are documented

## Final Checks

- [ ] Version number follows semantic versioning
- [ ] CHANGELOG.md has entry for this version
- [ ] Release notes are prepared
- [ ] Know how to rollback if needed
- [ ] Have tested installation in a fresh project

## Post-Publish

After publishing, verify:

- [ ] Package appears on npm: https://www.npmjs.com/package/@hr/zcatalyst-cli-plugin-react
- [ ] Can install: `npm install @hr/zcatalyst-cli-plugin-react`
- [ ] Installation works in a test project
- [ ] Documentation links work
- [ ] Git tags are pushed
- [ ] Release announcement is ready

## Quick Commands

```bash
# Check what will be published
npm pack --dry-run

# Check npm login
npm whoami

# Run all tests
npm test

# Check for security issues
npm audit

# Verify package info
npm view @hr/zcatalyst-cli-plugin-react

# Test installation
mkdir test-install && cd test-install
npm init -y
npm install @hr/zcatalyst-cli-plugin-react
```

## Emergency Rollback

If something goes wrong after publishing:

1. **Deprecate the version** (preferred):
   ```bash
   npm deprecate @hr/zcatalyst-cli-plugin-react@1.0.0 "This version has issues. Please use 1.0.1"
   ```

2. **Unpublish** (only within 72 hours, not recommended):
   ```bash
   npm unpublish @hr/zcatalyst-cli-plugin-react@1.0.0
   ```

3. **Publish a fix**:
   ```bash
   # Fix the issue
   npm version patch
   npm publish --access public
   ```

## Notes

- First publish requires `--access public` for scoped packages
- Subsequent publishes don't need the access flag
- Can't republish the same version number
- Unpublishing is discouraged and has time limits
- Always prefer deprecation over unpublishing
