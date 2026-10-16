# Bedrock Demo Plan

Updated: 2026-10-16. Steps 1–4 are implemented. Step 5 (deploy and run the two prompts) is the remaining gate.

## Goal

Ship a deployable Amazon Bedrock Agent, defined in CDK, that a person can talk to in natural language. The agent should call a Lambda-backed customer-service action group, keep the conversation in session, and return a normal reply. Success is the criteria in [SPEC.md](./SPEC.md): the stack deploys, a sample order-status question and a sample return question both complete, CloudWatch shows the Lambda run, and `cdk destroy` removes the stack.

[CONCEPT.md](./CONCEPT.md) describes a separate RAG stack (S3, Knowledge Bases, OpenSearch). That work is not this demo. Do not start it until the agent conversation below works.

## Current status

The stack, schema, handler, unit tests, and demo script are in the repo. Nothing has been deployed.

What is in place:

- CDK app (`bin/cdk.ts`, `lib/cdk-stack.ts`) targeted at the CLI account and region. It builds one agent, one enabled action group, one bundled Lambda, an agent role, a `prod` alias, and outputs for agent id, alias id, agent ARN, and Lambda ARN.
- The agent prepares itself on deploy (`autoPrepare`) and uses the US inference profile `us.anthropic.claude-sonnet-4-6`.
- Action group schema for `POST /checkOrderStatus` and `POST /processReturn`.
- Lambda handler that reads those fields from the Bedrock `requestBody` (and falls back to `parameters`). Missing `orderId` or `reason` returns HTTP 400. Success responses are still canned.
- `scripts/invoke-demo.ts` and the README “Run the demo” section. `npm run demo` asks the order-status question and the return question in one session.
- Unit tests for the stack, constructs, config, schema, and handler.

## Last change

Steps 1–4 of this plan, on top of `0f5ca04` (PR #3, 2025-12-10, “Fix ActionGroup import error”).

That earlier commit replaced a broken ActionGroup import with a `CfnAgent` action-group property. The commit before it (`81f2813`) added the unit test suite.

## What still blocks a live demo

1. **No deploy has been run.** Bootstrap, deploy, and the two sample prompts are documented but not executed. Bedrock Agents Classic is in maintenance and is not offered to new AWS accounts. The live run has to confirm this account can still create an agent, that Claude Sonnet 4.6 is enabled, and that the US inference profile matches the deploy region.
2. **The instruction over-promises.** It says the agent can answer product questions. There is no action and no knowledge base for that.

## Next work

1. **Deploy and run the two prompts.** Follow “Run the demo” in [README.md](./README.md). This is the gate. Fix whatever the live call shows (permissions, model access, region prefix, schema validation) before calling the demo ready.

After that, if the demo should keep going:

- Replace `AmazonBedrockFullAccess` with invoke-model and Lambda permissions only.
- Either remove “answer product questions” from the instruction or add a knowledge base. That second option is the RAG work in `CONCEPT.md`, and it is a new slice, not part of getting this demo ready.
