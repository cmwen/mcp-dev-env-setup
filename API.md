# API Documentation

Complete API reference for the mcp-dev-env-setup modules.

## Table of Contents

- [Core Modules](#core-modules)
  - [Package Manager](#package-manager)
  - [Tool Configuration](#tool-configuration)
- [Installers](#installers)
  - [Unified Installer](#unified-installer)
- [Validators](#validators)
  - [Environment Validator](#environment-validator)
- [Utilities](#utilities)
  - [Shell Utilities](#shell-utilities)

---

## Core Modules

### Package Manager

**Module**: `src/core/package-manager.ts`

Handles operating system and package manager detection.

#### Enums

##### OperatingSystem

```typescript
enum OperatingSystem {
  MACOS = 'darwin',
  LINUX = 'linux',
  WINDOWS = 'win32',
  UNKNOWN = 'unknown',
}
```

##### PackageManager

```typescript
enum PackageManager {
  HOMEBREW = 'homebrew',
  APT = 'apt',
  DNF = 'dnf',
  YUM = 'yum',
  PACMAN = 'pacman',
  ZYPPER = 'zypper',
  UNKNOWN = 'unknown',
}
```

#### Interfaces

##### PackageManagerInfo

```typescript
interface PackageManagerInfo {
  name: PackageManager;
  command: string;          // Command to invoke package manager
  installCmd: string;       // Command prefix for installing packages
  updateCmd: string;        // Command to update packages
  searchCmd: string;        // Command to search packages
  available: boolean;       // Whether the package manager is available
}
```

##### SystemInfo

```typescript
interface SystemInfo {
  os: OperatingSystem;
  platform: string;
  arch: string;
  packageManager: PackageManagerInfo | null;
}
```

#### Functions

##### detectOS()

Detects the current operating system.

```typescript
function detectOS(): OperatingSystem
```

**Returns**: The detected operating system.

**Example**:
```typescript
import { detectOS, OperatingSystem } from './core/package-manager';

const os = detectOS();
if (os === OperatingSystem.MACOS) {
  console.log('Running on macOS');
}
```

##### detectPackageManager()

Detects the available package manager on the system.

```typescript
async function detectPackageManager(): Promise<PackageManagerInfo | null>
```

**Returns**: Package manager information if found, null otherwise.

**Example**:
```typescript
import { detectPackageManager } from './core/package-manager';

const pm = await detectPackageManager();
if (pm) {
  console.log(`Using ${pm.name}`);
  console.log(`Install command: ${pm.installCmd}`);
}
```

##### getSystemInfo()

Gets comprehensive system information including OS and package manager.

```typescript
async function getSystemInfo(): Promise<SystemInfo>
```

**Returns**: Complete system information.

**Example**:
```typescript
import { getSystemInfo } from './core/package-manager';

const info = await getSystemInfo();
console.log(`OS: ${info.os}`);
console.log(`Architecture: ${info.arch}`);
console.log(`Package Manager: ${info.packageManager?.name}`);
```

##### installPackage()

Installs a package using the detected or specified package manager.

```typescript
async function installPackage(
  packageName: string,
  packageManager?: PackageManagerInfo
): Promise<{
  success: boolean;
  message: string;
  details?: string;
}>
```

**Parameters**:
- `packageName`: Name of the package to install
- `packageManager`: Optional package manager to use (auto-detected if not provided)

**Returns**: Installation result.

**Example**:
```typescript
import { installPackage } from './core/package-manager';

const result = await installPackage('git');
if (result.success) {
  console.log('Git installed successfully');
}
```

##### needsPackageManagerInstall()

Checks if the system needs a package manager to be installed.

```typescript
function needsPackageManagerInstall(os: OperatingSystem): boolean
```

**Parameters**:
- `os`: Operating system to check

**Returns**: True if package manager needs installation (e.g., Homebrew on macOS).

##### getPackageManagerInstallCommand()

Gets the command to install a package manager for the given OS.

```typescript
function getPackageManagerInstallCommand(os: OperatingSystem): string | null
```

**Parameters**:
- `os`: Operating system

**Returns**: Installation command or null if not applicable.

---

### Tool Configuration

**Module**: `src/core/tool-config.ts`

Defines configurations for development tools.

#### Enums

##### ToolCategory

```typescript
enum ToolCategory {
  LANGUAGE = 'language',
  RUNTIME = 'runtime',
  SDK = 'sdk',
  PACKAGE_MANAGER = 'package_manager',
  VERSION_MANAGER = 'version_manager',
}
```

#### Interfaces

##### InstallMethod

```typescript
interface InstallMethod {
  packageManager: PackageManager;
  packageName: string;
  alternativeCommands?: string[];      // Alternative installation commands
  postInstallSteps?: string[];         // Commands to run after installation
}
```

##### ToolConfig

```typescript
interface ToolConfig {
  name: string;
  displayName: string;
  category: ToolCategory;
  description: string;
  commandToCheck: string;              // Command to verify installation
  versionFlag: string;                 // Flag to get version
  installMethods: Record<string, InstallMethod>;  // Installation methods per package manager
  manualInstallUrl?: string;           // URL for manual installation
  envVars?: Record<string, string>;    // Environment variables to set
  shellConfig?: string;                // Shell configuration commands
}
```

#### Functions

##### getToolConfig()

Gets configuration for a specific tool.

```typescript
function getToolConfig(toolName: string): ToolConfig | undefined
```

**Parameters**:
- `toolName`: Name of the tool

**Returns**: Tool configuration or undefined if not found.

**Example**:
```typescript
import { getToolConfig } from './core/tool-config';

const pythonConfig = getToolConfig('python');
if (pythonConfig) {
  console.log(`Command to check: ${pythonConfig.commandToCheck}`);
  console.log(`Version flag: ${pythonConfig.versionFlag}`);
}
```

##### getAllToolNames()

Gets names of all configured tools.

```typescript
function getAllToolNames(): string[]
```

**Returns**: Array of tool names.

**Example**:
```typescript
import { getAllToolNames } from './core/tool-config';

const tools = getAllToolNames();
console.log('Available tools:', tools);
```

##### getToolsByCategory()

Gets all tools in a specific category.

```typescript
function getToolsByCategory(category: ToolCategory): ToolConfig[]
```

**Parameters**:
- `category`: Tool category

**Returns**: Array of tool configurations.

**Example**:
```typescript
import { getToolsByCategory, ToolCategory } from './core/tool-config';

const languages = getToolsByCategory(ToolCategory.LANGUAGE);
console.log('Programming languages:', languages.map(t => t.displayName));
```

---

## Installers

### Unified Installer

**Module**: `src/installers/unified-installer.ts`

Provides unified installation interface for all tools.

#### Interfaces

##### InstallResult

```typescript
interface InstallResult {
  success: boolean;
  message: string;
  details?: string;
  needsRestart?: boolean;    // Whether shell restart is needed
}
```

#### Functions

##### installPackageManager()

Installs the package manager if needed (e.g., Homebrew on macOS).

```typescript
async function installPackageManager(): Promise<InstallResult>
```

**Returns**: Installation result.

**Example**:
```typescript
import { installPackageManager } from './installers/unified-installer';

const result = await installPackageManager();
if (result.success) {
  console.log(result.message);
  if (result.needsRestart) {
    console.log('Please restart your terminal');
  }
}
```

##### installTool()

Installs a development tool by name.

```typescript
async function installTool(
  toolName: string,
  options?: { version?: string }
): Promise<InstallResult>
```

**Parameters**:
- `toolName`: Name of the tool to install
- `options`: Optional configuration (e.g., version)

**Returns**: Installation result.

**Example**:
```typescript
import { installTool } from './installers/unified-installer';

// Install Python
const pythonResult = await installTool('python');

// Install specific Node.js version
const nodeResult = await installTool('nodejs', { version: '18' });

if (pythonResult.success && nodeResult.success) {
  console.log('Both tools installed successfully');
}
```

##### installMultipleTools()

Installs multiple tools.

```typescript
async function installMultipleTools(
  toolNames: string[]
): Promise<Record<string, InstallResult>>
```

**Parameters**:
- `toolNames`: Array of tool names to install

**Returns**: Map of tool names to installation results.

**Example**:
```typescript
import { installMultipleTools } from './installers/unified-installer';

const results = await installMultipleTools(['python', 'nodejs', 'git']);

for (const [tool, result] of Object.entries(results)) {
  console.log(`${tool}: ${result.success ? 'success' : 'failed'}`);
}
```

##### installNvm()

Installs Node Version Manager (nvm).

```typescript
async function installNvm(): Promise<InstallResult>
```

**Returns**: Installation result.

**Example**:
```typescript
import { installNvm } from './installers/unified-installer';

const result = await installNvm();
```

##### installNodeViaTarget()

Installs Node.js via nvm with version specification.

```typescript
async function installNodeViaTarget(version?: string): Promise<InstallResult>
```

**Parameters**:
- `version`: Node.js version (default: 'lts')

**Returns**: Installation result.

**Example**:
```typescript
import { installNodeViaTarget } from './installers/unified-installer';

// Install LTS version
const ltsResult = await installNodeViaTarget('lts');

// Install specific version
const v18Result = await installNodeViaTarget('18');
```

##### installAndroidStudio()

Installs Android Studio and development tools.

```typescript
async function installAndroidStudio(): Promise<InstallResult>
```

**Returns**: Installation result.

**Example**:
```typescript
import { installAndroidStudio } from './installers/unified-installer';

const result = await installAndroidStudio();
if (result.success) {
  console.log(result.message);
}
```

---

## Validators

### Environment Validator

**Module**: `src/validators/environment-validator.ts`

Validates and checks development environment status.

#### Interfaces

##### ToolStatus

```typescript
interface ToolStatus {
  name: string;
  displayName: string;
  installed: boolean;
  version?: string;
  path?: string;
}
```

##### SystemStatus

```typescript
interface SystemStatus {
  os: OperatingSystem;
  platform: string;
  arch: string;
  packageManager: {
    name: string;
    available: boolean;
  } | null;
  tools: ToolStatus[];
}
```

#### Functions

##### checkToolInstalled()

Checks if a specific tool is installed.

```typescript
async function checkToolInstalled(toolName: string): Promise<ToolStatus>
```

**Parameters**:
- `toolName`: Name of the tool to check

**Returns**: Tool status.

**Example**:
```typescript
import { checkToolInstalled } from './validators/environment-validator';

const pythonStatus = await checkToolInstalled('python');
console.log(`Python installed: ${pythonStatus.installed}`);
if (pythonStatus.version) {
  console.log(`Version: ${pythonStatus.version}`);
}
```

##### checkMultipleTools()

Checks multiple tools.

```typescript
async function checkMultipleTools(toolNames: string[]): Promise<ToolStatus[]>
```

**Parameters**:
- `toolNames`: Array of tool names to check

**Returns**: Array of tool statuses.

**Example**:
```typescript
import { checkMultipleTools } from './validators/environment-validator';

const statuses = await checkMultipleTools(['python', 'nodejs', 'git']);
statuses.forEach(status => {
  console.log(`${status.displayName}: ${status.installed ? '✓' : '✗'}`);
});
```

##### checkAllTools()

Checks all configured tools.

```typescript
async function checkAllTools(): Promise<ToolStatus[]>
```

**Returns**: Array of all tool statuses.

**Example**:
```typescript
import { checkAllTools } from './validators/environment-validator';

const allStatuses = await checkAllTools();
const installed = allStatuses.filter(s => s.installed);
console.log(`${installed.length} tools installed`);
```

##### getSystemStatus()

Gets comprehensive system status.

```typescript
async function getSystemStatus(): Promise<SystemStatus>
```

**Returns**: Complete system status.

**Example**:
```typescript
import { getSystemStatus } from './validators/environment-validator';

const status = await getSystemStatus();
console.log(`OS: ${status.os}`);
console.log(`Package Manager: ${status.packageManager?.name}`);
console.log(`Tools installed: ${status.tools.filter(t => t.installed).length}`);
```

##### isSystemReady()

Checks if required tools are installed.

```typescript
async function isSystemReady(
  requiredTools: string[]
): Promise<{
  ready: boolean;
  missing: string[];
  installed: string[];
}>
```

**Parameters**:
- `requiredTools`: Array of required tool names

**Returns**: Readiness status.

**Example**:
```typescript
import { isSystemReady } from './validators/environment-validator';

const readiness = await isSystemReady(['python', 'nodejs', 'git']);
if (readiness.ready) {
  console.log('System is ready for development');
} else {
  console.log('Missing tools:', readiness.missing);
}
```

##### getRecommendations()

Gets installation recommendations based on system status.

```typescript
function getRecommendations(status: SystemStatus): string[]
```

**Parameters**:
- `status`: System status

**Returns**: Array of recommendation strings.

**Example**:
```typescript
import { getSystemStatus, getRecommendations } from './validators/environment-validator';

const status = await getSystemStatus();
const recommendations = getRecommendations(status);
recommendations.forEach(rec => console.log(`- ${rec}`));
```

---

## Utilities

### Shell Utilities

**Module**: `src/utils/shell.ts`

Utilities for shell command execution and system detection.

#### Interfaces

##### CommandResult

```typescript
interface CommandResult {
  stdout: string;
  stderr: string;
  success: boolean;
  error?: string;
}
```

#### Functions

##### executeCommand()

Executes a shell command.

```typescript
async function executeCommand(
  command: string,
  options?: { cwd?: string; timeout?: number }
): Promise<CommandResult>
```

**Parameters**:
- `command`: Command to execute
- `options`: Optional execution options
  - `cwd`: Working directory
  - `timeout`: Timeout in milliseconds (default: 60000)

**Returns**: Command result.

**Example**:
```typescript
import { executeCommand } from './utils/shell';

const result = await executeCommand('python3 --version');
if (result.success) {
  console.log('Output:', result.stdout);
} else {
  console.error('Error:', result.error);
}
```

##### commandExists()

Checks if a command exists in the system.

```typescript
async function commandExists(command: string): Promise<boolean>
```

**Parameters**:
- `command`: Command name to check

**Returns**: True if command exists.

**Example**:
```typescript
import { commandExists } from './utils/shell';

if (await commandExists('python3')) {
  console.log('Python is installed');
}
```

##### getCommandVersion()

Gets the version of a command.

```typescript
async function getCommandVersion(
  command: string,
  versionFlag?: string
): Promise<string | null>
```

**Parameters**:
- `command`: Command name
- `versionFlag`: Version flag (default: '--version')

**Returns**: Version string or null if not available.

**Example**:
```typescript
import { getCommandVersion } from './utils/shell';

const version = await getCommandVersion('python3');
console.log('Python version:', version);
```

##### isMacOS()

Checks if running on macOS.

```typescript
function isMacOS(): boolean
```

**Returns**: True if on macOS.

##### isLinux()

Checks if running on Linux.

```typescript
function isLinux(): boolean
```

**Returns**: True if on Linux.

##### isWindows()

Checks if running on Windows.

```typescript
function isWindows(): boolean
```

**Returns**: True if on Windows.

##### isSupported()

Checks if the system is supported (macOS or Linux).

```typescript
function isSupported(): boolean
```

**Returns**: True if system is supported.

##### getHomeDirectory()

Gets the user's home directory.

```typescript
function getHomeDirectory(): string
```

**Returns**: Home directory path.

##### getShellConfigPath()

Gets the shell configuration file path.

```typescript
function getShellConfigPath(): string
```

**Returns**: Shell config file path (e.g., ~/.zshrc, ~/.bashrc).

**Example**:
```typescript
import { getShellConfigPath } from './utils/shell';

const configPath = getShellConfigPath();
console.log('Shell config:', configPath);
```

##### getOSInfo()

Gets detailed OS information.

```typescript
async function getOSInfo(): Promise<{
  platform: string;
  release: string;
  arch: string;
  distro?: string;
}>
```

**Returns**: OS information including Linux distribution if applicable.

**Example**:
```typescript
import { getOSInfo } from './utils/shell';

const info = await getOSInfo();
console.log('Platform:', info.platform);
if (info.distro) {
  console.log('Distribution:', info.distro);
}
```
