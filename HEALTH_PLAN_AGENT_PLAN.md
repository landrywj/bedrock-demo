# HealthPlan Advisor Agent - Implementation Plan

## Overview
This plan outlines the implementation of a Bedrock Agent that helps Oregonians select the best healthcare plan from Healthcare.gov. The agent uses CMS Public Use Files (PUF) data stored in S3 and queried via Athena.

## Architecture Components

### 1. Data Storage & Query Layer
- **S3 Bucket**: Store filtered CMS PUF files (Oregon-only data)
  - `Rate_PUF.csv` - Premium rates (age-banded, 21-year-old base)
  - `Plan_Attributes_PUF.csv` - Plan details, marketing names, HSA eligibility
  - `Service_Area_PUF.csv` - County to Rating Area mapping
  - Zip code to County mapping data
- **Athena Database & Tables**: Query the CSV files using SQL
- **Glue Catalog**: Schema definitions for the PUF data

### 2. Lambda Functions
- **Action Handler Lambda**: Implements two functions:
  - `GetOregonRatingArea`: Converts zip code to Rating Area ID
  - `GetOregonPlans`: Retrieves plans with age curve calculation applied

### 3. Bedrock Agent
- **Agent Name**: `HealthPlanAdvisorAgent`
- **Action Group**: `OregonPlanDataService`
- **Instructions**: Include HSA detection logic and Oregon-specific guidance

## Implementation Steps

### Phase 1: Infrastructure Setup

#### 1.1 Create S3 Bucket for Data Storage
- [ ] Create S3 bucket construct for CMS PUF files
- [ ] Configure bucket with appropriate lifecycle policies
- [ ] Add bucket name to config for reference
- [ ] Note: User will provide the filtered CSV files to upload

#### 1.2 Create Athena Resources
- [ ] Create Glue Database for Oregon healthcare data
- [ ] Create Glue Tables for:
  - `oregon_rates` (from Rate_PUF.csv)
  - `oregon_plan_attributes` (from Plan_Attributes_PUF.csv)
  - `oregon_service_areas` (from Service_Area_PUF.csv)
  - `oregon_zip_county` (zip code to county mapping)
- [ ] Create Athena Workgroup
- [ ] Grant Lambda permissions to query Athena

#### 1.3 Update IAM Permissions
- [ ] Add Athena query permissions to Lambda execution role
- [ ] Add S3 read permissions for the data bucket
- [ ] Add Glue catalog read permissions

### Phase 2: Lambda Function Implementation

#### 2.1 Update Action Handler Lambda
- [ ] Remove customer service boilerplate code (`/checkOrderStatus`, `/processReturn`)
- [ ] Implement `GetOregonRatingArea` function:
  - Accept `zipCode` (required) and `county` (optional)
  - Query zip code to county mapping
  - Handle edge cases where zip spans multiple counties
  - Query Service Area PUF to get Rating Area ID
  - Return `{ ratingAreaId, countyName }`
- [ ] Implement `GetOregonPlans` function:
  - Accept `ratingAreaId` (required), `age` (required), `smoker` (optional)
  - Query Rate_PUF and Plan_Attributes_PUF via Athena
  - Apply Federal Age Curve multiplier based on age
  - Apply smoker multiplier if applicable
  - Calculate monthly premium: `baseRate * ageMultiplier * smokerMultiplier`
  - Return array of plans with: `planId`, `carrier`, `marketingName`, `monthlyPremium`, `deductible`, `hsaEligible`

#### 2.2 Add Supporting Utilities
- [ ] Create age curve calculation utility (Federal Age Curve multipliers)
- [ ] Create smoker multiplier utility
- [ ] Add Athena query helper functions
- [ ] Add error handling and logging

### Phase 3: Action Group Schema

#### 3.1 Update OpenAPI Schema
- [ ] Replace customer service schema with Oregon Plan Data Service schema
- [ ] Define `/GetOregonRatingArea` endpoint:
  - Parameters: `zipCode` (string, required), `county` (string, optional)
  - Response: `{ ratingAreaId: string, countyName: string }`
