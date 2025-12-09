export const AgentConfig = {
  agentName: 'BedrockDemoAgent',
  foundationModel: 'anthropic.claude-3-sonnet-20240229-v1:0',
  instruction: 'You are a helpful customer service agent. You can check order status, process returns, and answer product questions. Be concise and professional.',
  idleSessionTTL: 600,
  aliasName: 'prod'
};

export const LambdaConfig = {
  timeout: 30,
  memorySize: 256,
  runtime: 'nodejs20.x'
};
