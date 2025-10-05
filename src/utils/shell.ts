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
 * Get the user's home directory
 */
export function getHomeDirectory(): string {
  return process.env.HOME || '~';
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
    return `${home}/.bash_profile`;
  }
  
  return `${home}/.profile`;
}
