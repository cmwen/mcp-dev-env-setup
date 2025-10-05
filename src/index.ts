#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { checkAllEnvironments } from './utils/check.js';
import {
  installHomebrew,
  installPython,
  installNodeJS,
  installNvm,
  installFlutter,
  installAndroid,
} from './tools/install.js';
import { isMacOS } from './utils/shell.js';

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: 'check_environment',
    description:
      'Check which development tools are currently installed on the system (Python, Node.js, Flutter, Android, etc.)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'install_homebrew',
    description: 'Install Homebrew package manager (required for other installations)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'install_python',
    description: 'Install Python 3 and pip via Homebrew',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'install_nodejs',
    description: 'Install Node.js via nvm (Node Version Manager)',
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
    name: 'setup_all',
    description:
      'Install all development environments (Homebrew, Python, Node.js, Flutter, Android)',
    inputSchema: {
      type: 'object',
      properties: {
        skip: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['python', 'nodejs', 'flutter', 'android'],
          },
          description: 'List of environments to skip',
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
        version: '1.0.0',
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
        // Check if running on macOS
        if (!isMacOS()) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: This MCP server currently only supports macOS. Support for other platforms coming soon.',
              },
            ],
          };
        }

        switch (name) {
          case 'check_environment': {
            const status = await checkAllEnvironments();
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

          case 'install_homebrew': {
            const result = await installHomebrew();
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
            const result = await installPython();
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
            const result = await installNodeJS(version);
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
            const result = await installFlutter();
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
            const result = await installAndroid();
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatInstallResult(result),
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

  private formatEnvironmentReport(status: Awaited<ReturnType<typeof checkAllEnvironments>>): string {
    let report = '# Development Environment Status\n\n';

    const items = [
      status.homebrew,
      status.python,
      status.nodejs,
      status.nvm,
      status.flutter,
      status.java,
      status.androidStudio,
    ];

    for (const item of items) {
      const icon = item.installed ? '✅' : '❌';
      report += `${icon} **${item.name}**: ${item.installed ? 'Installed' : 'Not installed'}`;
      if (item.version) {
        report += ` (${item.version})`;
      }
      report += '\n';
    }

    report += '\n## Recommendations\n';
    if (!status.homebrew.installed) {
      report += '- Install Homebrew first (required for other installations)\n';
    }
    if (!status.python.installed) {
      report += '- Install Python for Python development\n';
    }
    if (!status.nodejs.installed) {
      report += '- Install Node.js for JavaScript/TypeScript development\n';
    }
    if (!status.flutter.installed) {
      report += '- Install Flutter for mobile app development\n';
    }
    if (!status.java.installed || !status.androidStudio.installed) {
      report += '- Install Android development tools for Android app development\n';
    }

    return report;
  }

  private formatInstallResult(result: { success: boolean; message: string; details?: string }): string {
    let output = result.success ? '✅ Success\n\n' : '❌ Failed\n\n';
    output += result.message;
    if (result.details) {
      output += '\n\n**Details:**\n```\n' + result.details + '\n```';
    }
    return output;
  }

  private async setupAllEnvironments(skip: string[]): Promise<string> {
    let report = '# Setting Up All Development Environments\n\n';

    // 1. Install Homebrew (always needed)
    report += '## 1. Installing Homebrew\n';
    const brewResult = await installHomebrew();
    report += this.formatInstallResult(brewResult) + '\n\n';

    if (!brewResult.success) {
      report += '❌ Cannot continue without Homebrew. Please install it manually.\n';
      return report;
    }

    // 2. Install Python
    if (!skip.includes('python')) {
      report += '## 2. Installing Python\n';
      const pythonResult = await installPython();
      report += this.formatInstallResult(pythonResult) + '\n\n';
    }

    // 3. Install Node.js
    if (!skip.includes('nodejs')) {
      report += '## 3. Installing Node.js\n';
      const nodeResult = await installNodeJS('lts');
      report += this.formatInstallResult(nodeResult) + '\n\n';
    }

    // 4. Install Flutter
    if (!skip.includes('flutter')) {
      report += '## 4. Installing Flutter\n';
      const flutterResult = await installFlutter();
      report += this.formatInstallResult(flutterResult) + '\n\n';
    }

    // 5. Install Android
    if (!skip.includes('android')) {
      report += '## 5. Installing Android Development Tools\n';
      const androidResult = await installAndroid();
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
