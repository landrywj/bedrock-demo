import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { LambdaConfig } from '../config';

export interface AgentLambdaProps {
  functionName: string;
  codePath: string;
}

export class AgentLambda extends Construct {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: AgentLambdaProps) {
    super(scope, id);

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${props.functionName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    this.function = new lambda.Function(this, 'Function', {
      functionName: props.functionName,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(props.codePath),
      timeout: cdk.Duration.seconds(LambdaConfig.timeout),
      memorySize: LambdaConfig.memorySize,
      logGroup: logGroup
    });
  }
}
