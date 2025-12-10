export const AgentConfig = {
  agentName: 'BedrockDemoAgent',
  foundationModel: 'anthropic.claude-3-sonnet-20240229-v1:0',
  instruction: 'You are a friendly assistant. When asked to say hello or greet someone, use the sayHello action to respond with a greeting.',
  idleSessionTTL: 600,
  aliasName: 'prod'
};

export const LambdaConfig = {
  timeout: 30,
  memorySize: 256,
  runtime: 'nodejs20.x'
};
