/**
 * Unified Installer Module
 * 
 * Provides a unified interface for installing development tools
 * across different operating systems and package managers.
 */

import { executeCommand, commandExists, getShellConfigPath, getHomeDirectory } from '../utils/shell.js';
import {
  detectOS,
  detectPackageManager,
  installPackage,
  getPackageManagerInstallCommand,
  needsPackageManagerInstall,
  OperatingSystem,
  PackageManagerInfo,
} from '../core/package-manager.js';
import { getToolConfig, ToolConfig } from '../core/tool-config.js';
import fs from 'fs/promises';

/**
 * Installation result
 */
export interface InstallResult {
  success: boolean;
  message: string;
  details?: string;
  needsRestart?: boolean;
}

/**
 * Install the package manager if needed (e.g., Homebrew on macOS)
 */
export async function installPackageManager(): Promise<InstallResult> {
  const os = detectOS();

  // Check if the system needs a package manager installed
  if (!needsPackageManagerInstall(os)) {
    const pm = await detectPackageManager();
    if (pm) {
      return {
        success: true,
        message: `Package manager ${pm.name} is already available`,
      };
    }
    return {
      success: false,
      message: 'No package manager detected and none can be auto-installed for this OS',
    };
  }

  // Check if already installed
  const existingPM = await detectPackageManager();
  if (existingPM) {
    return {
      success: true,
      message: `${existingPM.name} is already installed`,
    };
  }

  // Get installation command
  const installCmd = getPackageManagerInstallCommand(os);
  if (!installCmd) {
    return {
      success: false,
      message: 'Cannot determine package manager installation command',
    };
  }

  // Install the package manager
  const result = await executeCommand(installCmd, { timeout: 600000 });

  // Verify installation
  const pm = await detectPackageManager();
  if (pm) {
    return {
      success: true,
      message: `${pm.name} installed successfully`,
      details: result.stdout,
      needsRestart: true,
    };
  }

  return {
    success: false,
    message: 'Failed to install package manager',
    details: result.error || result.stderr,
  };
}

/**
 * Install a development tool using its configuration
 */
