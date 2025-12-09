import { AgentConfig, LambdaConfig } from '../lib/config';

describe('Configuration', () => {
  describe('AgentConfig', () => {
    test('has required agent properties', () => {
      expect(AgentConfig).toHaveProperty('agentName');
      expect(AgentConfig).toHaveProperty('foundationModel');
      expect(AgentConfig).toHaveProperty('instruction');
      expect(AgentConfig).toHaveProperty('idleSessionTTL');
      expect(AgentConfig).toHaveProperty('aliasName');
    });

    test('agentName is defined', () => {
      expect(AgentConfig.agentName).toBeDefined();
      expect(typeof AgentConfig.agentName).toBe('string');
      expect(AgentConfig.agentName.length).toBeGreaterThan(0);
    });

    test('foundationModel is valid Bedrock model ID', () => {
      expect(AgentConfig.foundationModel).toBeDefined();
      expect(typeof AgentConfig.foundationModel).toBe('string');
      expect(AgentConfig.foundationModel).toMatch(/^anthropic\.claude/);
    });

    test('instruction is defined and non-empty', () => {
      expect(AgentConfig.instruction).toBeDefined();
      expect(typeof AgentConfig.instruction).toBe('string');
      expect(AgentConfig.instruction.length).toBeGreaterThan(0);
    });

    test('idleSessionTTL is a positive number', () => {
      expect(AgentConfig.idleSessionTTL).toBeDefined();
      expect(typeof AgentConfig.idleSessionTTL).toBe('number');
      expect(AgentConfig.idleSessionTTL).toBeGreaterThan(0);
    });

    test('aliasName is defined', () => {
      expect(AgentConfig.aliasName).toBeDefined();
      expect(typeof AgentConfig.aliasName).toBe('string');
      expect(AgentConfig.aliasName.length).toBeGreaterThan(0);
    });
  });

  describe('LambdaConfig', () => {
    test('has required Lambda properties', () => {
      expect(LambdaConfig).toHaveProperty('timeout');
      expect(LambdaConfig).toHaveProperty('memorySize');
      expect(LambdaConfig).toHaveProperty('runtime');
    });

    test('timeout is a positive number', () => {
      expect(LambdaConfig.timeout).toBeDefined();
      expect(typeof LambdaConfig.timeout).toBe('number');
      expect(LambdaConfig.timeout).toBeGreaterThan(0);
      expect(LambdaConfig.timeout).toBeLessThanOrEqual(900); // AWS Lambda max timeout
    });

    test('memorySize is valid', () => {
      expect(LambdaConfig.memorySize).toBeDefined();
      expect(typeof LambdaConfig.memorySize).toBe('number');
      expect(LambdaConfig.memorySize).toBeGreaterThanOrEqual(128);
      expect(LambdaConfig.memorySize).toBeLessThanOrEqual(10240);
      expect(LambdaConfig.memorySize % 64).toBe(0); // Must be multiple of 64MB
    });

    test('runtime is valid Node.js version', () => {
      expect(LambdaConfig.runtime).toBeDefined();
      expect(typeof LambdaConfig.runtime).toBe('string');
      expect(LambdaConfig.runtime).toMatch(/^nodejs\d+\.x$/);
    });
  });
});

