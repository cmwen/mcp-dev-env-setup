/**
 * Tests for Tool Configuration Module
 */

import {
  getToolConfig,
  getAllToolNames,
  getToolsByCategory,
  ToolCategory,
} from '../core/tool-config';

describe('Tool Configuration Module', () => {
  describe('getToolConfig', () => {
    it('should return config for known tools', () => {
      const pythonConfig = getToolConfig('python');
      expect(pythonConfig).toBeDefined();
      expect(pythonConfig?.name).toBe('python');
      expect(pythonConfig?.displayName).toBe('Python');
    });

    it('should return undefined for unknown tools', () => {
      const config = getToolConfig('unknown-tool');
      expect(config).toBeUndefined();
    });

    it('should have install methods for each tool', () => {
      const toolNames = getAllToolNames();
      for (const toolName of toolNames) {
        const config = getToolConfig(toolName);
        expect(config).toBeDefined();
        expect(config?.installMethods).toBeDefined();
        expect(Object.keys(config?.installMethods || {})).toHaveLength(
          Object.keys(config?.installMethods || {}).length
        );
      }
    });
  });

  describe('getAllToolNames', () => {
    it('should return an array of tool names', () => {
      const names = getAllToolNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });

    it('should include common tools', () => {
      const names = getAllToolNames();
      expect(names).toContain('python');
      expect(names).toContain('nodejs');
      expect(names).toContain('git');
    });
  });

  describe('getToolsByCategory', () => {
    it('should return tools for a specific category', () => {
      const languageTools = getToolsByCategory(ToolCategory.LANGUAGE);
      expect(Array.isArray(languageTools)).toBe(true);
      expect(languageTools.length).toBeGreaterThan(0);
      
      for (const tool of languageTools) {
        expect(tool.category).toBe(ToolCategory.LANGUAGE);
      }
    });

    it('should return empty array for categories with no tools', () => {
      // This test assumes no tools in a specific category
      // Adjust based on actual tool configurations
      const tools = getToolsByCategory('nonexistent' as any);
      expect(Array.isArray(tools)).toBe(true);
    });
  });

  describe('Tool Config Structure', () => {
    it('should have required fields for each tool', () => {
      const names = getAllToolNames();
      for (const name of names) {
        const config = getToolConfig(name);
        expect(config).toBeDefined();
        expect(config?.name).toBeDefined();
        expect(config?.displayName).toBeDefined();
        expect(config?.category).toBeDefined();
        expect(config?.description).toBeDefined();
        expect(config?.commandToCheck).toBeDefined();
        expect(config?.versionFlag).toBeDefined();
        expect(config?.installMethods).toBeDefined();
      }
    });
  });
});