export async function installTool(
  toolName: string,
  options?: { version?: string }
): Promise<InstallResult> {
  // Get tool configuration
  const toolConfig = getToolConfig(toolName);
  if (!toolConfig) {
    return {
      success: false,
      message: `Unknown tool: ${toolName}`,
    };
  }

  // Check if already installed
  const alreadyInstalled = await commandExists(toolConfig.commandToCheck);
  if (alreadyInstalled) {
    return {
      success: true,
      message: `${toolConfig.displayName} is already installed`,
    };
  }

  // Detect package manager
  const packageManager = await detectPackageManager();
  if (!packageManager) {
    return {
      success: false,
      message: 'No package manager available. Please install a package manager first.',
    };
  }

  // Get installation method for this package manager
  const installMethod = toolConfig.installMethods[packageManager.name];
  if (!installMethod) {
    return {
      success: false,
      message: `${toolConfig.displayName} installation not supported on ${packageManager.name}`,
      details: toolConfig.manualInstallUrl
        ? `Please install manually: ${toolConfig.manualInstallUrl}`
        : undefined,
    };
  }

  try {
    let installSuccess = false;
    let installDetails = '';

    // Try standard package manager installation
    const packageCmd = `${packageManager.installCmd} ${installMethod.packageName}`;
    const packageResult = await executeCommand(packageCmd, { timeout: 600000 });

    if (packageResult.success) {
      installSuccess = true;
      installDetails = packageResult.stdout;
    } else if (installMethod.alternativeCommands) {
      // Try alternative installation commands
      for (const altCmd of installMethod.alternativeCommands) {
        const altResult = await executeCommand(altCmd, { timeout: 600000 });
        if (altResult.success) {
          installSuccess = true;
          installDetails = altResult.stdout;
          break;
        }
      }
    }

    if (!installSuccess) {
      return {
        success: false,
        message: `Failed to install ${toolConfig.displayName}`,
        details: packageResult.error || packageResult.stderr,
      };
    }

    // Execute post-install steps
    if (installMethod.postInstallSteps) {
      for (const step of installMethod.postInstallSteps) {
        await executeCommand(step, { timeout: 120000 });
      }
    }

    // Configure shell environment if needed
    let needsRestart = false;
    if (toolConfig.shellConfig || toolConfig.envVars) {
      const configured = await configureShellEnvironment(toolConfig);
      needsRestart = configured;
    }

    // Verify installation
    const verified = await commandExists(toolConfig.commandToCheck);
    if (verified || needsRestart) {
      return {
        success: true,
        message: `${toolConfig.displayName} installed successfully`,
        details: installDetails,
        needsRestart,
      };
    }

    return {
      success: false,
      message: `${toolConfig.displayName} installation completed but verification failed`,
      details: 'The tool may require a shell restart to be available',
      needsRestart: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error installing ${toolConfig.displayName}: ${error.message}`,
    };
  }
}

/**
 * Configure shell environment for a tool
 */
async function configureShellEnvironment(toolConfig: ToolConfig): Promise<boolean> {
  const shellConfigPath = getShellConfigPath();
  let configContent = '';

  // Build configuration content
  if (toolConfig.envVars) {
    configContent += `\n# ${toolConfig.displayName} Configuration\n`;
    for (const [key, value] of Object.entries(toolConfig.envVars)) {
      configContent += `export ${key}="${value}"\n`;
    }
  }

  if (toolConfig.shellConfig) {
    configContent += `${toolConfig.shellConfig}\n`;
  }

  if (!configContent) {
    return false;
  }

  try {
    // Read existing configuration
    let existingContent = '';
    try {
      existingContent = await fs.readFile(shellConfigPath, 'utf-8');
    } catch (error) {
      // File doesn't exist, will be created
    }

    // Check if configuration already exists
    if (existingContent.includes(`# ${toolConfig.displayName} Configuration`)) {
      return false;
    }

    // Append configuration
    await fs.appendFile(shellConfigPath, configContent);
    return true;
  } catch (error: any) {
    console.error(`Failed to configure shell for ${toolConfig.displayName}:`, error.message);
    return false;
  }
}

/**
 * Install multiple tools
 */
export async function installMultipleTools(
  toolNames: string[]
): Promise<Record<string, InstallResult>> {
  const results: Record<string, InstallResult> = {};

  for (const toolName of toolNames) {
    results[toolName] = await installTool(toolName);
  }

  return results;
}

/**
 * Install NVM (Node Version Manager) - Special case installer
 */
export async function installNvm(): Promise<InstallResult> {
  const nvmExists = await commandExists('nvm');
  if (nvmExists) {
    return {
      success: true,
      message: 'nvm is already installed',
    };
  }

  // Install nvm
  const installCommand =
    'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash';
  const result = await executeCommand(installCommand, { timeout: 120000 });

  // Add nvm to shell config
  const shellConfig = getShellConfigPath();
  const nvmConfig = `
# NVM Configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \\. "$NVM_DIR/bash_completion"
`;

  try {
    const content = await fs.readFile(shellConfig, 'utf-8');
    if (!content.includes('NVM_DIR')) {
      await fs.appendFile(shellConfig, nvmConfig);
    }
  } catch (error) {
    await fs.writeFile(shellConfig, nvmConfig);
  }

  return {
    success: true,
    message: 'nvm installed successfully',
    details: result.stdout,
    needsRestart: true,
  };
}

/**
 * Install Node.js via nvm with version specification
 */
export async function installNodeViaTarget(version: string = 'lts'): Promise<InstallResult> {
  // Check if Node.js is already installed
  const nodeExists = await commandExists('node');
  if (nodeExists) {
    return {
      success: true,
      message: 'Node.js is already installed',
    };
  }

  // Check if nvm is installed
  const nvmExists = await commandExists('nvm');
  if (!nvmExists) {
    // Try to install nvm first
    const nvmResult = await installNvm();
    if (!nvmResult.success) {
      // Fallback to package manager installation
      return await installTool('nodejs');
    }
  }

  // Install Node.js via nvm
  const nvmDir = process.env.NVM_DIR || `${getHomeDirectory()}/.nvm`;
  const installCommand = `bash -c "source ${nvmDir}/nvm.sh && nvm install ${version} && nvm use ${version}"`;
  const result = await executeCommand(installCommand, { timeout: 300000 });

  if (result.success || (await commandExists('node'))) {
    return {
      success: true,
      message: `Node.js ${version} installed successfully via nvm`,
      details: result.stdout,
    };
  }

  return {
    success: false,
    message: 'Failed to install Node.js via nvm',
    details: result.error || result.stderr,
  };
}

/**
 * Install Android Studio and tools - Special case installer
 */
export async function installAndroidStudio(): Promise<InstallResult> {
  const os = detectOS();
  const packageManager = await detectPackageManager();

  if (!packageManager) {
    return {
      success: false,
      message: 'No package manager available',
    };
  }

  // First, ensure Java is installed
  const javaInstalled = await commandExists('java');
  if (!javaInstalled) {
    const javaResult = await installTool('java');
    if (!javaResult.success) {
      return {
        success: false,
        message: 'Failed to install Java (required for Android development)',
        details: javaResult.details,
      };
    }
  }

  // Install Android Studio
  let installCmd = '';
  if (os === OperatingSystem.MACOS) {
    installCmd = `${packageManager.installCmd} --cask android-studio`;
  } else if (os === OperatingSystem.LINUX) {
    // For Linux, download and install manually or via snap
    const snapExists = await commandExists('snap');
    if (snapExists) {
      installCmd = 'sudo snap install android-studio --classic';
    } else {
      return {
        success: false,
        message: 'Android Studio installation requires manual setup on this Linux distribution',
        details: 'Please visit: https://developer.android.com/studio',
      };
    }
  }

  const result = await executeCommand(installCmd, { timeout: 600000 });

  if (!result.success) {
    return {
      success: false,
      message: 'Failed to install Android Studio',
      details: result.error || result.stderr,
    };
  }

  // Configure Android environment variables
  const shellConfig = getShellConfigPath();
  const androidConfig = `
# Android Configuration
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
`;

  try {
    const content = await fs.readFile(shellConfig, 'utf-8');
    if (!content.includes('ANDROID_HOME')) {
      await fs.appendFile(shellConfig, androidConfig);
    }
  } catch (error) {
    await fs.writeFile(shellConfig, androidConfig);
  }

  return {
    success: true,
    message:
      'Android Studio installed successfully. Please:\n' +
      '1. Open Android Studio\n' +
      '2. Complete the setup wizard\n' +
      '3. Install Android SDK via Android Studio',
    details: result.stdout,
    needsRestart: true,
  };
}
