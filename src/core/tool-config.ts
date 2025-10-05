/**
 * Tool Configuration Module
 * 
 * Defines the configuration for various development tools and their installation methods
 * across different operating systems and package managers.
 */

import { PackageManager, OperatingSystem } from './package-manager.js';

/**
 * Tool category
 */
export enum ToolCategory {
  LANGUAGE = 'language',
  RUNTIME = 'runtime',
  SDK = 'sdk',
  PACKAGE_MANAGER = 'package_manager',
  VERSION_MANAGER = 'version_manager',
}

/**
 * Installation method
 */
export interface InstallMethod {
  packageManager: PackageManager;
  packageName: string;
  alternativeCommands?: string[];
  postInstallSteps?: string[];
}

/**
 * Tool configuration
 */
export interface ToolConfig {
  name: string;
  displayName: string;
  category: ToolCategory;
  description: string;
  commandToCheck: string;
  versionFlag: string;
  installMethods: Record<string, InstallMethod>;
  manualInstallUrl?: string;
  envVars?: Record<string, string>;
  shellConfig?: string;
}

/**
 * Supported development tools configurations
 */
export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  python: {
    name: 'python',
    displayName: 'Python',
    category: ToolCategory.LANGUAGE,
    description: 'Python programming language',
    commandToCheck: 'python3',
    versionFlag: '--version',
    installMethods: {
      homebrew: {
        packageManager: PackageManager.HOMEBREW,
        packageName: 'python@3',
        postInstallSteps: ['python3 -m ensurepip --upgrade'],
      },
      apt: {
        packageManager: PackageManager.APT,
        packageName: 'python3 python3-pip python3-venv',
      },
      dnf: {
        packageManager: PackageManager.DNF,
        packageName: 'python3 python3-pip',
      },
      yum: {
        packageManager: PackageManager.YUM,
        packageName: 'python3 python3-pip',
      },
      pacman: {
        packageManager: PackageManager.PACMAN,
        packageName: 'python python-pip',
      },
      zypper: {
        packageManager: PackageManager.ZYPPER,
        packageName: 'python3 python3-pip',
      },
    },
  },
  nodejs: {
    name: 'nodejs',
    displayName: 'Node.js',
    category: ToolCategory.RUNTIME,
    description: 'JavaScript runtime',
    commandToCheck: 'node',
    versionFlag: '--version',
    installMethods: {
      homebrew: {
        packageManager: PackageManager.HOMEBREW,
        packageName: 'node',
      },
      apt: {
        packageManager: PackageManager.APT,
        packageName: 'nodejs npm',
        alternativeCommands: [
          'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -',
          'sudo apt-get install -y nodejs',
        ],
      },
      dnf: {
        packageManager: PackageManager.DNF,
        packageName: 'nodejs npm',
      },
      yum: {
        packageManager: PackageManager.YUM,
        packageName: 'nodejs npm',
        alternativeCommands: [
          'curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -',
          'sudo yum install -y nodejs',
        ],
      },
      pacman: {
        packageManager: PackageManager.PACMAN,
        packageName: 'nodejs npm',
      },
      zypper: {
        packageManager: PackageManager.ZYPPER,
        packageName: 'nodejs npm',
      },
    },
  },
  git: {
    name: 'git',
    displayName: 'Git',
    category: ToolCategory.PACKAGE_MANAGER,
    description: 'Version control system',
    commandToCheck: 'git',
    versionFlag: '--version',
    installMethods: {
      homebrew: {
        packageManager: PackageManager.HOMEBREW,
        packageName: 'git',
      },
      apt: {
        packageManager: PackageManager.APT,
        packageName: 'git',
      },
      dnf: {
        packageManager: PackageManager.DNF,
        packageName: 'git',
      },
      yum: {
        packageManager: PackageManager.YUM,
        packageName: 'git',
      },
      pacman: {
        packageManager: PackageManager.PACMAN,
        packageName: 'git',
      },
      zypper: {
        packageManager: PackageManager.ZYPPER,
        packageName: 'git',
      },
    },
  },
  docker: {
    name: 'docker',
    displayName: 'Docker',
    category: ToolCategory.RUNTIME,
    description: 'Container platform',
    commandToCheck: 'docker',
    versionFlag: '--version',
    installMethods: {
      homebrew: {
        packageManager: PackageManager.HOMEBREW,
        packageName: '--cask docker',
      },
      apt: {
        packageManager: PackageManager.APT,
        packageName: 'docker.io docker-compose',
        postInstallSteps: [
          'sudo systemctl start docker',
          'sudo systemctl enable docker',
          'sudo usermod -aG docker $USER',
        ],
      },
      dnf: {
        packageManager: PackageManager.DNF,
        packageName: 'docker docker-compose',
        postInstallSteps: [
          'sudo systemctl start docker',
          'sudo systemctl enable docker',
          'sudo usermod -aG docker $USER',
        ],
      },
      yum: {
        packageManager: PackageManager.YUM,
        packageName: 'docker docker-compose',
        postInstallSteps: [
          'sudo systemctl start docker',
          'sudo systemctl enable docker',
          'sudo usermod -aG docker $USER',
        ],
      },
      pacman: {
        packageManager: PackageManager.PACMAN,
        packageName: 'docker docker-compose',
        postInstallSteps: [
          'sudo systemctl start docker',
          'sudo systemctl enable docker',
          'sudo usermod -aG docker $USER',
        ],
      },
      zypper: {
        packageManager: PackageManager.ZYPPER,
        packageName: 'docker docker-compose',
        postInstallSteps: [
          'sudo systemctl start docker',
          'sudo systemctl enable docker',
          'sudo usermod -aG docker $USER',
        ],
      },
    },
    manualInstallUrl: 'https://docs.docker.com/engine/install/',
  },
  java: {
    name: 'java',
    displayName: 'Java',
    category: ToolCategory.LANGUAGE,
    description: 'Java Development Kit',
    commandToCheck: 'java',
    versionFlag: '-version',
    installMethods: {
      homebrew: {
        packageManager: PackageManager.HOMEBREW,
        packageName: 'openjdk@17',
        postInstallSteps: [
          'sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk',
        ],
      },
      apt: {
        packageManager: PackageManager.APT,
        packageName: 'openjdk-17-jdk',
      },
      dnf: {
        packageManager: PackageManager.DNF,
        packageName: 'java-17-openjdk-devel',
      },
      yum: {
        packageManager: PackageManager.YUM,
        packageName: 'java-17-openjdk-devel',
      },
      pacman: {
        packageManager: PackageManager.PACMAN,
        packageName: 'jdk17-openjdk',
      },
      zypper: {
        packageManager: PackageManager.ZYPPER,
        packageName: 'java-17-openjdk-devel',
      },
    },
    envVars: {
      JAVA_HOME: '/usr/lib/jvm/java-17-openjdk',
    },
  },
  go: {
    name: 'go',
    displayName: 'Go',
    category: ToolCategory.LANGUAGE,
    description: 'Go programming language',
    commandToCheck: 'go',
    versionFlag: 'version',
    installMethods: {
      homebrew: {
        packageManager: PackageManager.HOMEBREW,
        packageName: 'go',
      },
      apt: {
        packageManager: PackageManager.APT,
        packageName: 'golang',
      },
      dnf: {
        packageManager: PackageManager.DNF,
        packageName: 'golang',
      },
      yum: {
        packageManager: PackageManager.YUM,
        packageName: 'golang',
      },
      pacman: {
        packageManager: PackageManager.PACMAN,
        packageName: 'go',
      },
      zypper: {
        packageManager: PackageManager.ZYPPER,
        packageName: 'go',
      },
    },
    envVars: {
      GOPATH: '$HOME/go',
      PATH: '$PATH:$GOPATH/bin',
    },
  },
  rust: {
    name: 'rust',
    displayName: 'Rust',
    category: ToolCategory.LANGUAGE,
    description: 'Rust programming language',
    commandToCheck: 'rustc',
    versionFlag: '--version',
    installMethods: {
      homebrew: {
        packageManager: PackageManager.HOMEBREW,
        packageName: 'rust',
      },
      apt: {
        packageManager: PackageManager.APT,
        packageName: 'curl build-essential',
        alternativeCommands: [
          'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y',
        ],
      },
      dnf: {
        packageManager: PackageManager.DNF,
        packageName: 'rust cargo',
      },
      yum: {
        packageManager: PackageManager.YUM,
        packageName: 'rust cargo',
      },
      pacman: {
        packageManager: PackageManager.PACMAN,
        packageName: 'rust',
      },
      zypper: {
        packageManager: PackageManager.ZYPPER,
        packageName: 'rust cargo',
      },
    },
    shellConfig: 'source $HOME/.cargo/env',
  },
  flutter: {
    name: 'flutter',
    displayName: 'Flutter',
    category: ToolCategory.SDK,
    description: 'Flutter SDK for mobile development',
    commandToCheck: 'flutter',
    versionFlag: '--version',
    installMethods: {
      homebrew: {
        packageManager: PackageManager.HOMEBREW,
        packageName: '--cask flutter',
      },
      apt: {
        packageManager: PackageManager.APT,
        packageName: 'git curl unzip',
        alternativeCommands: [
          'git clone https://github.com/flutter/flutter.git -b stable $HOME/development/flutter',
        ],
      },
      dnf: {
        packageManager: PackageManager.DNF,
        packageName: 'git curl unzip',
        alternativeCommands: [
          'git clone https://github.com/flutter/flutter.git -b stable $HOME/development/flutter',
        ],
      },
      yum: {
        packageManager: PackageManager.YUM,
        packageName: 'git curl unzip',
        alternativeCommands: [
          'git clone https://github.com/flutter/flutter.git -b stable $HOME/development/flutter',
        ],
      },
      pacman: {
        packageManager: PackageManager.PACMAN,
        packageName: 'flutter',
      },
      zypper: {
        packageManager: PackageManager.ZYPPER,
        packageName: 'git curl unzip',
        alternativeCommands: [
          'git clone https://github.com/flutter/flutter.git -b stable $HOME/development/flutter',
        ],
      },
    },
    envVars: {
      PATH: '$PATH:$HOME/development/flutter/bin',
    },
    manualInstallUrl: 'https://flutter.dev/docs/get-started/install',
  },
};

/**
 * Get tool configuration by name
 */
export function getToolConfig(toolName: string): ToolConfig | undefined {
  return TOOL_CONFIGS[toolName];
}

/**
 * Get all available tool names
 */
export function getAllToolNames(): string[] {
  return Object.keys(TOOL_CONFIGS);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: ToolCategory): ToolConfig[] {
  return Object.values(TOOL_CONFIGS).filter((tool) => tool.category === category);
}
