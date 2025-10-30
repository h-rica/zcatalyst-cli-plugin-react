# Quick Start: Deploy to npm

This is a quick reference guide for deploying `@hrica/zcatalyst-cli-plugin-react` to npm.

## Prerequisites

1. npm account (create at [npmjs.com](https://www.npmjs.com/signup))
2. npm CLI installed
3. All tests passing

## Quick Deploy (5 steps)

### 1. Login to npm
```bash
npm login
```

### 2. Verify you're ready
```bash
# Check login
npm whoami

# Run tests
npm test

# Preview package
npm pack --dry-run
```

### 3. Bump version
```bash
# Choose one:
npm version patch   # 1.0.0 -> 1.0.1 (bug fixes)
npm version minor   # 1.0.0 -> 1.1.0 (new features)
npm version major   # 1.0.0 -> 2.0.0 (breaking changes)
```

### 4. Publish
```bash
npm publish --access public
```

### 5. Push to git
```bash
git push origin main
git push origin --tags
```

## Using the Deployment Script (Recommended)

### On Windows (PowerShell):
```powershell
.\scripts\publish.ps1
```

### On Linux/Mac:
```bash
chmod +x scripts/publish.sh
./scripts/publish.sh
```

The script will:
- ✅ Check you're logged in
- ✅ Run all tests
- ✅ Show what will be published
- ✅ Prompt for version bump
- ✅ Publish to npm
- ✅ Push to git

## Verify Deployment

```bash
# Check on npm
npm view @hrica/zcatalyst-cli-plugin-react

# Test installation
mkdir test-project
cd test-project
npm init -y
npm install @hrica/zcatalyst-cli-plugin-react
```

## Troubleshooting

### "You do not have permission to publish"
```bash
# Check you're logged in
npm whoami

# Login if needed
npm login
```

### "Version already exists"
```bash
# Bump version again
npm version patch
npm publish --access public
```

### "Package name too similar"
- The scoped package `@hrica/zcatalyst-cli-plugin-react` should be unique
- Verify the scope `@hrica` is available to you

## Important Notes

- ⚠️ First publish requires `--access public` for scoped packages
- ⚠️ Can't republish the same version number
- ⚠️ Unpublishing has a 72-hour window
- ✅ Always test in a fresh project after publishing
- ✅ Update CHANGELOG.md before publishing

## Next Steps After Publishing

1. Verify on npm: https://www.npmjs.com/package/@hrica/zcatalyst-cli-plugin-react
2. Test installation in a real project
3. Update documentation if needed
4. Announce the release
5. Monitor for issues

## Need Help?

- Full guide: See [DEPLOYMENT.md](DEPLOYMENT.md)
- Checklist: See [PRE-PUBLISH-CHECKLIST.md](PRE-PUBLISH-CHECKLIST.md)
- npm docs: https://docs.npmjs.com/
