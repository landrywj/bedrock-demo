# Amazon Bedrock Agent CDK Application Specification

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

The core component that orchestrates the entire workflow. The agent:
- Uses a foundation model (e.g., Claude 3 Sonnet or Haiku) for natural language understanding
- Interprets user intent and determines which actions to invoke
- Maintains conversation state across multiple turns
- Generates natural language responses based on action results

### 2. Agent Action Groups

Action groups define the capabilities available to the agent. Each action group:
- Represents a set of related functions the agent can call
- Is backed by a Lambda function that executes the actual business logic
- Has an OpenAPI schema that describes available operations, parameters, and responses
- Enables the agent to interact with external systems or perform computations

### 3. Lambda Functions

Serverless functions that implement the agent's capabilities:
- **Action Handler Lambda**: Processes requests from the agent's action groups
- Receives structured input from the agent (function name, parameters)
- Executes business logic (database queries, API calls, calculations)
- Returns structured responses that the agent incorporates into its answer

### 4. IAM Roles and Permissions

Security components that enable secure communication:
- **Agent Role**: Allows the agent to invoke foundation models and call Lambda functions
- **Lambda Execution Role**: Grants Lambda functions access to required AWS services
- Follows principle of least privilege for all permissions

### 5. Agent Aliases

Versioning mechanism for the agent:
- Enables deployment of different agent versions (dev, staging, production)
- Allows testing changes without affecting production traffic
- Supports rollback to previous versions if needed

## Functional Requirements

### Agent Configuration

The agent must be configured with:
- **Instruction**: A system prompt that defines the agent's role, personality, and behavior guidelines
- **Foundation Model**: Selection of the underlying LLM (e.g., anthropic.claude-3-sonnet-20240229-v1:0)
- **Idle Session TTL**: Timeout for conversation sessions
- **Action Groups**: One or more action groups defining available capabilities

### Action Group Schema

Each action group requires:
- **OpenAPI 3.0 Schema**: Defines available operations with:
  - Operation names and descriptions
  - Input parameters (types, descriptions, required/optional)
  - Response formats
  - Example requests and responses
- **Lambda Function ARN**: The backend function that executes the operations
- **Description**: Human-readable explanation of the action group's purpose

### Lambda Function Interface

Action handler Lambda functions must:
- Accept events in the Bedrock Agent action format containing:
  - `actionGroup`: Name of the action group being invoked
  - `apiPath`: The specific operation being called
  - `parameters`: Array of parameter objects with name and value
  - `sessionId`: Unique identifier for the conversation session
  - `sessionAttributes`: Key-value pairs for maintaining state
- Return responses in the required format:
  - `messageVersion`: Protocol version (1.0)
  - `response`: Object containing:
    - `actionGroup`: Echo of the action group name
    - `apiPath`: Echo of the operation path
    - `httpMethod`: HTTP method used
    - `httpStatusCode`: Status code (200 for success)
    - `responseBody`: Object with content type and body containing the result

### Conversation Flow

The agent interaction follows this pattern:
1. User sends a natural language query
2. Agent analyzes the query using the foundation model
3. Agent determines if action invocation is needed
4. If actions are needed, agent calls appropriate Lambda functions
5. Lambda functions execute and return structured data
6. Agent synthesizes the results into a natural language response
7. Response is returned to the user with optional citations and reasoning trace

## Non-Functional Requirements

### Security

- All resources must use IAM roles with minimal required permissions
- Agent must only invoke explicitly defined action groups
- Lambda functions must validate input parameters
- No hardcoded credentials or secrets in code
- Use AWS Secrets Manager or Parameter Store for sensitive configuration

### Scalability

- Lambda functions must handle concurrent invocations
- Agent must support multiple simultaneous conversations
- Architecture must be stateless to enable horizontal scaling

### Observability

- CloudWatch Logs must capture:
  - Agent invocation logs
  - Lambda execution logs
  - Error traces and stack traces
- CDK outputs must expose:
  - Agent ID
  - Agent Alias ID
  - Lambda function ARNs
  - IAM role ARNs

### Cost Optimization

- Use appropriate foundation model for the use case (Haiku for simple tasks, Sonnet for complex reasoning)
- Configure Lambda memory and timeout appropriately
- Use agent aliases to avoid unnecessary redeployments

## Example Use Cases

The demo agent could support use cases such as:

### Customer Service Agent
- Check order status
- Process returns
- Answer product questions
- Schedule appointments

### Data Analysis Agent
- Query databases
- Generate reports
- Perform calculations
- Visualize data trends

### IT Support Agent
- Troubleshoot issues
- Reset passwords
- Check system status
- Create support tickets

## Deployment Workflow

The CDK application should support:

1. **Synthesis**: Generate CloudFormation templates from CDK code
2. **Deployment**: Create all resources in the target AWS account/region
3. **Testing**: Invoke the agent with sample queries to verify functionality
4. **Updates**: Modify agent configuration or action groups and redeploy
5. **Cleanup**: Destroy all resources when no longer needed

## CDK Stack Structure

The application should be organized as:

### Main Stack
Contains all Bedrock Agent resources:
- Agent definition
- Action groups
- Agent alias
- IAM roles

### Lambda Stack (Optional)
Separate stack for Lambda functions:
- Action handler functions
- Shared Lambda layers
- Function-specific IAM roles

### Outputs
The stack should export:
- Agent ID for programmatic invocation
- Agent Alias ID for API calls
- Agent ARN for cross-stack references
- API endpoint information (if using API Gateway)

## Configuration Parameters

The application should accept parameters for:
- **Agent Name**: Identifier for the agent
- **Agent Instruction**: System prompt defining behavior
- **Foundation Model ID**: Which Bedrock model to use
- **Action Group Definitions**: Array of action group configurations
- **Environment**: Deployment environment (dev, staging, prod)
- **Region**: AWS region for deployment

## Testing Strategy

The application should enable testing through:
- **Unit Tests**: Validate Lambda function logic
- **Integration Tests**: Test agent invocation end-to-end
- **Sample Queries**: Predefined test cases demonstrating capabilities
- **Reasoning Trace**: Enable trace to debug agent decision-making

## Future Enhancements

Potential extensions to the base application:
- **Knowledge Bases**: Add RAG capabilities for document-based Q&A
- **Guardrails**: Implement content filtering and safety controls
- **Memory**: Add long-term memory for personalization
- **Multi-Agent**: Orchestrate multiple specialized agents
- **Streaming**: Support streaming responses for better UX
- **API Gateway**: Add REST API for web/mobile integration
- **Authentication**: Integrate with Cognito for user management

## Success Criteria

The application is successful when:
- Agent can be invoked programmatically via AWS SDK
- Agent correctly interprets natural language queries
- Action groups execute and return expected results
- Agent generates coherent, contextually appropriate responses
- All resources deploy without errors
- Logs provide sufficient debugging information
- Infrastructure can be torn down cleanly

## References

- AWS Bedrock Agent Documentation
- AWS CDK TypeScript Documentation
- OpenAPI 3.0 Specification
- AWS Lambda Best Practices
- Bedrock Agent Action Group Schema Requirements
