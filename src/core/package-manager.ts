/**
 * Package Manager Detection and Management Module
 * 
 * This module provides functionality to detect the operating system and package manager,
 * and to interact with different package managers in a unified way.
 */

import { executeCommand, commandExists } from '../utils/shell.js';

/**
 * Supported operating systems
 */
export enum OperatingSystem {
  MACOS = 'darwin',
  LINUX = 'linux',
  WINDOWS = 'win32',
  UNKNOWN = 'unknown',
}

/**
 * Supported package managers
 */
export enum PackageManager {
  HOMEBREW = 'homebrew',
  APT = 'apt',
  DNF = 'dnf',
  YUM = 'yum',
  PACMAN = 'pacman',
  ZYPPER = 'zypper',
  UNKNOWN = 'unknown',
}

/**
 * Package manager information
 */
export interface PackageManagerInfo {
  name: PackageManager;
  command: string;
  installCmd: string;
  updateCmd: string;
  searchCmd: string;
  available: boolean;
}

/**
 * System information
 */
export interface SystemInfo {
  os: OperatingSystem;
  platform: string;
  arch: string;
  packageManager: PackageManagerInfo | null;
}

/**
 * Detect the current operating system
 */
export function detectOS(): OperatingSystem {
  const platform = process.platform;
  
  switch (platform) {
    case 'darwin':
      return OperatingSystem.MACOS;
    case 'linux':
      return OperatingSystem.LINUX;
    case 'win32':
      return OperatingSystem.WINDOWS;
    default:
      return OperatingSystem.UNKNOWN;
  }
}

/**
 * Check if a specific package manager is available
 */
async function checkPackageManager(
  manager: PackageManager,
  command: string
): Promise<boolean> {
  return await commandExists(command);
}

/**
 * Detect the available package manager on the system
 */
export async function detectPackageManager(): Promise<PackageManagerInfo | null> {
  const os = detectOS();

  // Package manager configurations
  const managers: Record<string, PackageManagerInfo> = {
    homebrew: {
      name: PackageManager.HOMEBREW,
      command: 'brew',
      installCmd: 'brew install',
      updateCmd: 'brew update && brew upgrade',
      searchCmd: 'brew search',
      available: false,
    },
    apt: {
      name: PackageManager.APT,
      command: 'apt-get',
      installCmd: 'sudo apt-get install -y',
      updateCmd: 'sudo apt-get update && sudo apt-get upgrade -y',
      searchCmd: 'apt-cache search',
      available: false,
    },
    dnf: {
      name: PackageManager.DNF,
      command: 'dnf',
      installCmd: 'sudo dnf install -y',
      updateCmd: 'sudo dnf update -y',
      searchCmd: 'dnf search',
      available: false,
    },
    yum: {
      name: PackageManager.YUM,
      command: 'yum',
      installCmd: 'sudo yum install -y',
      updateCmd: 'sudo yum update -y',
      searchCmd: 'yum search',
      available: false,
    },
    pacman: {
      name: PackageManager.PACMAN,
      command: 'pacman',
      installCmd: 'sudo pacman -S --noconfirm',
      updateCmd: 'sudo pacman -Syu --noconfirm',
      searchCmd: 'pacman -Ss',
      available: false,
    },
    zypper: {
      name: PackageManager.ZYPPER,
      command: 'zypper',
      installCmd: 'sudo zypper install -y',
      updateCmd: 'sudo zypper update -y',
      searchCmd: 'zypper search',
      available: false,
    },
  };

  // Check package managers based on OS
  let checkOrder: string[] = [];

  if (os === OperatingSystem.MACOS) {
    checkOrder = ['homebrew'];
  } else if (os === OperatingSystem.LINUX) {
    // Check in order of popularity
    checkOrder = ['apt', 'dnf', 'yum', 'pacman', 'zypper'];
  }

  // Check each package manager
  for (const managerName of checkOrder) {
    const manager = managers[managerName];
    const available = await checkPackageManager(manager.name, manager.command);
    
    if (available) {
      manager.available = true;
      return manager;
    }
  }

  return null;
}

/**
 * Get comprehensive system information
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  const os = detectOS();
  const packageManager = await detectPackageManager();

  return {
    os,
    platform: process.platform,
    arch: process.arch,
    packageManager,
  };
}

/**
 * Install a package using the detected package manager
 */
export async function installPackage(
  packageName: string,
  packageManager?: PackageManagerInfo
): Promise<{ success: boolean; message: string; details?: string }> {
  const pm = packageManager || (await detectPackageManager());

  if (!pm) {
    return {
      success: false,
      message: 'No package manager detected on this system',
    };
  }

  const command = `${pm.installCmd} ${packageName}`;
  const result = await executeCommand(command, { timeout: 600000 });

  return {
    success: result.success,
    message: result.success
      ? `Successfully installed ${packageName} using ${pm.name}`
      : `Failed to install ${packageName}`,
    details: result.success ? result.stdout : result.error || result.stderr,
  };
}

/**
 * Check if package manager needs to be installed (Homebrew on macOS)
 */
export function needsPackageManagerInstall(os: OperatingSystem): boolean {
  return os === OperatingSystem.MACOS;
}

/**
 * Get the installation command for the package manager
 */
export function getPackageManagerInstallCommand(os: OperatingSystem): string | null {
  if (os === OperatingSystem.MACOS) {
    return '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
  }
  return null;
}
