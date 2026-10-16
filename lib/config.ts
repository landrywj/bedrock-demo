export const AgentConfig = {
  agentName: 'BedrockDemoAgent',
  // US geographic inference profile. Claude Sonnet 4.6 is not available on-demand.
  // Use the eu., jp., or global. prefix when deploying outside US regions.
  foundationModel: 'us.anthropic.claude-sonnet-4-6',
  instruction: 'You are a helpful customer service agent. You can check order status, process returns, and answer product questions. Be concise and professional.',
  idleSessionTTL: 600,
  aliasName: 'prod'
};

export const LambdaConfig = {
  timeout: 30,
  memorySize: 256,
  runtime: 'nodejs20.x'
};
