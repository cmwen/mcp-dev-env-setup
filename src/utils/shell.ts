import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CommandResult {
  stdout: string;
  stderr: string;
  success: boolean;
  error?: string;
}

/**
 * Execute a shell command and return the result
 */
export async function executeCommand(
  command: string,
  options?: { cwd?: string; timeout?: number }
): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: options?.cwd,
      timeout: options?.timeout || 60000,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      success: true,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || '',
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if a command exists in the system
 */
export async function commandExists(command: string): Promise<boolean> {
  const result = await executeCommand(`which ${command}`);
  return result.success && result.stdout.length > 0;
}

/**
 * Get the version of a command
 */
export async function getCommandVersion(
  command: string,
  versionFlag = '--version'
): Promise<string | null> {
  const result = await executeCommand(`${command} ${versionFlag}`);
  if (result.success) {
    return result.stdout.split('\n')[0];
  }
  return null;
}

/**
 * Check if running on macOS
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * Check if running on Linux
 */
export function isLinux(): boolean {
  return process.platform === 'linux';
}

/**
 * Check if running on Windows
 */
export function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * Check if the system is supported (macOS or Linux)
 */
export function isSupported(): boolean {
  return isMacOS() || isLinux();
}

/**
 * Get the user's home directory
 */
export function getHomeDirectory(): string {
  return process.env.HOME || process.env.USERPROFILE || '~';
}

/**
 * Get the shell configuration file path
 */
export function getShellConfigPath(): string {
  const shell = process.env.SHELL || '';
  const home = getHomeDirectory();
  
  if (shell.includes('zsh')) {
    return `${home}/.zshrc`;
  } else if (shell.includes('bash')) {
    // On macOS, use .bash_profile; on Linux, use .bashrc
    if (isMacOS()) {
      return `${home}/.bash_profile`;
    } else {
      return `${home}/.bashrc`;
    }
  }
  
  return `${home}/.profile`;
}

/**
 * Get OS-specific information
 */
export async function getOSInfo(): Promise<{
  platform: string;
  release: string;
  arch: string;
  distro?: string;
}> {
  const info = {
    platform: process.platform as string,
    release: process.release.name || 'unknown',
    arch: process.arch as string,
  };

  // For Linux, try to detect the distribution
  if (isLinux()) {
    const result = await executeCommand('cat /etc/os-release');
    if (result.success) {
      const lines = result.stdout.split('\n');
      const nameMatch = lines.find((line) => line.startsWith('NAME='));
      if (nameMatch) {
        const distro = nameMatch.split('=')[1].replace(/"/g, '');
        return { ...info, distro };
      }
    }
  }

  return info;
}
