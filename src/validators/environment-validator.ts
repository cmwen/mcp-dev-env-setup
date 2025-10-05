/**
 * Environment Validator Module
 * 
 * Validates and checks the status of development environments
 */

import { commandExists, getCommandVersion } from '../utils/shell.js';
import { getToolConfig, getAllToolNames } from '../core/tool-config.js';
import { detectOS, detectPackageManager, OperatingSystem } from '../core/package-manager.js';

/**
 * Environment status for a single tool
 */
export interface ToolStatus {
  name: string;
  displayName: string;
  installed: boolean;
  version?: string;
  path?: string;
}

/**
 * System environment status
 */
export interface SystemStatus {
  os: OperatingSystem;
  platform: string;
  arch: string;
  packageManager: {
    name: string;
    available: boolean;
  } | null;
  tools: ToolStatus[];
}

/**
 * Check if a specific tool is installed
 */
export async function checkToolInstalled(toolName: string): Promise<ToolStatus> {
  const toolConfig = getToolConfig(toolName);

  if (!toolConfig) {
    return {
      name: toolName,
      displayName: toolName,
      installed: false,
    };
  }

  const installed = await commandExists(toolConfig.commandToCheck);
  const version = installed
    ? await getCommandVersion(toolConfig.commandToCheck, toolConfig.versionFlag)
    : undefined;

  return {
    name: toolConfig.name,
    displayName: toolConfig.displayName,
    installed,
    version: version || undefined,
  };
}

/**
 * Check multiple tools
 */
export async function checkMultipleTools(toolNames: string[]): Promise<ToolStatus[]> {
  const results = await Promise.all(toolNames.map((name) => checkToolInstalled(name)));
  return results;
}

/**
 * Check all configured tools
 */
export async function checkAllTools(): Promise<ToolStatus[]> {
  const toolNames = getAllToolNames();
  return await checkMultipleTools(toolNames);
}

/**
 * Get comprehensive system status
 */
export async function getSystemStatus(): Promise<SystemStatus> {
  const os = detectOS();
  const packageManager = await detectPackageManager();
  const tools = await checkAllTools();

  return {
    os,
    platform: process.platform,
    arch: process.arch,
    packageManager: packageManager
      ? {
          name: packageManager.name,
          available: packageManager.available,
        }
      : null,
    tools,
  };
}

/**
 * Check if system is ready for development
 */
export async function isSystemReady(requiredTools: string[]): Promise<{
  ready: boolean;
  missing: string[];
  installed: string[];
}> {
  const toolStatuses = await checkMultipleTools(requiredTools);

  const installed: string[] = [];
  const missing: string[] = [];

  for (const status of toolStatuses) {
    if (status.installed) {
      installed.push(status.name);
    } else {
      missing.push(status.name);
    }
  }

  return {
    ready: missing.length === 0,
    missing,
    installed,
  };
}

/**
 * Get recommendations based on system status
 */
export function getRecommendations(status: SystemStatus): string[] {
  const recommendations: string[] = [];

  if (!status.packageManager) {
    recommendations.push('Install a package manager to easily manage development tools');
  }

  const notInstalled = status.tools.filter((tool) => !tool.installed);

  if (notInstalled.some((t) => t.name === 'git')) {
    recommendations.push('Install Git for version control');
  }

  if (notInstalled.some((t) => t.name === 'python')) {
    recommendations.push('Install Python for Python development');
  }

  if (notInstalled.some((t) => t.name === 'nodejs')) {
    recommendations.push('Install Node.js for JavaScript/TypeScript development');
  }

  if (notInstalled.some((t) => t.name === 'docker')) {
    recommendations.push('Install Docker for containerized development');
  }

  if (notInstalled.some((t) => t.name === 'java')) {
    recommendations.push('Install Java for Java/Android development');
  }

  return recommendations;
}
