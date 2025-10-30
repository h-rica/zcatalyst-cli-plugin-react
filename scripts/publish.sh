#!/bin/bash

# Deployment script for @hr/zcatalyst-cli-plugin-react
# This script helps ensure a safe and consistent publishing process

set -e  # Exit on error

echo "🚀 Starting deployment process for @hr/zcatalyst-cli-plugin-react"
echo ""

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  Warning: You're not on the main/master branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Check if logged in to npm
echo "📦 Checking npm authentication..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ You're not logged in to npm"
    echo "Please run: npm login"
    exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ Logged in as: $NPM_USER"
echo ""

# Run tests
echo "🧪 Running tests..."
if ! npm test; then
    echo "❌ Tests failed! Please fix the issues before publishing."
    exit 1
fi
echo "✅ All tests passed"
echo ""

# Show what will be published
echo "📋 Files that will be published:"
npm pack --dry-run
echo ""

# Confirm version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 Current version: $CURRENT_VERSION"
echo ""

# Ask for version bump type
echo "Select version bump type:"
echo "  1) patch (bug fixes)       - $CURRENT_VERSION -> $(npm version patch --no-git-tag-version --dry-run 2>/dev/null | tail -1)"
echo "  2) minor (new features)    - $CURRENT_VERSION -> $(npm version minor --no-git-tag-version --dry-run 2>/dev/null | tail -1)"
echo "  3) major (breaking changes)- $CURRENT_VERSION -> $(npm version major --no-git-tag-version --dry-run 2>/dev/null | tail -1)"
echo "  4) Skip version bump"
echo ""
read -p "Enter choice (1-4): " VERSION_CHOICE

case $VERSION_CHOICE in
    1)
        echo "Bumping patch version..."
        npm version patch
        ;;
    2)
        echo "Bumping minor version..."
        npm version minor
        ;;
    3)
        echo "Bumping major version..."
        npm version major
        ;;
    4)
        echo "Skipping version bump"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

NEW_VERSION=$(node -p "require('./package.json').version")
echo "📌 New version: $NEW_VERSION"
echo ""

# Final confirmation
echo "⚠️  Ready to publish @hr/zcatalyst-cli-plugin-react@$NEW_VERSION to npm"
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Publish to npm
echo "📤 Publishing to npm..."
if npm publish --access public; then
    echo "✅ Successfully published @hr/zcatalyst-cli-plugin-react@$NEW_VERSION"
    echo ""
    
    # Push to git
    echo "📤 Pushing to git..."
    git push origin $CURRENT_BRANCH
    git push origin --tags
    echo "✅ Pushed to git"
    echo ""
    
    echo "🎉 Deployment complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Verify on npm: https://www.npmjs.com/package/@hr/zcatalyst-cli-plugin-react"
    echo "  2. Test installation: npm install @hr/zcatalyst-cli-plugin-react"
    echo "  3. Update documentation if needed"
    echo "  4. Announce the release"
else
    echo "❌ Publishing failed"
    exit 1
fi
