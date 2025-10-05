/**
 * Tests for Package Manager Detection Module
 */

import { detectOS, OperatingSystem, PackageManager } from '../core/package-manager';

describe('Package Manager Module', () => {
  describe('detectOS', () => {
    it('should detect the operating system', () => {
      const os = detectOS();
      expect(os).toBeDefined();
      expect(Object.values(OperatingSystem)).toContain(os);
    });

    it('should return MACOS on darwin platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
      });
      
      const os = detectOS();
      expect(os).toBe(OperatingSystem.MACOS);
      
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
      });
    });

    it('should return LINUX on linux platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'linux',
      });
      
      const os = detectOS();
      expect(os).toBe(OperatingSystem.LINUX);
      
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
      });
    });
  });

  describe('needsPackageManagerInstall', () => {
    it('should return true for macOS', () => {
      const { needsPackageManagerInstall } = require('../core/package-manager');
      expect(needsPackageManagerInstall(OperatingSystem.MACOS)).toBe(true);
    });

    it('should return false for Linux', () => {
      const { needsPackageManagerInstall } = require('../core/package-manager');
      expect(needsPackageManagerInstall(OperatingSystem.LINUX)).toBe(false);
    });
  });

  describe('getPackageManagerInstallCommand', () => {
    it('should return Homebrew install command for macOS', () => {
      const { getPackageManagerInstallCommand } = require('../core/package-manager');
      const cmd = getPackageManagerInstallCommand(OperatingSystem.MACOS);
      expect(cmd).toBeDefined();
      expect(cmd).toContain('Homebrew');
    });

    it('should return null for Linux', () => {
      const { getPackageManagerInstallCommand } = require('../core/package-manager');
      const cmd = getPackageManagerInstallCommand(OperatingSystem.LINUX);
      expect(cmd).toBeNull();
    });
  });
});
