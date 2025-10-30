# Deployment Guide

This guide explains how to publish `@hrica/zcatalyst-cli-plugin-react` to npm.

> **Note**: This is a fork of the official `zcatalyst-cli-plugin-react` from the Zoho Catalyst Team. See [FORK-NOTICE.md](FORK-NOTICE.md) for details.

## Prerequisites

1. **npm Account**: You need an npm account. Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **npm CLI**: Ensure you have npm installed (comes with Node.js)
3. **Authentication**: Log in to npm from your terminal

## Pre-Deployment Checklist

Before publishing, ensure:

- [ ] All tests pass: `npm test`
- [ ] Version number is updated in `package.json`
- [ ] CHANGELOG.md is updated with release notes
- [ ] README.md is up to date
- [ ] All code is committed to git
- [ ] You're on the main/master branch

## Step-by-Step Deployment

### 1. Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### 2. Verify Package Configuration

Check what will be published:

```bash
npm pack --dry-run
```

This shows all files that will be included in the package.

### 3. Run Tests

Ensure all tests pass:

```bash
npm test
```

### 4. Update Version

Use npm's version command to bump the version:

```bash
# For patch release (1.0.0 -> 1.0.1)
npm version patch

# For minor release (1.0.0 -> 1.1.0)
npm version minor

# For major release (1.0.0 -> 2.0.0)
npm version major
```

This will:
- Update version in package.json
- Create a git commit
- Create a git tag

### 5. Publish to npm

For the first publish (scoped package):

```bash
npm publish --access public
```

For subsequent publishes:

```bash
npm publish
```

### 6. Verify Publication

Check that your package is published:

```bash
npm view @hrica/zcatalyst-cli-plugin-react
```

Or visit: https://www.npmjs.com/package/@hrica/zcatalyst-cli-plugin-react

### 7. Push to Git

Push your commits and tags:

```bash
git push origin main
git push origin --tags
```

## Version Management

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x): Breaking changes
- **MINOR** (x.1.x): New features, backward compatible
- **PATCH** (x.x.1): Bug fixes, backward compatible

## Publishing Beta/Alpha Versions

For pre-release versions:

```bash
# Set version to beta
npm version 1.1.0-beta.0

# Publish with beta tag
npm publish --tag beta
```

Users can install beta versions:

```bash
npm install @hrica/zcatalyst-cli-plugin-react@beta
```

## Unpublishing (Emergency Only)

If you need to unpublish (within 72 hours):

```bash
npm unpublish @hrica/zcatalyst-cli-plugin-react@1.0.0
```

**Warning**: Unpublishing is discouraged. Use deprecation instead:

```bash
npm deprecate @hrica/zcatalyst-cli-plugin-react@1.0.0 "This version has critical bugs. Please upgrade to 1.0.1"
```

## Automated Publishing (CI/CD)

For automated publishing via GitHub Actions, create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Add your npm token to GitHub Secrets as `NPM_TOKEN`.

## Post-Deployment

After publishing:

1. **Announce**: Update project documentation and notify users
2. **Monitor**: Watch for issues on GitHub/npm
3. **Update Docs**: Ensure installation instructions reference the new package name
4. **Test Installation**: Try installing in a fresh project:
   ```bash
   npm install @hrica/zcatalyst-cli-plugin-react
   ```

## Troubleshooting

### "You do not have permission to publish"

- Ensure you're logged in: `npm whoami`
- Check package name isn't taken: `npm view @hrica/zcatalyst-cli-plugin-react`
- Verify you have access to the `@hrica` scope

### "Package name too similar to existing package"

- Choose a more unique name or use a scope

### "Version already exists"

- Bump the version number: `npm version patch`

## Support

For issues with deployment:
- npm support: https://www.npmjs.com/support
- GitHub Issues: https://github.com/h-rica/zcatalyst-cli-plugin-react/issues

## Security

To report security vulnerabilities:
- Email: security@example.com
- Or use GitHub Security Advisories
