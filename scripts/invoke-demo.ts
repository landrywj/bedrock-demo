import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  Trace,
} from '@aws-sdk/client-bedrock-agent-runtime';
import {
  CloudFormationClient,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';

const STACK_NAME = process.env.STACK_NAME ?? 'CdkStack';
const LOG_GROUP = '/aws/lambda/bedrock-agent-action-handler';

const PROMPTS = [
  'What is the status of order ORD-12345?',
  'Process a return for order ORD-12345 because the product is defective.',
];

function region(): string {
  const value = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
  if (!value) {
    throw new Error('Set AWS_REGION to the region where the stack was deployed.');
  }
  return value;
}

async function agentIds(awsRegion: string): Promise<{ agentId: string; agentAliasId: string }> {
  if (process.env.AGENT_ID && process.env.AGENT_ALIAS_ID) {
    return { agentId: process.env.AGENT_ID, agentAliasId: process.env.AGENT_ALIAS_ID };
  }

  const cloudFormation = new CloudFormationClient({ region: awsRegion });
  const result = await cloudFormation.send(new DescribeStacksCommand({ StackName: STACK_NAME }));
  const outputs = result.Stacks?.[0]?.Outputs ?? [];
  const output = (key: string) => outputs.find((item) => item.OutputKey === key)?.OutputValue;
  const agentId = output('AgentId');
  const agentAliasId = output('AgentAliasId');

  if (!agentId || !agentAliasId) {
    throw new Error(`Stack ${STACK_NAME} is missing AgentId or AgentAliasId. Deploy the stack first.`);
  }

  return { agentId, agentAliasId };
}

function traceSummary(trace: Trace | undefined): string | undefined {
  const apiPath = trace?.orchestrationTrace?.invocationInput?.actionGroupInvocationInput?.apiPath;
  if (apiPath) {
    return `called ${apiPath}`;
  }
  if (trace?.orchestrationTrace?.observation?.actionGroupInvocationOutput) {
    return 'received action result';
  }
  return undefined;
}

async function ask(
  client: BedrockAgentRuntimeClient,
  agentId: string,
  agentAliasId: string,
  sessionId: string,
  inputText: string
): Promise<{ text: string; steps: string[] }> {
  const response = await client.send(new InvokeAgentCommand({
    agentId,
    agentAliasId,
    sessionId,
    inputText,
    enableTrace: true,
  }));

  let text = '';
  const steps: string[] = [];

  if (!response.completion) {
    return { text, steps };
  }

  for await (const event of response.completion) {
    if (event.chunk?.bytes) {
      text += new TextDecoder().decode(event.chunk.bytes);
    }
    const summary = traceSummary(event.trace?.trace);
    if (summary) {
      steps.push(summary);
    }
    if (process.env.TRACE === '1' && event.trace) {
      console.log(JSON.stringify(event.trace, null, 2));
    }
  }

  return { text, steps };
}

async function main(): Promise<void> {
  const awsRegion = region();
  const { agentId, agentAliasId } = await agentIds(awsRegion);
  const client = new BedrockAgentRuntimeClient({ region: awsRegion });
  const sessionId = `demo-${Date.now()}`;

  console.log(`Region: ${awsRegion}`);
  console.log(`Agent: ${agentId}`);
  console.log(`Alias: ${agentAliasId}`);
  console.log(`Session: ${sessionId}`);

  for (const prompt of PROMPTS) {
    console.log(`\nYou: ${prompt}`);
    const { text, steps } = await ask(client, agentId, agentAliasId, sessionId, prompt);
    if (steps.length > 0) {
      console.log(`Trace: ${steps.join('; ')}`);
    }
    console.log(`Agent: ${text}`);
  }

  console.log(`\nLambda logs: ${LOG_GROUP}`);
  console.log('Set TRACE=1 to print the full reasoning trace.');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
