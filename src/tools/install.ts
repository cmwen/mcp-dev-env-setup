import { executeCommand, getShellConfigPath, commandExists } from '../utils/shell.js';
import fs from 'fs/promises';

export interface InstallResult {
  success: boolean;
  message: string;
  details?: string;
}

/**
 * Install Homebrew (prerequisite for many tools)
 */
export async function installHomebrew(): Promise<InstallResult> {
  const exists = await commandExists('brew');
  if (exists) {
    return {
      success: true,
      message: 'Homebrew is already installed',
    };
  }

  const installCommand = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
  const result = await executeCommand(installCommand, { timeout: 300000 });

  if (result.success || (await commandExists('brew'))) {
    return {
      success: true,
      message: 'Homebrew installed successfully',
      details: result.stdout,
    };
  }

  return {
    success: false,
    message: 'Failed to install Homebrew',
    details: result.error || result.stderr,
  };
}

/**
 * Install Python via Homebrew
 */
export async function installPython(): Promise<InstallResult> {
  // Ensure Homebrew is installed first
  const brewInstalled = await commandExists('brew');
  if (!brewInstalled) {
    const brewResult = await installHomebrew();
    if (!brewResult.success) {
      return {
        success: false,
        message: 'Cannot install Python: Homebrew installation failed',
        details: brewResult.details,
      };
    }
  }

  // Check if Python is already installed
  const pythonExists = await commandExists('python3');
  if (pythonExists) {
    return {
      success: true,
      message: 'Python is already installed',
    };
  }

  // Install Python
  const result = await executeCommand('brew install python3', { timeout: 300000 });

  if (result.success || (await commandExists('python3'))) {
    // Also install pip and setuptools
    await executeCommand('python3 -m ensurepip --upgrade');
    
    return {
      success: true,
      message: 'Python installed successfully',
      details: result.stdout,
    };
  }

  return {
    success: false,
    message: 'Failed to install Python',
    details: result.error || result.stderr,
  };
}

/**
 * Install nvm (Node Version Manager)
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
  const installCommand = 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash';
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
    // Config file might not exist, create it
    await fs.writeFile(shellConfig, nvmConfig);
  }

  return {
    success: true,
    message: 'nvm installed successfully. Please restart your terminal or run: source ' + shellConfig,
    details: result.stdout,
  };
}

/**
 * Install Node.js via nvm
 */
export async function installNodeJS(version: string = 'lts'): Promise<InstallResult> {
  // Check if nvm is installed
  const nvmExists = await commandExists('nvm');
  if (!nvmExists) {
    const nvmResult = await installNvm();
    if (!nvmResult.success) {
      // Fallback to Homebrew installation
      const brewResult = await executeCommand('brew install node', { timeout: 300000 });
      if (brewResult.success) {
        return {
          success: true,
          message: 'Node.js installed via Homebrew',
          details: brewResult.stdout,
        };
      }
      return {
        success: false,
        message: 'Failed to install Node.js',
        details: brewResult.error || brewResult.stderr,
      };
    }
  }

  // Install Node.js via nvm
  const nvmDir = process.env.NVM_DIR || `${process.env.HOME}/.nvm`;
  const installCommand = `bash -c "source ${nvmDir}/nvm.sh && nvm install ${version} && nvm use ${version}"`;
  const result = await executeCommand(installCommand, { timeout: 300000 });

  if (result.success || (await commandExists('node'))) {
    return {
      success: true,
      message: `Node.js ${version} installed successfully`,
      details: result.stdout,
    };
  }

  return {
    success: false,
    message: 'Failed to install Node.js',
    details: result.error || result.stderr,
  };
}

/**
 * Install Flutter SDK
 */
export async function installFlutter(): Promise<InstallResult> {
  const flutterExists = await commandExists('flutter');
  if (flutterExists) {
    return {
      success: true,
      message: 'Flutter is already installed',
    };
  }

  // Create flutter directory
  const flutterDir = `${process.env.HOME}/development`;
  await executeCommand(`mkdir -p ${flutterDir}`);

  // Clone Flutter repository
  const cloneCommand = `cd ${flutterDir} && git clone https://github.com/flutter/flutter.git -b stable`;
  const cloneResult = await executeCommand(cloneCommand, { timeout: 600000 });

  if (!cloneResult.success) {
    return {
      success: false,
      message: 'Failed to clone Flutter repository',
      details: cloneResult.error || cloneResult.stderr,
    };
  }

  // Add Flutter to PATH
  const shellConfig = getShellConfigPath();
  const flutterPath = `${flutterDir}/flutter/bin`;
  const pathConfig = `\n# Flutter Configuration\nexport PATH="$PATH:${flutterPath}"\n`;

  try {
    const content = await fs.readFile(shellConfig, 'utf-8');
    if (!content.includes(flutterPath)) {
      await fs.appendFile(shellConfig, pathConfig);
    }
  } catch (error) {
    await fs.writeFile(shellConfig, pathConfig);
  }

  // Run flutter doctor
  const doctorResult = await executeCommand(`${flutterPath}/flutter doctor`, { timeout: 120000 });

  return {
    success: true,
    message: 'Flutter installed successfully. Please restart your terminal or run: source ' + shellConfig,
    details: doctorResult.stdout,
  };
}

/**
 * Install Android development tools
 */
export async function installAndroid(): Promise<InstallResult> {
  // Check if Homebrew is installed
  const brewInstalled = await commandExists('brew');
  if (!brewInstalled) {
    const brewResult = await installHomebrew();
    if (!brewResult.success) {
      return {
        success: false,
        message: 'Cannot install Android tools: Homebrew installation failed',
        details: brewResult.details,
      };
    }
  }

  // Install Java (required for Android development)
  const javaExists = await commandExists('java');
  if (!javaExists) {
    const javaResult = await executeCommand('brew install openjdk@17', { timeout: 300000 });
    if (!javaResult.success) {
      return {
        success: false,
        message: 'Failed to install Java',
        details: javaResult.error || javaResult.stderr,
      };
    }

    // Link Java
    await executeCommand('sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk');
  }

  // Install Android Studio via Homebrew Cask
  const installResult = await executeCommand('brew install --cask android-studio', { timeout: 600000 });

  if (!installResult.success) {
    return {
      success: false,
      message: 'Failed to install Android Studio',
      details: installResult.error || installResult.stderr,
    };
  }

  // Add Android environment variables
  const shellConfig = getShellConfigPath();
  const androidConfig = `
# Android Configuration
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
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
    message: 'Android development tools installed successfully. Please:\n1. Open Android Studio\n2. Complete the setup wizard\n3. Install Android SDK via Android Studio\n4. Restart your terminal or run: source ' + shellConfig,
    details: installResult.stdout,
  };
}
