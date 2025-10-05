# Dev Environment Setup Tool

[![CI](https://github.com/cmwen/mcp-dev-env-setup/actions/workflows/ci.yml/badge.svg)](https://github.com/cmwen/mcp-dev-env-setup/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40cmwen%2Fmcp-dev-env-setup.svg)](https://badge.fury.io/js/%40cmwen%2Fmcp-dev-env-setup)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready dual-mode tool that automates the setup of local development environments for Python, Node.js, Flutter, Android, and more across **macOS and Linux** systems.

**🎯 Two Modes:**
- **CLI Mode**: Standalone command-line tool (`devenv` command)
- **MCP Mode**: Model Context Protocol server for AI assistant integration

## ✨ Features

- **Dual Mode Operation**: Use as standalone CLI or MCP server
- **Cross-Platform Support**: Works on both macOS and Linux distributions
- **Intelligent Package Manager Detection**: Automatically detects and uses the appropriate package manager (Homebrew, apt, dnf, yum, pacman, zypper)
- **Modular Architecture**: Clean, testable, and extensible codebase
- **Comprehensive Tool Support**: Python, Node.js, Git, Docker, Java, Go, Rust, Flutter, and more
- **Automated Installation**: One-command setup for entire development stacks
- **Environment Validation**: Check what's installed and get recommendations
- **Shell Configuration**: Automatically configures environment variables and PATH
- **CI/CD Ready**: GitHub Actions workflows included
- **Unit Tested**: Comprehensive test coverage for reliability

## 🚀 Quick Start

### Installation

```bash
npm install -g @cmwen/mcp-dev-env-setup
```

### CLI Mode

Use the `devenv` command for standalone operation:

```bash
# Check installed tools
devenv check

# Get system information
devenv info

# List available tools
devenv list

# Install a tool
devenv install python
devenv install nodejs

# Install multiple tools
devenv install-all

# Get help
devenv --help
```

See [CLI.md](./CLI.md) for complete CLI documentation.

### MCP Mode

Configure in your MCP client (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "dev-env-setup": {
      "command": "npx",
      "args": ["-y", "mcp-dev-env-setup"]
    }
  }
}
```

Or run directly in MCP STDIO mode:

```bash
devenv --mcp
# or
devenv --stdio
```

## 📋 Supported Tools

### Languages
- **Python** - Python 3 with pip
- **Java** - OpenJDK 17
- **Go** - Go programming language
- **Rust** - Rust with cargo

### Runtimes & Tools
- **Node.js** - JavaScript runtime (via nvm or package manager)
- **Git** - Version control
- **Docker** - Container platform

### SDKs & Frameworks
- **Flutter** - Mobile app development SDK
- **Android Studio** - Android development tools

## 🖥️ Supported Systems

### Operating Systems
- **macOS** (Intel and Apple Silicon)
- **Linux** distributions:
  - Debian/Ubuntu (apt)
  - Fedora (dnf)
  - RHEL/CentOS (yum)
  - Arch Linux (pacman)
  - openSUSE (zypper)

### Package Managers
- **Homebrew** (macOS)
- **apt** (Debian/Ubuntu)
- **dnf** (Fedora)
- **yum** (RHEL/CentOS)
- **pacman** (Arch)
- **zypper** (openSUSE)

## 🔧 Available MCP Tools

### 1. check_environment
Check which development tools are currently installed on your system.

```typescript
// Returns status of all tools with versions
```

### 2. install_python
Install Python 3 and pip using the system package manager.

### 3. install_nodejs
Install Node.js with optional version specification.

```typescript
{
  "version": "lts"  // or "18", "20", etc.
}
```

### 4. install_flutter
Install Flutter SDK for mobile app development.

### 5. install_android
Install Android Studio and development tools (including Java).

### 6. setup_all
Install all development environments at once with optional skip list.

```typescript
{
  "skip": ["python", "flutter"]  // Optional: tools to skip
}
```

## 📚 Documentation

- [**CLI Usage Guide**](./CLI.md) - Complete CLI command reference and examples
- [**API Documentation**](./API.md) - Complete API reference for all modules
- [**AI Agents Guide**](./AGENTS.md) - Guide for AI agents to use and extend this project
- [**Development Guide**](./DEVELOPMENT.md) - Setup, development workflow, and contribution guidelines
- [**Quick Start Guide**](./QUICKSTART.md) - Get started in minutes
- [**Usage Examples**](./USAGE.md) - Common usage patterns
- [**Changelog**](./CHANGELOG.md) - Version history and migration guides

## 🏗️ Architecture

The project follows a modular architecture:

```
src/
├── core/                      # Core business logic
│   ├── package-manager.ts     # OS and package manager detection
│   └── tool-config.ts         # Tool definitions and configurations
├── installers/                # Installation modules
│   └── unified-installer.ts   # Unified installation logic
├── validators/                # Validation modules
│   └── environment-validator.ts # Environment checking
├── utils/                     # Utility functions
│   ├── shell.ts              # Shell command execution
│   └── check.ts              # Environment checking utilities
└── __tests__/                # Unit tests
```

### Key Modules

- **Package Manager Detection**: Automatically detects your OS and package manager
- **Tool Configuration**: Defines installation methods for each tool across all platforms
- **Unified Installer**: Provides a single interface for installing any tool
- **Environment Validator**: Checks system status and provides recommendations

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run lint
```

## 🛠️ Development

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/cmwen/mcp-dev-env-setup.git
cd mcp-dev-env-setup

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Adding New Tools

1. Add tool configuration to `src/core/tool-config.ts`:

```typescript
export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  mytool: {
    name: 'mytool',
    displayName: 'My Tool',
    category: ToolCategory.LANGUAGE,
    description: 'Description of my tool',
    commandToCheck: 'mytool',
    versionFlag: '--version',
    installMethods: {
      homebrew: {
        packageManager: PackageManager.HOMEBREW,
        packageName: 'mytool',
      },
      apt: {
        packageManager: PackageManager.APT,
        packageName: 'mytool',
      },
      // Add more package managers...
    },
  },
};
```

2. Add tests in `src/__tests__/`
3. Update documentation

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Keep functions focused and single-purpose
- Use meaningful variable names

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Links

- [Repository](https://github.com/cmwen/mcp-dev-env-setup)
- [Issues](https://github.com/cmwen/mcp-dev-env-setup/issues)
- [Model Context Protocol](https://spec.modelcontextprotocol.io/)

## 💡 Examples

### Check System Status

```typescript
import { getSystemStatus } from './validators/environment-validator';

const status = await getSystemStatus();
console.log(`OS: ${status.os}`);
console.log(`Package Manager: ${status.packageManager?.name}`);
console.log(`Installed tools: ${status.tools.filter(t => t.installed).length}`);
```

### Install Multiple Tools

```typescript
import { installMultipleTools } from './installers/unified-installer';

const results = await installMultipleTools(['python', 'nodejs', 'git']);
for (const [tool, result] of Object.entries(results)) {
  console.log(`${tool}: ${result.success ? '✓' : '✗'}`);
}
```

### Validate Environment

```typescript
import { isSystemReady } from './validators/environment-validator';

const { ready, missing } = await isSystemReady(['python', 'nodejs']);
if (!ready) {
  console.log('Please install:', missing.join(', '));
}
```

## 🙏 Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/anthropics/model-context-protocol)
- TypeScript and Node.js ecosystem

## 📞 Support

- Open an [issue](https://github.com/cmwen/mcp-dev-env-setup/issues) for bugs or feature requests
- Check [documentation](./API.md) for API reference
- See [AGENTS.md](./AGENTS.md) for AI agent integration guide
