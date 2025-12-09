import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as fs from 'fs';

export interface ActionGroupProps {
  agentId: string;
  agentVersion: string;
  actionGroupName: string;
  description: string;
  lambdaFunction: lambda.IFunction;
  schemaPath: string;
}

export class ActionGroup extends Construct {
  public readonly actionGroup: bedrock.CfnAgentActionGroup;

  constructor(scope: Construct, id: string, props: ActionGroupProps) {
    super(scope, id);

    const schema = JSON.parse(fs.readFileSync(props.schemaPath, 'utf-8'));

    this.actionGroup = new bedrock.CfnAgentActionGroup(this, 'ActionGroup', {
      agentId: props.agentId,
      agentVersion: props.agentVersion,
      actionGroupName: props.actionGroupName,
      description: props.description,
      actionGroupExecutor: {
        lambda: props.lambdaFunction.functionArn
      },
      apiSchema: {
        payload: JSON.stringify(schema)
      }
    });
  }
}
