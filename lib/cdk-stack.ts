import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
import { AgentConfig } from './config';
import { AgentLambda } from './constructs/agent-lambda';
import { BedrockAgent } from './constructs/bedrock-agent';
import { ActionGroup } from './constructs/action-group';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const actionHandlerLambda = new AgentLambda(this, 'ActionHandler', {
      functionName: 'bedrock-agent-action-handler',
      codePath: path.join(__dirname, '../lambda/action-handler')
    });

    const actionGroup = new ActionGroup(this, 'CustomerServiceActions', {
      actionGroupName: 'CustomerServiceActionGroup',
      description: 'Actions for customer service operations',
      lambdaFunction: actionHandlerLambda.function,
      schemaPath: path.join(__dirname, '../schemas/action-group-schema.json')
    });

    const agent = new BedrockAgent(this, 'BedrockAgent', {
      agentName: AgentConfig.agentName,
      instruction: AgentConfig.instruction,
      foundationModel: AgentConfig.foundationModel,
      idleSessionTTL: AgentConfig.idleSessionTTL,
      actionGroups: [actionGroup.actionGroupProperty]
    });

    actionHandlerLambda.function.grantInvoke(agent.agentRole);

    actionHandlerLambda.function.addPermission('BedrockInvoke', {
      principal: new cdk.aws_iam.ServicePrincipal('bedrock.amazonaws.com'),
      sourceArn: agent.agent.attrAgentArn
    });

    new cdk.CfnOutput(this, 'AgentId', {
      value: agent.agent.attrAgentId,
      description: 'Bedrock Agent ID'
    });

    new cdk.CfnOutput(this, 'AgentAliasId', {
      value: agent.alias.attrAgentAliasId,
      description: 'Bedrock Agent Alias ID'
    });

    new cdk.CfnOutput(this, 'AgentArn', {
      value: agent.agent.attrAgentArn,
      description: 'Bedrock Agent ARN'
    });

    new cdk.CfnOutput(this, 'LambdaArn', {
      value: actionHandlerLambda.function.functionArn,
      description: 'Action Handler Lambda ARN'
    });
  }
}
