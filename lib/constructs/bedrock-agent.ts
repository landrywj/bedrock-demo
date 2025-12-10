import * as cdk from 'aws-cdk-lib';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface BedrockAgentProps {
  agentName: string;
  instruction: string;
  foundationModel: string;
  idleSessionTTL: number;
  actionGroups?: bedrock.CfnAgent.AgentActionGroupProperty[];
}

export class BedrockAgent extends Construct {
  public readonly agent: bedrock.CfnAgent;
  public readonly agentRole: iam.Role;
  public readonly alias: bedrock.CfnAgentAlias;

  constructor(scope: Construct, id: string, props: BedrockAgentProps) {
    super(scope, id);

    this.agentRole = new iam.Role(this, 'AgentRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')
      ]
    });

    this.agent = new bedrock.CfnAgent(this, 'Agent', {
      agentName: props.agentName,
      agentResourceRoleArn: this.agentRole.roleArn,
      foundationModel: props.foundationModel,
      instruction: props.instruction,
      idleSessionTtlInSeconds: props.idleSessionTTL,
      actionGroups: props.actionGroups
    });

    this.alias = new bedrock.CfnAgentAlias(this, 'AgentAlias', {
      agentId: this.agent.attrAgentId,
      agentAliasName: 'prod'
    });
  }
}
