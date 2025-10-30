# Deployment Scripts

This directory contains scripts to help with publishing `@hr/zcatalyst-cli-plugin-react` to npm.

## Available Scripts

### `publish.ps1` (Windows PowerShell)

Automated deployment script for Windows users.

**Usage:**
```powershell
.\scripts\publish.ps1
```

**What it does:**
1. Checks you're on the correct git branch
2. Verifies no uncommitted changes
3. Confirms npm authentication
4. Runs all tests
5. Shows package preview
6. Prompts for version bump
7. Publishes to npm
8. Pushes to git with tags

### `publish.sh` (Linux/Mac Bash)

Automated deployment script for Linux and Mac users.

**Usage:**
```bash
chmod +x scripts/publish.sh
./scripts/publish.sh
```

**What it does:**
Same as the PowerShell script, but for Unix-based systems.

## Manual Deployment

If you prefer to deploy manually without scripts:

```bash
# 1. Login
npm login

# 2. Test
npm test

# 3. Version bump
npm version patch  # or minor, or major

# 4. Publish
npm publish --access public

# 5. Push
git push origin main
git push origin --tags
```

## Script Features

Both scripts include:
- ✅ Pre-flight checks (git status, npm auth)
- ✅ Automated testing
- ✅ Package preview
- ✅ Interactive version selection
- ✅ Confirmation prompts
- ✅ Automatic git push
- ✅ Error handling
- ✅ Colored output

## Troubleshooting

### Script won't run (Windows)

If you get an execution policy error:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Script won't run (Linux/Mac)

Make the script executable:

```bash
chmod +x scripts/publish.sh
```

### "Command not found" errors

Ensure you have:
- Node.js and npm installed
- Git installed
- Logged in to npm (`npm login`)

## Safety Features

The scripts include safety checks:
- Won't publish with uncommitted changes (with override option)
- Won't publish without passing tests
- Requires confirmation before publishing
- Shows exactly what will be published

## See Also

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Full deployment guide
- [QUICK-START-DEPLOY.md](../QUICK-START-DEPLOY.md) - Quick reference
- [PRE-PUBLISH-CHECKLIST.md](../PRE-PUBLISH-CHECKLIST.md) - Checklist
- [DEPLOYMENT-SUMMARY.md](../DEPLOYMENT-SUMMARY.md) - Summary
