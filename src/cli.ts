#!/usr/bin/env node

/**
 * CLI Entry Point
 * 
 * Provides standalone CLI functionality with commands for:
 * - Checking environment
 * - Installing tools
 * - Getting system information
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getSystemInfo } from './core/package-manager.js';
import { getSystemStatus, checkToolInstalled } from './validators/environment-validator.js';
import {
  installPackageManager,
  installTool,
  installMultipleTools,
  installNodeViaTarget,
  installAndroidStudio,
} from './installers/unified-installer.js';
import { getAllToolNames } from './core/tool-config.js';
import { isSupported } from './utils/shell.js';

const program = new Command();

// Version and description
program
  .name('devenv')
  .description('Development Environment Setup Tool - Cross-platform tool installer for macOS and Linux')
  .version('2.0.0');

/**
 * Check command - Display environment status
 */
program
  .command('check')
  .description('Check installed development tools')
  .option('-t, --tool <name>', 'Check specific tool')
  .action(async (options) => {
    try {
      if (!isSupported()) {
        console.error(chalk.red('❌ This tool only supports macOS and Linux'));
        process.exit(1);
      }

      if (options.tool) {
        // Check specific tool
        const spinner = ora(`Checking ${options.tool}...`).start();
        const status = await checkToolInstalled(options.tool);
        spinner.stop();

        if (status.installed) {
          console.log(chalk.green(`✅ ${status.displayName} is installed`));
          if (status.version) {
            console.log(chalk.gray(`   Version: ${status.version}`));
          }
        } else {
          console.log(chalk.red(`❌ ${status.displayName} is not installed`));
        }
      } else {
        // Check all tools
        const spinner = ora('Checking environment...').start();
        const status = await getSystemStatus();
        spinner.stop();

        console.log('\n' + chalk.bold.cyan('📋 Development Environment Status\n'));
        
        console.log(chalk.bold('System Information:'));
        console.log(`  OS: ${chalk.yellow(status.os)}`);
        console.log(`  Architecture: ${chalk.yellow(status.arch)}`);
        console.log(`  Package Manager: ${chalk.yellow(status.packageManager?.name || 'None detected')}\n`);

        const installed = status.tools.filter(t => t.installed);
        const notInstalled = status.tools.filter(t => !t.installed);

        if (installed.length > 0) {
          console.log(chalk.bold.green('✅ Installed Tools:\n'));
          for (const tool of installed) {
            console.log(`  ${chalk.green('✓')} ${tool.displayName}${tool.version ? chalk.gray(' - ' + tool.version) : ''}`);
          }
        }

        if (notInstalled.length > 0) {
          console.log('\n' + chalk.bold.red('❌ Not Installed:\n'));
          for (const tool of notInstalled) {
            console.log(`  ${chalk.red('✗')} ${tool.displayName}`);
          }
        }

        console.log('');
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Info command - Display system information
 */
program
  .command('info')
  .description('Display system information')
  .action(async () => {
    try {
      if (!isSupported()) {
        console.error(chalk.red('❌ This tool only supports macOS and Linux'));
        process.exit(1);
      }

      const spinner = ora('Getting system information...').start();
      const info = await getSystemInfo();
      spinner.stop();

      console.log('\n' + chalk.bold.cyan('💻 System Information\n'));
      console.log(`${chalk.bold('Operating System:')} ${chalk.yellow(info.os)}`);
      console.log(`${chalk.bold('Platform:')} ${chalk.yellow(info.platform)}`);
      console.log(`${chalk.bold('Architecture:')} ${chalk.yellow(info.arch)}`);
      
      if (info.packageManager) {
        console.log(`${chalk.bold('Package Manager:')} ${chalk.yellow(info.packageManager.name)}`);
        console.log(`${chalk.bold('Install Command:')} ${chalk.gray(info.packageManager.installCmd)}`);
      } else {
        console.log(`${chalk.bold('Package Manager:')} ${chalk.red('None detected')}`);
      }
      console.log('');
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Install command - Install development tools
 */
program
  .command('install <tool>')
  .description('Install a development tool')
  .option('--version <version>', 'Specify version (for tools that support it)')
  .action(async (tool: string, options) => {
    try {
      if (!isSupported()) {
        console.error(chalk.red('❌ This tool only supports macOS and Linux'));
        process.exit(1);
      }

      const validTools = getAllToolNames();
      if (!validTools.includes(tool) && tool !== 'nodejs' && tool !== 'android') {
        console.error(chalk.red(`❌ Unknown tool: ${tool}`));
        console.log(chalk.yellow('\nAvailable tools:'));
        validTools.forEach(t => console.log(`  - ${t}`));
        console.log('  - nodejs (alias for Node.js with version support)');
        console.log('  - android (Android Studio)');
        process.exit(1);
      }

      const spinner = ora(`Installing ${tool}...`).start();
      
      let result;
      if (tool === 'nodejs') {
        const version = options.version || 'lts';
        result = await installNodeViaTarget(version);
      } else if (tool === 'android') {
        result = await installAndroidStudio();
      } else {
        result = await installTool(tool, options.version ? { version: options.version } : undefined);
      }

      spinner.stop();

      if (result.success) {
        console.log(chalk.green(`\n✅ ${result.message}\n`));
        if (result.details) {
          console.log(chalk.gray('Details:'));
          console.log(chalk.gray(result.details.split('\n').slice(0, 5).join('\n')));
        }
        if (result.needsRestart) {
          console.log(chalk.yellow('\n⚠️  Please restart your terminal for changes to take effect\n'));
        }
      } else {
        console.log(chalk.red(`\n❌ ${result.message}\n`));
        if (result.details) {
          console.log(chalk.gray(result.details));
        }
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Install-all command - Install multiple tools
 */
program
  .command('install-all')
  .description('Install multiple development tools')
  .option('-s, --skip <tools...>', 'Tools to skip')
  .action(async (options) => {
    try {
      if (!isSupported()) {
        console.error(chalk.red('❌ This tool only supports macOS and Linux'));
        process.exit(1);
      }

      const skip = options.skip || [];
      const basicTools = ['git', 'python', 'nodejs'];
      const toolsToInstall = basicTools.filter(t => !skip.includes(t));

      console.log(chalk.bold.cyan('\n🚀 Installing Development Environment\n'));

      // Install package manager first
      console.log(chalk.bold('Step 1: Package Manager'));
      let spinner = ora('Checking package manager...').start();
      const pmResult = await installPackageManager();
      spinner.stop();
      
      if (pmResult.success) {
        console.log(chalk.green(`✅ ${pmResult.message}`));
      } else {
        console.log(chalk.red(`❌ ${pmResult.message}`));
        process.exit(1);
      }

      // Install tools
      console.log(chalk.bold('\nStep 2: Installing Tools'));
      for (const tool of toolsToInstall) {
        spinner = ora(`Installing ${tool}...`).start();
        const result = await installTool(tool);
        spinner.stop();
        
        if (result.success) {
          console.log(chalk.green(`✅ ${tool}: ${result.message}`));
        } else {
          console.log(chalk.yellow(`⚠️  ${tool}: ${result.message}`));
        }
      }

      console.log(chalk.bold.green('\n✨ Setup Complete!\n'));
      console.log(chalk.yellow('⚠️  Please restart your terminal for all changes to take effect\n'));
    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * List command - List available tools
 */
program
  .command('list')
  .description('List all available tools')
  .action(() => {
    const tools = getAllToolNames();
    console.log(chalk.bold.cyan('\n📦 Available Tools:\n'));
    tools.forEach(tool => {
      console.log(`  ${chalk.green('•')} ${tool}`);
    });
    console.log('');
  });

// Parse arguments
program.parse();
