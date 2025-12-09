# Test Suite Documentation

This document describes the comprehensive test suite for the AWS Bedrock Agent CDK application.

## Test Coverage

The test suite includes **59 tests** across **6 test files**, providing comprehensive coverage of:

### 1. CDK Stack Tests (`test/cdk-stack.test.ts`)
Tests the main CDK stack that orchestrates all resources:
- Lambda function creation and configuration
- Bedrock Agent creation with correct properties
- IAM roles and permissions
- Agent alias configuration
- Action group setup
- Stack outputs
- Resource dependencies

**17 tests** covering infrastructure as code validation.

### 2. Lambda Handler Tests (`test/lambda-handler.test.ts`)
Unit tests for the Lambda function business logic:
- `/checkOrderStatus` endpoint with valid and missing parameters
- `/processReturn` endpoint with various scenarios
- Error handling for unknown API paths
- Response format validation (Bedrock Agent format compliance)
- Unique return ID generation
- Parameter extraction logic

**13 tests** covering Lambda function behavior.

### 3. Construct Tests (`test/constructs.test.ts`)
Unit tests for individual CDK constructs:
- **BedrockAgent Construct**: Agent creation, IAM roles, aliases
- **AgentLambda Construct**: Lambda function configuration, log retention
- **ActionGroup Construct**: Schema reading, Lambda executor configuration

**9 tests** covering construct functionality.

### 4. Configuration Tests (`test/config.test.ts`)
Validates configuration constants:
- Agent configuration properties (name, model, instructions, TTL)
- Lambda configuration (timeout, memory, runtime)
- Value validation (positive numbers, valid formats)

**8 tests** covering configuration validation.

### 5. Schema Tests (`test/schema.test.ts`)
Validates the OpenAPI 3.0 schema file:
- Schema file existence and JSON validity
- OpenAPI 3.0 format compliance
- Endpoint definitions (`/checkOrderStatus`, `/processReturn`)
- Request/response schema validation
- Required fields and data types

**12 tests** covering schema validation.

### 6. Placeholder Test (`test/cdk.test.ts`)
Maintains backwards compatibility with the original test file structure.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- test/lambda-handler.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Test Dependencies

- **Jest**: Test framework
- **ts-jest**: TypeScript support for Jest
- **@aws-cdk/assertions**: CDK assertion library for infrastructure testing
- **aws-cdk-lib/assertions**: CDK v2 assertions (Template, Match utilities)

## Test Structure

Each test file follows this pattern:
1. **Setup**: Create CDK app/stack or prepare test data
2. **Execution**: Create resources or invoke functions
3. **Assertion**: Verify expected behavior and properties

## Key Testing Patterns

### CDK Stack Testing
Uses `Template.fromStack()` to extract CloudFormation template and validate:
- Resource existence and properties
- IAM policies and permissions
- Resource dependencies
- Stack outputs

### Lambda Function Testing
Direct function invocation with mock events:
- Validates business logic
- Tests error handling
- Verifies response format compliance

### Construct Testing
Isolated construct testing:
- Validates construct properties
- Tests resource creation
- Verifies configuration application

## Handling Bedrock Construct Availability

Some tests gracefully handle cases where Bedrock constructs may not be available in certain CDK versions:
- Tests check for construct availability before execution
- Skip with warning if constructs aren't available
- This ensures tests pass in different CDK environments

## Test Best Practices

1. **Isolation**: Each test is independent and can run in any order
2. **Clarity**: Test names clearly describe what they're testing
3. **Coverage**: Tests cover both happy paths and error cases
4. **Maintainability**: Tests are organized by component and functionality
5. **Documentation**: Test structure serves as documentation

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:
- All tests are deterministic (no flaky tests)
- No external dependencies required (except CDK libraries)
- Fast execution time (~10-12 seconds)
- Clear failure messages for debugging

## Future Test Enhancements

Potential additions to the test suite:
- Integration tests with actual AWS resources (requires AWS credentials)
- End-to-end tests that invoke the Bedrock Agent
- Performance tests for Lambda function
- Schema evolution tests
- Multi-environment configuration tests

