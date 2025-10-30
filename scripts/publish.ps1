# PowerShell deployment script for @hr/zcatalyst-cli-plugin-react
# This script helps ensure a safe and consistent publishing process on Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting deployment process for @hr/zcatalyst-cli-plugin-react" -ForegroundColor Cyan
Write-Host ""

# Check if we're on the main branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "⚠️  Warning: You're not on the main/master branch (current: $currentBranch)" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Check for uncommitted changes
$gitStatus = git status -s
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    git status -s
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Check if logged in to npm
Write-Host "📦 Checking npm authentication..." -ForegroundColor Cyan
try {
    $npmUser = npm whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "✅ Logged in as: $npmUser" -ForegroundColor Green
} catch {
    Write-Host "❌ You're not logged in to npm" -ForegroundColor Red
    Write-Host "Please run: npm login" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Cyan
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed! Please fix the issues before publishing." -ForegroundColor Red
    exit 1
}
Write-Host "✅ All tests passed" -ForegroundColor Green
Write-Host ""

# Show what will be published
Write-Host "📋 Files that will be published:" -ForegroundColor Cyan
npm pack --dry-run
Write-Host ""

# Get current version
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "📌 Current version: $currentVersion" -ForegroundColor Cyan
Write-Host ""

# Ask for version bump type
Write-Host "Select version bump type:" -ForegroundColor Cyan
Write-Host "  1) patch (bug fixes)"
Write-Host "  2) minor (new features)"
Write-Host "  3) major (breaking changes)"
Write-Host "  4) Skip version bump"
Write-Host ""
$versionChoice = Read-Host "Enter choice (1-4)"

switch ($versionChoice) {
    "1" {
        Write-Host "Bumping patch version..." -ForegroundColor Cyan
        npm version patch
    }
    "2" {
        Write-Host "Bumping minor version..." -ForegroundColor Cyan
        npm version minor
    }
    "3" {
        Write-Host "Bumping major version..." -ForegroundColor Cyan
        npm version major
    }
    "4" {
        Write-Host "Skipping version bump" -ForegroundColor Cyan
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

# Get new version
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$newVersion = $packageJson.version
Write-Host "📌 New version: $newVersion" -ForegroundColor Cyan
Write-Host ""

# Final confirmation
Write-Host "⚠️  Ready to publish @hr/zcatalyst-cli-plugin-react@$newVersion to npm" -ForegroundColor Yellow
$confirm = Read-Host "Are you sure? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 1
}

# Publish to npm
Write-Host "📤 Publishing to npm..." -ForegroundColor Cyan
npm publish --access public
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Publishing failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Successfully published @hr/zcatalyst-cli-plugin-react@$newVersion" -ForegroundColor Green
Write-Host ""

# Push to git
Write-Host "📤 Pushing to git..." -ForegroundColor Cyan
git push origin $currentBranch
git push origin --tags
Write-Host "✅ Pushed to git" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify on npm: https://www.npmjs.com/package/@hr/zcatalyst-cli-plugin-react"
Write-Host "  2. Test installation: npm install @hr/zcatalyst-cli-plugin-react"
Write-Host "  3. Update documentation if needed"
Write-Host "  4. Announce the release"
