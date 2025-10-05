# AI Agent Integration Guide

This document provides guidance for AI agents (like Claude, ChatGPT, etc.) that want to use or contribute to this MCP server.

## Project Overview

**mcp-dev-env-setup** is a Model Context Protocol (MCP) server that automates the setup of development environments across macOS and Linux systems. It provides intelligent package manager detection and cross-platform tool installation capabilities.

## Architecture

### Core Principles

1. **Modular Design**: The codebase is organized into distinct modules with clear responsibilities
2. **Platform Agnostic**: Automatically detects OS and package manager to provide appropriate installation methods
3. **Extensible**: Easy to add new tools and package managers
4. **Testable**: Comprehensive unit tests for all core functionality

### Module Structure

```
src/
├── core/                      # Core business logic
│   ├── package-manager.ts     # OS and package manager detection
│   └── tool-config.ts         # Tool definitions and configurations
├── installers/                # Installation modules
│   └── unified-installer.ts   # Unified installation logic
├── validators/                # Validation modules
│   └── environment-validator.ts # Environment checking and validation
├── utils/                     # Utility functions
│   ├── shell.ts              # Shell command execution
│   └── check.ts              # Environment checking utilities
├── tools/                     # Legacy tool implementations
│   └── install.ts            # Original installation functions
└── __tests__/                # Unit tests
    ├── package-manager.test.ts
    ├── tool-config.test.ts
    └── shell.test.ts
```

## Key Modules

### 1. Package Manager Detection (`core/package-manager.ts`)

**Purpose**: Automatically detect the operating system and available package manager.

**Key Functions**:
- `detectOS()`: Identifies the current operating system
- `detectPackageManager()`: Finds the available package manager
- `getSystemInfo()`: Returns comprehensive system information
- `installPackage()`: Installs a package using the detected package manager

**Supported Package Managers**:
- **macOS**: Homebrew
- **Linux**: apt (Debian/Ubuntu), dnf (Fedora), yum (RHEL/CentOS), pacman (Arch), zypper (openSUSE)

### 2. Tool Configuration (`core/tool-config.ts`)

**Purpose**: Define installation methods for various development tools across different package managers.

**Structure**:
- Each tool has a configuration object with:
  - Display name and description
  - Command to check if installed
  - Installation methods for each package manager
  - Optional environment variables and shell configuration

**Supported Tools**:
- **Languages**: Python, Java, Go, Rust
- **Runtimes**: Node.js
- **SDKs**: Flutter
- **Tools**: Git, Docker

**Adding New Tools**:
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

### 3. Unified Installer (`installers/unified-installer.ts`)

**Purpose**: Provide a unified interface for installing tools regardless of OS or package manager.

**Key Functions**:
- `installPackageManager()`: Installs the package manager if needed (e.g., Homebrew on macOS)
- `installTool(toolName)`: Installs a tool using its configuration
- `installMultipleTools(toolNames[])`: Installs multiple tools
- `installNvm()`: Special installer for Node Version Manager
- `installAndroidStudio()`: Special installer for Android development

**Installation Flow**:
1. Check if tool is already installed
2. Detect package manager
3. Get tool configuration
4. Execute installation command
5. Run post-install steps
6. Configure shell environment
7. Verify installation

### 4. Environment Validator (`validators/environment-validator.ts`)

**Purpose**: Check the status of development tools and provide recommendations.

**Key Functions**:
- `checkToolInstalled(toolName)`: Check if a specific tool is installed
- `checkAllTools()`: Check all configured tools
- `getSystemStatus()`: Get comprehensive system status
- `isSystemReady(requiredTools[])`: Check if required tools are installed
- `getRecommendations(status)`: Get installation recommendations

## MCP Integration

### Available Tools

The MCP server exposes the following tools:

1. **check_environment**: Check installed development tools
2. **install_homebrew**: Install Homebrew (macOS only)
3. **install_python**: Install Python
4. **install_nodejs**: Install Node.js (with optional version)
5. **install_flutter**: Install Flutter SDK
6. **install_android**: Install Android development tools
7. **setup_all**: Install all development environments

### Adding New MCP Tools

To add a new MCP tool, update `src/index.ts`:

1. Add tool definition to `TOOLS` array:
```typescript
{
  name: 'install_mytool',
  description: 'Install My Tool',
  inputSchema: {
    type: 'object',
    properties: {
      // Add parameters here
    },
  },
}
```

2. Add handler in `setupHandlers()`:
```typescript
case 'install_mytool': {
  const result = await installTool('mytool');
  return {
    content: [
      {
        type: 'text',
        text: this.formatInstallResult(result),
      },
    ],
  };
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Tests are located in `src/__tests__/`. Each module should have corresponding tests.

**Example Test**:
```typescript
import { detectOS, OperatingSystem } from '../core/package-manager';

describe('Package Manager Module', () => {
  it('should detect the operating system', () => {
    const os = detectOS();
    expect(os).toBeDefined();
    expect(Object.values(OperatingSystem)).toContain(os);
  });
});
```

## Development Guidelines

### Code Style

1. Use TypeScript for type safety
2. Export interfaces and types for public APIs
3. Add JSDoc comments for all public functions
4. Use meaningful variable and function names
5. Keep functions focused and single-purpose

### Error Handling

Always return structured results:
```typescript
interface InstallResult {
  success: boolean;
  message: string;
  details?: string;
  needsRestart?: boolean;
}
```

### Platform-Specific Code

Use platform detection functions:
```typescript
import { isMacOS, isLinux, isSupported } from './utils/shell';

if (!isSupported()) {
  return {
    success: false,
    message: 'This OS is not supported',
  };
}
```

## Common Agent Tasks

### Task: Add Support for a New Tool

1. Add tool configuration to `src/core/tool-config.ts`
2. Define installation methods for all supported package managers
3. Add tests in `src/__tests__/tool-config.test.ts`
4. Update documentation

### Task: Add Support for a New Package Manager

1. Add package manager enum to `core/package-manager.ts`
2. Add detection logic in `detectPackageManager()`
3. Update `tool-config.ts` with installation methods
4. Add tests

### Task: Fix Installation Issues

1. Check `validators/environment-validator.ts` to verify tool status
2. Update installation method in `tool-config.ts`
3. Test installation using `installers/unified-installer.ts`
4. Add error handling if needed

### Task: Improve Error Messages

1. Update `InstallResult` messages in installer functions
2. Add more details in error cases
3. Provide actionable recommendations

## Debugging Tips

### Enable Verbose Logging

Add logging to track execution:
```typescript
console.error('[DEBUG]', 'Variable value:', value);
```

### Test Individual Components

```typescript
// Test package manager detection
import { detectPackageManager } from './core/package-manager';
const pm = await detectPackageManager();
console.log(pm);

// Test tool installation
import { installTool } from './installers/unified-installer';
const result = await installTool('python');
console.log(result);
```

### Common Issues

1. **Command not found after installation**: Tool may need shell restart or PATH configuration
2. **Permission denied**: May need sudo for system-wide installations
3. **Package manager not detected**: Ensure package manager is properly installed and in PATH

## Contributing

When contributing:

1. Follow the modular architecture
2. Add tests for new functionality
3. Update documentation
4. Ensure backward compatibility
5. Test on both macOS and Linux (if applicable)

## Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Project Repository](https://github.com/cmwen/mcp-dev-env-setup)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Contact

For questions or issues, please open an issue on the GitHub repository.
