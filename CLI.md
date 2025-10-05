# CLI Usage Guide

This guide covers using the Development Environment Setup tool as a standalone CLI application.

## Installation

### Global Installation

```bash
npm install -g mcp-dev-env-setup
```

After installation, you can use the `devenv` command anywhere:

```bash
devenv --help
```

### Local Installation

```bash
npm install mcp-dev-env-setup
```

Run with npx:

```bash
npx devenv --help
```

## Commands

### Check Environment

Check what development tools are installed on your system.

**Check all tools:**
```bash
devenv check
```

**Check specific tool:**
```bash
devenv check --tool python
devenv check --tool git
devenv check --tool nodejs
```

**Example output:**
```
📋 Development Environment Status

System Information:
  OS: darwin
  Architecture: arm64
  Package Manager: homebrew

✅ Installed Tools:

  ✓ Python - Python 3.11.5
  ✓ Git - git version 2.42.0
  ✓ Node.js - v20.10.0

❌ Not Installed:

  ✗ Docker
  ✗ Java
  ✗ Go
```

### System Information

Display detailed system information.

```bash
devenv info
```

**Example output:**
```
💻 System Information

Operating System: darwin
Platform: darwin
Architecture: arm64
Package Manager: homebrew
Install Command: brew install
```

### List Available Tools

List all tools that can be installed.

```bash
devenv list
```

**Example output:**
```
📦 Available Tools:

  • python
  • nodejs
  • git
  • docker
  • java
  • go
  • rust
  • flutter
```

### Install Tools

Install a specific development tool.

**Basic installation:**
```bash
devenv install python
devenv install git
devenv install docker
```

**Install with specific version (for supported tools):**
```bash
devenv install nodejs --version 18
devenv install nodejs --version lts
```

**Example output:**
```
⠋ Installing python...

✅ Python installed successfully

Details:
==> Downloading https://...
...

⚠️  Please restart your terminal for changes to take effect
```

### Install Multiple Tools

Install multiple tools in one command.

**Install all common tools:**
```bash
devenv install-all
```

**Install with skip list:**
```bash
devenv install-all --skip flutter android
```

**Example output:**
```
🚀 Installing Development Environment

Step 1: Package Manager
✅ homebrew is already available

Step 2: Installing Tools
⠋ Installing git...
✅ git: Git installed successfully
⠋ Installing python...
✅ python: Python installed successfully
⠋ Installing nodejs...
✅ nodejs: Node.js lts installed successfully

✨ Setup Complete!

⚠️  Please restart your terminal for all changes to take effect
```

## Common Workflows

### Setting Up a New Development Machine

1. Check what's already installed:
   ```bash
   devenv check
   ```

2. Install package manager (if needed):
   ```bash
   # On macOS, Homebrew will be installed automatically
   # On Linux, package manager is usually pre-installed
   ```

3. Install all common tools:
   ```bash
   devenv install-all
   ```

4. Restart your terminal:
   ```bash
   # Close and reopen terminal or:
   source ~/.zshrc   # for zsh
   source ~/.bashrc  # for bash
   ```

5. Verify installations:
   ```bash
   devenv check
   ```

### Installing Specific Tool Stack

**Python Development:**
```bash
devenv install python
devenv check --tool python
```

**Node.js Development:**
```bash
devenv install nodejs
devenv check --tool nodejs
```

**Full Stack Development:**
```bash
devenv install git
devenv install nodejs
devenv install python
devenv install docker
```

**Mobile Development:**
```bash
devenv install flutter
devenv install android
devenv install java
```

### Checking Tool Versions

```bash
# Check all tools with versions
devenv check

# Check specific tool
devenv check --tool python
devenv check --tool nodejs
```

## Options and Flags

### Global Options

- `-V, --version` - Display version number
- `-h, --help` - Display help information

### Command Options

**check:**
- `-t, --tool <name>` - Check specific tool

**install:**
- `--version <version>` - Specify version (for supported tools)

**install-all:**
- `-s, --skip <tools...>` - Skip specific tools

## Examples

### Quick Start

```bash
# Install globally
npm install -g mcp-dev-env-setup

# Check system
devenv info

# Check installed tools
devenv check

# Install Python
devenv install python

# Install Node.js LTS
devenv install nodejs

# Install everything except Flutter
devenv install-all --skip flutter android
```

### Development Setup

```bash
# Backend development
devenv install python
devenv install nodejs
devenv install docker

# Frontend development
devenv install nodejs
devenv install git

# Mobile development
devenv install flutter
devenv install android
```

### Check Before Installing

```bash
# Check what's missing
devenv check

# Install missing tools
devenv install git
devenv install python
devenv install nodejs
```

## Platform-Specific Notes

### macOS

- **Homebrew** will be installed automatically if not present
- Some installations may require admin password
- Shell configuration is added to `~/.zshrc` or `~/.bash_profile`

### Linux

#### Ubuntu/Debian (apt)
```bash
# Update package lists first
sudo apt update

# Then use devenv
devenv install python
```

#### Fedora (dnf)
```bash
devenv install python
```

#### Arch Linux (pacman)
```bash
devenv install python
```

#### openSUSE (zypper)
```bash
devenv install python
```

## Troubleshooting

### Command Not Found After Installation

**Solution:** Restart your terminal or source your shell configuration:
```bash
source ~/.zshrc   # for zsh
source ~/.bashrc  # for bash
```

### Permission Denied

**Solution:** Some installations require sudo. The tool will use sudo automatically where needed.

### Package Manager Not Detected

**Solution:** 
- macOS: Install Homebrew manually first
- Linux: Ensure your package manager is installed and in PATH

### Tool Still Not Available After Installation

**Solution:**
1. Restart terminal
2. Check PATH: `echo $PATH`
3. Re-run check: `devenv check --tool <name>`

## Environment Variables

The tool automatically configures necessary environment variables for installed tools:

- **Python**: PATH to Python and pip
- **Node.js**: PATH to node and npm, NVM_DIR
- **Java**: JAVA_HOME
- **Android**: ANDROID_HOME, SDK paths
- **Flutter**: PATH to Flutter SDK
- **Go**: GOPATH
- **Rust**: Cargo environment

## Shell Configuration

Shell configuration is automatically added to:
- **zsh**: `~/.zshrc`
- **bash** (macOS): `~/.bash_profile`
- **bash** (Linux): `~/.bashrc`

## Advanced Usage

### Install Specific Node.js Version

```bash
devenv install nodejs --version 18
devenv install nodejs --version 20
devenv install nodejs --version lts
```

### Scripting with devenv

```bash
#!/bin/bash

# Check if Python is installed
if devenv check --tool python; then
  echo "Python is installed"
else
  echo "Installing Python..."
  devenv install python
fi
```

### CI/CD Usage

```yaml
# GitHub Actions example
- name: Setup development environment
  run: |
    npm install -g mcp-dev-env-setup
    devenv install python
    devenv install nodejs
    devenv check
```

## Getting Help

### Command Help

```bash
devenv --help
devenv check --help
devenv install --help
```

### Documentation

- [Main README](../README.md)
- [API Documentation](../API.md)
- [Development Guide](../DEVELOPMENT.md)

### Issues

Report issues: https://github.com/cmwen/mcp-dev-env-setup/issues

## MCP Mode

This tool also supports MCP (Model Context Protocol) STDIO mode for integration with AI assistants:

```bash
# Run in MCP mode (default when no arguments)
devenv

# Or explicitly
devenv --mcp
devenv --stdio
```

See the main [README](../README.md) for MCP integration details.
