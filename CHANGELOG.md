# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-05

### Added

#### Cross-Platform Support
- ✅ **Linux Support**: Full support for major Linux distributions (Ubuntu/Debian, Fedora, RHEL/CentOS, Arch, openSUSE)
- ✅ **Package Manager Detection**: Automatically detects and uses the appropriate package manager
  - macOS: Homebrew
  - Debian/Ubuntu: apt
  - Fedora: dnf
  - RHEL/CentOS: yum
  - Arch Linux: pacman
  - openSUSE: zypper

#### Modular Architecture
- ✅ **Core Modules**: Separated business logic into reusable modules
  - `core/package-manager.ts`: OS and package manager detection
  - `core/tool-config.ts`: Centralized tool configurations
- ✅ **Installers Module**: Unified installation interface
  - `installers/unified-installer.ts`: Single entry point for all installations
- ✅ **Validators Module**: Environment checking and validation
  - `validators/environment-validator.ts`: System status and recommendations
- ✅ **Utilities**: Enhanced shell utilities with cross-platform support

#### New Tools Support
- ✅ **Git**: Version control system
- ✅ **Docker**: Container platform
- ✅ **Java**: OpenJDK 17
- ✅ **Go**: Go programming language
- ✅ **Rust**: Rust with cargo

#### MCP Tools
- ✅ **get_system_info**: Get detailed system information
- ✅ **install_package_manager**: Install package manager if needed
- ✅ **install_tool**: Install any configured tool with unified interface
- ✅ **install_multiple**: Install multiple tools at once

#### Testing & Quality
- ✅ **Unit Tests**: Comprehensive test suite with Jest
  - Package manager detection tests
  - Tool configuration tests
  - Shell utilities tests
- ✅ **Test Commands**: 
  - `npm test`: Run all tests
  - `npm run test:watch`: Watch mode
  - `npm run test:coverage`: Coverage reports
- ✅ **Type Safety**: Strict TypeScript configuration
- ✅ **Lint Command**: `npm run lint` for type checking

#### Documentation
- ✅ **AGENTS.md**: Complete guide for AI agents
  - Architecture overview
  - Module descriptions
  - Development guidelines
  - Common agent tasks
- ✅ **API.md**: Full API reference
  - All modules documented
  - Function signatures
  - Examples for each function
- ✅ **DEVELOPMENT.md**: Developer guide
  - Setup instructions
  - Development workflow
  - Adding new features
  - Code style guidelines
- ✅ **Enhanced README.md**: Production-ready documentation
  - Quick start guide
  - Feature overview
  - Cross-platform support details
  - Usage examples

### Changed

#### Breaking Changes
- 🔄 **Version**: Bumped to 2.0.0 to reflect major architectural changes
- 🔄 **Module System**: Migrated to modular architecture (backward compatible)
- 🔄 **OS Support**: Changed error message for unsupported OS to mention Linux support

#### Improvements
- ⚡ **Performance**: Parallel package manager detection
- ⚡ **Error Handling**: Better error messages and structured results
- ⚡ **Code Organization**: Separated concerns into dedicated modules
- ⚡ **Maintainability**: Easier to test and extend
- ⚡ **Shell Configuration**: Improved PATH and environment variable setup
  - Detects zsh, bash automatically
  - Different config files for macOS (.bash_profile) and Linux (.bashrc)

### Fixed
- 🐛 **Shell Config Path**: Fixed for Linux systems
- 🐛 **TypeScript Errors**: Resolved type compatibility issues
- 🐛 **Build Process**: Improved reliability

### Technical Details

#### New File Structure
```
src/
├── core/                      # Core business logic
│   ├── package-manager.ts     # OS and package manager detection
│   └── tool-config.ts         # Tool definitions
├── installers/                # Installation modules
│   └── unified-installer.ts   # Unified installation
├── validators/                # Validation modules
│   └── environment-validator.ts # Environment checking
├── __tests__/                # Unit tests
│   ├── package-manager.test.ts
│   ├── tool-config.test.ts
│   └── shell.test.ts
└── index.ts                  # Main MCP server
```

#### Key Interfaces

**SystemInfo**:
```typescript
interface SystemInfo {
  os: OperatingSystem;
  platform: string;
  arch: string;
  packageManager: PackageManagerInfo | null;
}
```

**InstallResult**:
```typescript
interface InstallResult {
  success: boolean;
  message: string;
  details?: string;
  needsRestart?: boolean;
}
```

#### Supported Package Managers
- Homebrew (macOS)
- apt (Debian/Ubuntu)
- dnf (Fedora)
- yum (RHEL/CentOS)
- pacman (Arch Linux)
- zypper (openSUSE)

#### Tool Configuration System
Each tool now has a unified configuration with:
- Display name and description
- Command to check installation
- Installation methods for each package manager
- Optional environment variables
- Optional shell configuration
- Manual installation URLs

## [1.0.0] - 2024-01-01

### Initial Release
- Basic MCP server functionality
- macOS support only
- Homebrew integration
- Python installation
- Node.js installation (via nvm)
- Flutter SDK installation
- Android Studio installation
- Environment checking

---

## Migration Guide (1.x to 2.x)

### For Users
No changes required! Version 2.0 is backward compatible. All existing MCP tools continue to work.

### For Developers
If you're extending the codebase:

1. **Use new modular functions**:
   ```typescript
   // Old way
   import { installPython } from './tools/install.js';
   
   // New way (recommended)
   import { installTool } from './installers/unified-installer.js';
   const result = await installTool('python');
   ```

2. **Add new tools via configuration**:
   - Add to `TOOL_CONFIGS` in `src/core/tool-config.ts`
   - Installation happens automatically via unified installer

3. **Tests are now available**:
   - Add tests for new features in `src/__tests__/`
   - Run tests with `npm test`

### For AI Agents
- See AGENTS.md for comprehensive integration guide
- API.md has complete API reference
- All modules are well-documented with examples

---

## Upcoming Features

### Planned for v2.1.0
- [ ] Windows support
- [ ] Ruby installation
- [ ] PHP installation
- [ ] Database tools (PostgreSQL, MySQL, MongoDB)
- [ ] More comprehensive test coverage
- [ ] CI/CD integration
- [ ] Interactive setup wizard

### Future Considerations
- [ ] Configuration file support (.devenvrc)
- [ ] Project-specific environment setup
- [ ] Virtual environment management
- [ ] Tool version switching
- [ ] Backup and restore configurations
- [ ] Plugin system for custom tools