- [ ] Define `/GetOregonPlans` endpoint:
  - Parameters: `ratingAreaId` (string, required), `age` (integer, required), `smoker` (boolean, optional)
  - Response: Array of plan objects with all required fields

### Phase 4: Agent Configuration

#### 4.1 Update Agent Config
- [ ] Change agent name to `HealthPlanAdvisorAgent`
- [ ] Update agent instructions with:
  - Oregon-specific context
  - HSA detection and tax savings guidance
  - "Sweet Spot" logic for Standard vs Non-Standard plans
  - Age curve explanation
  - County/Zip code handling instructions

#### 4.2 Update Action Group
- [ ] Rename action group to `OregonPlanDataService`
- [ ] Update description to reflect healthcare plan advisory purpose

### Phase 5: Stack Updates

#### 5.1 Update CDK Stack
- [ ] Remove customer service references
- [ ] Add S3 bucket construct
- [ ] Add Athena/Glue resources
- [ ] Update Lambda permissions
- [ ] Update action group name and description
- [ ] Add CloudFormation outputs for:
  - S3 bucket name
  - Athena database name
  - Athena workgroup name

### Phase 6: Cleanup

#### 6.1 Remove Boilerplate
- [ ] Remove customer service handler code from Lambda
- [ ] Remove customer service schema
- [ ] Update any test files that reference customer service
- [ ] Update README/documentation

## Technical Details

### Age Curve Calculation
The Federal Age Curve uses multipliers based on age:
- Age 21: 1.0 (base rate)
- Age 30: ~1.1
- Age 40: ~1.3
- Age 44: ~1.397
- Age 50: ~1.5
- Age 60: ~2.0
- Age 64: ~2.2

Formula: `monthlyPremium = baseRate * ageMultiplier * (smoker ? 1.5 : 1.0)`

### Athena Query Examples

**Get Rating Area from Zip:**
```sql
SELECT rating_area_id, county_name 
FROM oregon_service_areas 
WHERE zip_code = '97204' AND (county_name = 'Multnomah' OR county_name IS NULL)
```

**Get Plans for Rating Area:**
```sql
SELECT r.plan_id, r.base_rate, pa.marketing_name, pa.carrier, pa.deductible, pa.hsa_eligible
FROM oregon_rates r
JOIN oregon_plan_attributes pa ON r.plan_id = pa.plan_id
WHERE r.rating_area_id = 'Rating Area 1'
AND r.state_code = 'OR'
```

### Data File Requirements
User needs to provide filtered CSV files:
1. `Rate_PUF.csv` - Filtered for `StateCode = 'OR'`
2. `Plan_Attributes_PUF.csv` - Filtered for `StateCode = 'OR'`
3. `Service_Area_PUF.csv` - Filtered for `StateCode = 'OR'`
4. Zip code to County mapping file (may need to be created/obtained separately)

## Dependencies

### AWS CDK Constructs Needed
- `aws-cdk-lib/aws-s3` - S3 bucket
- `aws-cdk-lib/aws-athena` - Athena workgroup
- `aws-cdk-lib/aws-glue` - Glue database and tables
- `aws-cdk-lib/aws-iam` - IAM roles and policies

### Lambda Dependencies
- AWS SDK v3 for Athena (`@aws-sdk/client-athena`)
- AWS SDK v3 for S3 (if needed for data access)

## Testing Considerations

- Unit tests for age curve calculations
- Unit tests for Athena query construction
- Integration tests for Lambda handlers
- Mock Athena responses for testing
- Test edge cases (zip codes spanning counties, missing data)

## Next Steps After Implementation

1. User uploads filtered CSV files to S3 bucket
2. Verify Athena tables are queryable
3. Test Lambda functions with sample queries
4. Test Bedrock Agent with sample conversations
5. Validate HSA detection logic
6. Validate "Sweet Spot" recommendations
