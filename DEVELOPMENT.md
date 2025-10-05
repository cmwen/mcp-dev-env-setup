# Development Guide

This guide will help you set up, develop, and contribute to the mcp-dev-env-setup project.

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- macOS or Linux (for testing)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/cmwen/mcp-dev-env-setup.git
cd mcp-dev-env-setup
```

2. Install dependencies:
```bash
npm install --include=dev
```

3. Build the project:
```bash
npm run build
```

## Project Structure

```
mcp-dev-env-setup/
├── src/
│   ├── core/                      # Core business logic
│   │   ├── package-manager.ts     # OS and package manager detection
│   │   └── tool-config.ts         # Tool definitions and configurations
│   ├── installers/                # Installation modules
│   │   └── unified-installer.ts   # Unified installation logic
│   ├── validators/                # Validation modules
│   │   └── environment-validator.ts # Environment checking
│   ├── utils/                     # Utility functions
│   │   ├── shell.ts              # Shell command execution
│   │   └── check.ts              # Legacy checking utilities
│   ├── tools/                     # Legacy tool implementations
│   │   └── install.ts            # Original installation functions
│   ├── __tests__/                # Unit tests
│   └── index.ts                  # Main MCP server
├── dist/                          # Compiled JavaScript (generated)
├── docs/                          # Documentation
├── AGENTS.md                      # AI agent integration guide
├── API.md                         # API documentation
├── README.md                      # Main documentation
├── DEVELOPMENT.md                 # This file
├── package.json                   # Project configuration
└── tsconfig.json                  # TypeScript configuration
```

## Development Workflow

### Building

Build the TypeScript code:
```bash
npm run build
```

The compiled JavaScript will be in the `dist/` directory.

### Development Mode

Run the server in development mode with auto-reload:
```bash
npm run dev
```

### Type Checking

Check for TypeScript errors without building:
```bash
npm run lint
```

### Testing

Tests are configured but require jest to be set up. To run tests:

1. Install jest:
```bash
npm install --include=dev @types/jest jest ts-jest
```

2. Run tests:
```bash
npm test
```

## Adding New Features

### Adding a New Tool

1. **Add tool configuration** in `src/core/tool-config.ts`:

```typescript
export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  // ... existing tools
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
      // Add more package managers as needed
    },
    // Optional: environment variables
    envVars: {
      MYTOOL_HOME: '/usr/local/mytool',
    },
    // Optional: shell configuration
    shellConfig: 'export PATH="$PATH:$MYTOOL_HOME/bin"',
  },
};
```

2. **Add MCP tool handler** in `src/index.ts`:

Add to the `TOOLS` array:
```typescript
{
  name: 'install_mytool',
  description: 'Install My Tool',
  inputSchema: {
    type: 'object',
    properties: {},
  },
}
```

Add handler in the switch statement:
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

3. **Update documentation**:
   - Add tool to README.md
   - Update API.md if needed

4. **Build and test**:
```bash
npm run build
npm run dev
```

### Adding a New Package Manager

1. **Add package manager enum** in `src/core/package-manager.ts`:

```typescript
export enum PackageManager {
  // ... existing managers
  MYNEWPM = 'mynewpm',
}
```

2. **Add detection logic** in `detectPackageManager()`:

```typescript
const managers: Record<string, PackageManagerInfo> = {
  // ... existing managers
  mynewpm: {
    name: PackageManager.MYNEWPM,
    command: 'mynewpm',
    installCmd: 'mynewpm install',
    updateCmd: 'mynewpm update',
    searchCmd: 'mynewpm search',
    available: false,
  },
};
```

3. **Add to check order** based on OS:

```typescript
if (os === OperatingSystem.LINUX) {
  checkOrder = ['apt', 'dnf', 'yum', 'pacman', 'zypper', 'mynewpm'];
}
```

4. **Update tool configurations** in `src/core/tool-config.ts`:

Add installation methods for the new package manager to all relevant tools.

## Code Style Guidelines

### TypeScript

- Use strict TypeScript settings
- Always define types for function parameters and return values
- Use interfaces for complex types
- Export types that are used by other modules

### Naming Conventions

- **Files**: kebab-case (e.g., `package-manager.ts`)
- **Classes**: PascalCase (e.g., `DevEnvSetupServer`)
- **Functions**: camelCase (e.g., `detectPackageManager`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `TOOL_CONFIGS`)
- **Interfaces**: PascalCase (e.g., `PackageManagerInfo`)
- **Enums**: PascalCase (e.g., `OperatingSystem`)

### Documentation

- Add JSDoc comments for all public functions
- Include parameter descriptions
- Include return value descriptions
- Add examples for complex functions

Example:
```typescript
/**
 * Detects the available package manager on the system
 * 
 * @returns Package manager information if found, null otherwise
 * 
 * @example
 * ```typescript
 * const pm = await detectPackageManager();
 * if (pm) {
 *   console.log(`Using ${pm.name}`);
 * }
 * ```
 */
export async function detectPackageManager(): Promise<PackageManagerInfo | null> {
  // ...
}
```

### Error Handling

Always return structured results instead of throwing errors:

```typescript
interface InstallResult {
  success: boolean;
  message: string;
  details?: string;
  needsRestart?: boolean;
}
```

### Async/Await

- Use async/await instead of promises with `.then()`
- Handle errors with try/catch
- Return structured error results

## Testing Guidelines

### Unit Tests

- Place tests in `src/__tests__/`
- Name test files with `.test.ts` extension
- Group related tests with `describe` blocks
- Use descriptive test names

Example:
```typescript
describe('Package Manager Module', () => {
  describe('detectOS', () => {
    it('should detect the operating system', () => {
      const os = detectOS();
      expect(os).toBeDefined();
    });
  });
});
```

### Integration Tests

- Test actual installations in controlled environments
- Use Docker containers for isolated testing
- Test on multiple operating systems

## Debugging

### Enable Verbose Logging

Add debug logging:
```typescript
console.error('[DEBUG]', 'Variable value:', value);
```

### Test Individual Modules

Test modules directly:
```typescript
import { detectPackageManager } from './core/package-manager.js';

const pm = await detectPackageManager();
console.log('Detected package manager:', pm);
```

### Test MCP Server Locally

Run the server and connect a test client:
```bash
npm run dev
```

## Common Issues

### TypeScript Compilation Errors

- Check that all imports have `.js` extensions (required for ESM)
- Verify tsconfig.json is correctly configured
- Run `npm run lint` to check for errors

### Package Manager Not Detected

- Ensure package manager is installed and in PATH
- Check `/etc/os-release` for Linux distribution info
- Verify `detectPackageManager()` logic

### Installation Failures

- Check that package names are correct for each package manager
- Verify installation commands work manually
- Check for permission issues (may need sudo)

### Shell Configuration Issues

- Verify shell config path is correct
- Check that PATH is properly exported
- Test with different shells (bash, zsh)

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Build the project:
```bash
npm run build
```
4. Test the build:
```bash
node dist/index.js
```
5. Commit changes:
```bash
git add .
git commit -m "Release v2.0.0"
git tag v2.0.0
```
6. Push to repository:
```bash
git push origin main --tags
```
7. Publish to npm (if applicable):
```bash
npm publish
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Build and test: `npm run build && npm test`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/my-feature`
7. Create a Pull Request

## Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js API Documentation](https://nodejs.org/api/)

## Support

- GitHub Issues: https://github.com/cmwen/mcp-dev-env-setup/issues
- Documentation: See README.md, API.md, and AGENTS.md

## License

MIT License - see LICENSE file for details.
