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

