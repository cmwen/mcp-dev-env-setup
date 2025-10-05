import { commandExists, getCommandVersion } from './shell.js';

export interface EnvironmentStatus {
  name: string;
  installed: boolean;
  version?: string;
  path?: string;
}

/**
 * Check if Homebrew is installed
 */
export async function checkHomebrew(): Promise<EnvironmentStatus> {
  const installed = await commandExists('brew');
  const version = installed ? await getCommandVersion('brew') : undefined;
  
  return {
    name: 'Homebrew',
    installed,
    version: version || undefined,
    path: installed ? '/opt/homebrew/bin/brew' : undefined,
  };
}

/**
 * Check if Python is installed
 */
export async function checkPython(): Promise<EnvironmentStatus> {
  const installed = await commandExists('python3');
  const version = installed ? await getCommandVersion('python3') : undefined;
  
  return {
    name: 'Python',
    installed,
    version: version || undefined,
  };
}

/**
 * Check if Node.js is installed
 */
export async function checkNodeJS(): Promise<EnvironmentStatus> {
  const installed = await commandExists('node');
  const version = installed ? await getCommandVersion('node') : undefined;
  
  return {
    name: 'Node.js',
    installed,
    version: version || undefined,
  };
}

/**
 * Check if nvm is installed
 */
export async function checkNvm(): Promise<EnvironmentStatus> {
  const installed = await commandExists('nvm');
  const version = installed ? await getCommandVersion('nvm', '--version') : undefined;
  
  return {
    name: 'nvm',
    installed,
    version: version || undefined,
  };
}

/**
 * Check if Flutter is installed
 */
export async function checkFlutter(): Promise<EnvironmentStatus> {
  const installed = await commandExists('flutter');
  const version = installed ? await getCommandVersion('flutter', '--version') : undefined;
  
  return {
    name: 'Flutter',
    installed,
    version: version?.split('\n')[0] || undefined,
  };
}

/**
 * Check if Android Studio is installed
 */
export async function checkAndroidStudio(): Promise<EnvironmentStatus> {
  const installed = await commandExists('android');
  
  return {
    name: 'Android Studio',
    installed,
  };
}

/**
 * Check if Java (required for Android) is installed
 */
export async function checkJava(): Promise<EnvironmentStatus> {
  const installed = await commandExists('java');
  const version = installed ? await getCommandVersion('java', '-version') : undefined;
  
  return {
    name: 'Java',
    installed,
    version: version || undefined,
  };
}

/**
 * Check all development environments
 */
export async function checkAllEnvironments(): Promise<{
  homebrew: EnvironmentStatus;
  python: EnvironmentStatus;
  nodejs: EnvironmentStatus;
  nvm: EnvironmentStatus;
  flutter: EnvironmentStatus;
  androidStudio: EnvironmentStatus;
  java: EnvironmentStatus;
}> {
  const [homebrew, python, nodejs, nvm, flutter, androidStudio, java] = await Promise.all([
    checkHomebrew(),
    checkPython(),
    checkNodeJS(),
    checkNvm(),
    checkFlutter(),
    checkAndroidStudio(),
    checkJava(),
  ]);
  
  return {
    homebrew,
    python,
    nodejs,
    nvm,
    flutter,
    androidStudio,
    java,
  };
}
