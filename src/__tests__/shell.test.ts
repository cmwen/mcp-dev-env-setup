/**
 * Tests for Shell Utilities
 */

import {
  isMacOS,
  isLinux,
  isWindows,
  isSupported,
  getHomeDirectory,
  getShellConfigPath,
} from '../utils/shell';

describe('Shell Utilities', () => {
  describe('Platform Detection', () => {
    it('should correctly detect macOS', () => {
      const result = isMacOS();
      expect(typeof result).toBe('boolean');
      if (process.platform === 'darwin') {
        expect(result).toBe(true);
      }
    });

    it('should correctly detect Linux', () => {
      const result = isLinux();
      expect(typeof result).toBe('boolean');
      if (process.platform === 'linux') {
        expect(result).toBe(true);
      }
    });

    it('should correctly detect Windows', () => {
      const result = isWindows();
      expect(typeof result).toBe('boolean');
      if (process.platform === 'win32') {
        expect(result).toBe(true);
      }
    });

    it('should indicate if system is supported', () => {
      const result = isSupported();
      expect(typeof result).toBe('boolean');
      expect(result).toBe(isMacOS() || isLinux());
    });
  });

  describe('getHomeDirectory', () => {
    it('should return a valid home directory path', () => {
      const home = getHomeDirectory();
      expect(home).toBeDefined();
      expect(typeof home).toBe('string');
      expect(home.length).toBeGreaterThan(0);
    });
  });

  describe('getShellConfigPath', () => {
    it('should return a valid shell configuration path', () => {
      const configPath = getShellConfigPath();
      expect(configPath).toBeDefined();
      expect(typeof configPath).toBe('string');
      expect(configPath.length).toBeGreaterThan(0);
    });

    it('should return path ending with known config file', () => {
      const configPath = getShellConfigPath();
      const knownConfigs = ['.zshrc', '.bashrc', '.bash_profile', '.profile'];
      const endsWithKnown = knownConfigs.some((config) =>
        configPath.endsWith(config)
      );
      expect(endsWithKnown).toBe(true);
    });
  });
});
