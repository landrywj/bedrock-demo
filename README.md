# AWS Bedrock Agent CDK Application

## Overview

This AWS CDK application provisions a complete Amazon Bedrock Agent infrastructure similar to the AWS Bedrock interactive demo. The application creates an intelligent agent capable of understanding natural language queries, executing actions through function calling, and maintaining conversational context.

## Purpose

The application demonstrates how to build a production-ready Bedrock Agent that can:
- Process natural language requests from users
- Execute business logic through action groups
- Maintain conversation history and context
- Integrate with backend systems via Lambda functions
- Provide structured responses with reasoning traces

## Architecture Components

### 1. Amazon Bedrock Agent
The core agent resource that orchestrates natural language understanding, action planning, and response generation using Claude models.

### 2. Agent Action Groups
Defines the set of actions the agent can perform, including function schemas and descriptions for Claude to understand available capabilities.

### 3. Lambda Functions
Backend functions that execute the actions invoked by the agent, processing requests and returning results to the agent.

### 4. IAM Roles and Permissions
Security configuration granting the agent and Lambda functions appropriate permissions to access AWS services.

### 5. Agent Aliases
Deployment aliases for agent versions, enabling version management and safe rollouts in production environments.

For more information see [SPEC.md](./SPEC.md)

# Developers

This is a standardized AWS CDK app, developed with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


## Project Structure

bedrock-demo/
├── lib/
│   ├── constructs/
│   │   ├── bedrock-agent.ts          # Bedrock Agent construct
│   │   ├── action-group.ts           # Action Group construct
│   │   └── agent-lambda.ts           # Lambda function construct
│   ├── cdk-stack.ts                  # Main stack (orchestrates all resources)
│   └── config.ts                     # Configuration and constants
├── lambda/
│   └── action-handler/
│       ├── index.ts                  # Lambda entry point
│       ├── handlers/                 # Individual action handlers
│       └── types.ts                  # TypeScript types for events/responses
├── schemas/
│   └── action-group-schema.json      # OpenAPI 3.0 schema
└── test/
    └── cdk.test.ts                   # Unit tests