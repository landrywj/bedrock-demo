import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as fs from 'fs';

export interface ActionGroupProps {
  actionGroupName: string;
  description: string;
  lambdaFunction: lambda.IFunction;
  schemaPath: string;
}

export class ActionGroup extends Construct {
  public readonly actionGroupProperty: bedrock.CfnAgent.AgentActionGroupProperty;

  constructor(scope: Construct, id: string, props: ActionGroupProps) {
    super(scope, id);

    const schema = JSON.parse(fs.readFileSync(props.schemaPath, 'utf-8'));

    this.actionGroupProperty = {
      actionGroupName: props.actionGroupName,
      description: props.description,
      actionGroupExecutor: {
        lambda: props.lambdaFunction.functionArn
      },
      apiSchema: {
        payload: JSON.stringify(schema)
      }
    };
  }
}
