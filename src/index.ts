#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { isSupported } from './utils/shell.js';
import { getSystemStatus, checkToolInstalled, getRecommendations } from './validators/environment-validator.js';
import {
  installPackageManager,
  installTool,
  installMultipleTools,
  installNvm,
  installNodeViaTarget,
  installAndroidStudio,
} from './installers/unified-installer.js';
import { getAllToolNames } from './core/tool-config.js';
import { getSystemInfo } from './core/package-manager.js';

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: 'check_environment',
    description:
      'Check which development tools are currently installed on the system (Python, Node.js, Flutter, Android, Git, Docker, etc.)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_system_info',
    description:
      'Get detailed system information including OS, architecture, and package manager',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'install_package_manager',
    description: 'Install package manager if needed (e.g., Homebrew on macOS)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'install_tool',
    description: 'Install a specific development tool (python, nodejs, git, docker, java, go, rust, flutter)',
    inputSchema: {
      type: 'object',
      properties: {
        tool: {
          type: 'string',
          description: 'Name of the tool to install',
          enum: getAllToolNames(),
        },
        version: {
          type: 'string',
          description: 'Optional version specification (for tools that support it)',
        },
      },
      required: ['tool'],
    },
  },
  {
    name: 'install_python',
    description: 'Install Python 3 and pip via package manager',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'install_nodejs',
    description: 'Install Node.js via nvm or package manager',
    inputSchema: {
      type: 'object',
      properties: {
        version: {
          type: 'string',
          description: 'Node.js version to install (e.g., "lts", "20", "18")',
          default: 'lts',
        },
      },
    },
  },
  {
    name: 'install_flutter',
    description: 'Install Flutter SDK for mobile app development',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'install_android',
    description: 'Install Android Studio and development tools',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'install_multiple',
    description: 'Install multiple development tools at once',
    inputSchema: {
      type: 'object',
      properties: {
        tools: {
          type: 'array',
          items: {
            type: 'string',
            enum: getAllToolNames(),
          },
          description: 'List of tools to install',
        },
      },
      required: ['tools'],
    },
  },
  {
    name: 'setup_all',
    description:
      'Install all development environments (Package Manager, Python, Node.js, Flutter, Android)',
    inputSchema: {
      type: 'object',
      properties: {
        skip: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'List of tools to skip',
        },
      },
    },
  },
];

class DevEnvSetupServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-dev-env-setup',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Check if running on supported OS
        if (!isSupported()) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: This MCP server currently supports macOS and Linux only. Windows support is coming soon.',
              },
            ],
          };
        }

        switch (name) {
          case 'get_system_info': {
            const info = await getSystemInfo();
            const report = `# System Information\n\n` +
              `**Operating System**: ${info.os}\n` +
              `**Platform**: ${info.platform}\n` +
              `**Architecture**: ${info.arch}\n` +
              `**Package Manager**: ${info.packageManager ? info.packageManager.name : 'None detected'}\n`;
            
            return {
              content: [
                {
                  type: 'text',
                  text: report,
                },
              ],
            };
          }

          case 'check_environment': {
            const status = await getSystemStatus();
            const report = this.formatEnvironmentReport(status);
            return {
              content: [
                {
                  type: 'text',
                  text: report,
                },
              ],
            };
          }

          case 'install_package_manager': {
            const result = await installPackageManager();
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatInstallResult(result),
                },
              ],
            };
          }

          case 'install_tool': {
            const toolName = (args as any)?.tool;
            const version = (args as any)?.version;
            
            if (!toolName) {
              return {
                content: [
                  {
                    type: 'text',
                    text: 'Error: tool parameter is required',
                  },
                ],
                isError: true,
              };
            }

            const result = await installTool(toolName, version ? { version } : undefined);
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatInstallResult(result),
                },
              ],
            };
          }

          case 'install_python': {
            const result = await installTool('python');
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatInstallResult(result),
                },
              ],
            };
          }

          case 'install_nodejs': {
            const version = (args as any)?.version || 'lts';
            const result = await installNodeViaTarget(version);
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatInstallResult(result),
                },
              ],
            };
          }

          case 'install_flutter': {
            const result = await installTool('flutter');
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatInstallResult(result),
                },
              ],
            };
          }

          case 'install_android': {
            const result = await installAndroidStudio();
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatInstallResult(result),
                },
              ],
            };
          }

          case 'install_multiple': {
            const tools = (args as any)?.tools || [];
            if (!Array.isArray(tools) || tools.length === 0) {
              return {
                content: [
                  {
                    type: 'text',
                    text: 'Error: tools parameter must be a non-empty array',
                  },
                ],
                isError: true,
              };
            }

            const results = await installMultipleTools(tools);
            const report = this.formatMultipleInstallResults(results);
            return {
              content: [
                {
                  type: 'text',
                  text: report,
                },
              ],
            };
          }

          case 'setup_all': {
            const skip = ((args as any)?.skip || []) as string[];
            const results = await this.setupAllEnvironments(skip);
            return {
              content: [
                {
                  type: 'text',
                  text: results,
                },
              ],
            };
          }

          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private formatEnvironmentReport(status: Awaited<ReturnType<typeof getSystemStatus>>): string {
    let report = '# Development Environment Status\n\n';
    
    report += `**Operating System**: ${status.os}\n`;
    report += `**Architecture**: ${status.arch}\n`;
    report += `**Package Manager**: ${status.packageManager ? status.packageManager.name : 'None detected'}\n\n`;

    report += '## Installed Tools\n\n';

    const installedTools = status.tools.filter(t => t.installed);
    const notInstalledTools = status.tools.filter(t => !t.installed);

    if (installedTools.length > 0) {
      for (const tool of installedTools) {
        report += `✅ **${tool.displayName}**`;
        if (tool.version) {
          report += ` - ${tool.version}`;
        }
        report += '\n';
      }
    } else {
      report += 'No tools installed yet.\n';
    }

    if (notInstalledTools.length > 0) {
      report += '\n## Not Installed\n\n';
      for (const tool of notInstalledTools) {
        report += `❌ **${tool.displayName}**\n`;
      }
    }

    const recommendations = getRecommendations(status);
    if (recommendations.length > 0) {
      report += '\n## Recommendations\n\n';
      for (const rec of recommendations) {
        report += `- ${rec}\n`;
      }
    }

    return report;
  }

  private formatInstallResult(result: { success: boolean; message: string; details?: string; needsRestart?: boolean }): string {
    let output = result.success ? '✅ Success\n\n' : '❌ Failed\n\n';
    output += result.message;
    if (result.needsRestart) {
      output += '\n\n⚠️ **Please restart your terminal for changes to take effect.**';
    }
    if (result.details) {
      output += '\n\n**Details:**\n```\n' + result.details + '\n```';
    }
    return output;
  }

  private formatMultipleInstallResults(results: Record<string, { success: boolean; message: string; details?: string }>): string {
    let report = '# Installation Results\n\n';
    
    for (const [tool, result] of Object.entries(results)) {
      const icon = result.success ? '✅' : '❌';
      report += `${icon} **${tool}**: ${result.message}\n`;
    }

    return report;
  }

  private async setupAllEnvironments(skip: string[]): Promise<string> {
    let report = '# Setting Up All Development Environments\n\n';

    // 1. Install Package Manager (always needed on macOS)
    report += '## 1. Package Manager\n';
    const pmResult = await installPackageManager();
    report += this.formatInstallResult(pmResult) + '\n\n';

    if (!pmResult.success) {
      report += '❌ Cannot continue without a package manager.\n';
      return report;
    }

    // 2. Install common tools
    const toolsToInstall = ['python', 'nodejs', 'git'];
    const filtered = toolsToInstall.filter(t => !skip.includes(t));

    if (filtered.length > 0) {
      report += '## 2. Installing Common Tools\n';
      const results = await installMultipleTools(filtered);
      for (const [tool, result] of Object.entries(results)) {
        const icon = result.success ? '✅' : '❌';
        report += `${icon} **${tool}**: ${result.message}\n`;
      }
      report += '\n';
    }

    // 3. Install Flutter if requested
    if (!skip.includes('flutter')) {
      report += '## 3. Installing Flutter\n';
      const flutterResult = await installTool('flutter');
      report += this.formatInstallResult(flutterResult) + '\n\n';
    }

    // 4. Install Android if requested
    if (!skip.includes('android')) {
      report += '## 4. Installing Android Development Tools\n';
      const androidResult = await installAndroidStudio();
      report += this.formatInstallResult(androidResult) + '\n\n';
    }

    report += '## Setup Complete!\n\n';
    report += 'Please restart your terminal to ensure all PATH changes take effect.\n';

    return report;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Dev Environment Setup Server running on stdio');
  }
}

// Start the server
const server = new DevEnvSetupServer();
server.run().catch(console.error);
