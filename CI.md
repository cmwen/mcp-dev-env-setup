# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment setup for the project.

## Overview

The project uses GitHub Actions for CI/CD with two main workflows:

1. **CI Workflow** (`ci.yml`) - Runs on every push and pull request
2. **Release Workflow** (`release.yml`) - Runs on version tags

## CI Workflow

**Trigger**: Push to `main` or `develop` branches, and all pull requests

**File**: `.github/workflows/ci.yml`

### Jobs

#### 1. Test Job

Runs tests across multiple OS and Node.js versions.

**Matrix Strategy:**
- OS: Ubuntu Latest, macOS Latest
- Node.js: 18.x, 20.x

**Steps:**
1. Checkout code
2. Setup Node.js with caching
3. Install dependencies (`npm ci --include=dev`)
4. Run linter (`npm run lint`)
5. Build project (`npm run build`)
6. Verify build output exists
7. Test CLI commands
8. Run unit tests (if available)

#### 2. Lint Job

Performs type checking and formatting validation.

**Steps:**
1. TypeScript compiler check
2. Prettier formatting check (if configured)

#### 3. Build Job

Creates distribution build and uploads artifacts.

**Steps:**
1. Build project
2. Upload build artifacts (retained for 7 days)

#### 4. Integration Test Job

Tests the built distribution on multiple platforms.

**Matrix Strategy:**
- OS: Ubuntu Latest, macOS Latest

**Steps:**
1. Download build artifacts
2. Make scripts executable
3. Test CLI commands:
   - `devenv info`
   - `devenv check`
   - `devenv list`
4. Test MCP STDIO mode

## Release Workflow

**Trigger**: Push of tags matching `v*` (e.g., `v2.0.0`)

**File**: `.github/workflows/release.yml`

### Jobs

#### 1. Release Job

Creates GitHub release and publishes to npm.

**Steps:**
1. Checkout code with full history
2. Setup Node.js with npm registry
3. Install dependencies
4. Run tests (lint + build)
5. Extract version from tag
6. Extract changelog for this version
7. Create GitHub Release
8. Publish to npm (if not a pre-release)

**Required Secrets:**
- `GITHUB_TOKEN` (automatically provided)
- `NPM_TOKEN` (must be configured in repository secrets)

#### 2. Build Binaries Job

Creates platform-specific distribution tarballs.

**Matrix Strategy:**
- Ubuntu: linux-x64
- macOS: macos-x64, macos-arm64

**Steps:**
1. Build project
2. Create tarball with dist, package.json, README, LICENSE
3. Upload as release asset

## Setting Up CI/CD

### 1. Repository Setup

1. Push code to GitHub
2. Workflows are automatically activated

### 2. npm Publishing Setup

To enable automatic npm publishing on release:

1. Generate npm token:
   ```bash
   npm login
   npm token create --access=public
   ```

2. Add token to GitHub repository:
   - Go to: Settings → Secrets and variables → Actions
   - Add new secret: `NPM_TOKEN`
   - Paste your npm token

### 3. Branch Protection

Recommended branch protection rules for `main`:

- Require pull request reviews
- Require status checks to pass:
  - `test (ubuntu-latest, 18.x)`
  - `test (ubuntu-latest, 20.x)`
  - `test (macos-latest, 18.x)`
  - `test (macos-latest, 20.x)`
  - `lint`
  - `build`

## Creating a Release

### Automatic Release (Recommended)

1. Update version in `package.json`:
   ```bash
   npm version patch  # or minor, or major
   ```

2. Update CHANGELOG.md with release notes

3. Commit changes:
   ```bash
   git add .
   git commit -m "chore: release v2.1.0"
   ```

4. Push with tags:
   ```bash
   git push origin main --tags
   ```

5. GitHub Actions will automatically:
   - Run all tests
   - Create GitHub release
   - Publish to npm
   - Build platform binaries

### Manual Release

1. Create and push tag:
   ```bash
   git tag v2.1.0
   git push origin v2.1.0
   ```

2. Release workflow will run automatically

## CI Badge

Add CI status badge to README.md:

```markdown
[![CI](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/ci.yml)
```

Replace `USERNAME` and `REPO` with actual values.

## Local CI Testing

### Run Locally with act

Install [act](https://github.com/nektos/act):

```bash
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
```

Run workflows locally:

```bash
# Run CI workflow
act push

# Run specific job
act -j test

# Run with specific event
act pull_request
```

### Manual Testing

Run the same commands as CI:

```bash
# Install dependencies
npm ci --include=dev

# Lint
npm run lint

# Build
npm run build

# Test CLI
node dist/index.js --help
node dist/index.js list
node dist/index.js info

# Test MCP mode (will timeout, that's expected)
timeout 5s node dist/index.js --stdio || echo "MCP mode works"
```

## Troubleshooting

### Build Fails on CI but Works Locally

**Possible causes:**
1. Different Node.js versions
2. Missing devDependencies
3. Platform-specific issues

**Solutions:**
1. Test with same Node.js version as CI
2. Use `npm ci` instead of `npm install`
3. Check CI logs for specific errors

### npm Publish Fails

**Possible causes:**
1. NPM_TOKEN not configured
2. Version already published
3. npm authentication issues

**Solutions:**
1. Verify NPM_TOKEN in repository secrets
2. Bump version number
3. Test npm login locally: `npm whoami`

### Tests Fail on Specific Platform

**Solutions:**
1. Add platform-specific conditions in tests
2. Use `process.platform` checks
3. Skip platform-specific tests where appropriate

## Workflow Customization

### Adding New Test Platforms

Edit `.github/workflows/ci.yml`:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]  # Add windows
    node-version: [18.x, 20.x, 22.x]  # Add Node.js 22
```

### Adding Pre-release Versions

Create pre-release tags:

```bash
git tag v2.1.0-beta.1
git push origin v2.1.0-beta.1
```

Release workflow will:
- Create pre-release on GitHub
- Skip npm publishing (only publishes stable versions)

### Custom Build Steps

Add to build job in `ci.yml`:

```yaml
- name: Custom build step
  run: |
    npm run custom-build
    # Add your custom commands
```

## Security

### Secrets Management

Never commit secrets to the repository. Use GitHub Secrets for:

- `NPM_TOKEN` - npm authentication
- Other API keys or tokens

### Dependency Scanning

GitHub automatically scans dependencies for vulnerabilities. Review:

- Security tab → Dependabot alerts
- Update dependencies regularly: `npm audit fix`

### Code Scanning

Enable GitHub Advanced Security for:

- CodeQL analysis
- Secret scanning
- Dependency review

## Monitoring

### CI Status

Monitor CI status at:
- Actions tab in GitHub repository
- https://github.com/USERNAME/REPO/actions

### Build Times

Optimize slow builds:

1. Use npm caching (already enabled)
2. Reduce test matrix if needed
3. Split large test suites
4. Use build caching for TypeScript

### Failure Notifications

Configure notifications:

1. Watch repository for workflow failures
2. Set up email notifications in GitHub settings
3. Use Slack/Discord webhooks (optional)

## Best Practices

1. **Always run tests locally before pushing**
2. **Keep CI fast** (< 5 minutes total)
3. **Fix broken builds immediately**
4. **Update dependencies regularly**
5. **Review CI logs for warnings**
6. **Tag releases properly** (semantic versioning)
7. **Write good commit messages** (conventional commits)

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
