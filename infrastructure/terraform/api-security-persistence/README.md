# API security + persistence (DynamoDB + JWT authorizer + account Lambda wiring)

This Terraform stack provisions:

- DynamoDB on-demand table for per-user account state
- API Gateway JWT authorizer backed by Cognito User Pool tokens
- Authenticated `/account/*` route wiring to an account-state Lambda integration
- Least-privilege IAM policy for Lambda access to the user-state DynamoDB table
- Lambda environment variables for DynamoDB + Cognito auth context

The existing recipe route is intentionally not modified by this stack, so it remains available with its current behavior/auth mode.

## Prerequisites

1. Terraform `>= 1.5`
2. AWS credentials with permissions for API Gateway v2, Lambda, IAM, DynamoDB
3. Existing Cognito User Pool + App Client (from `../cognito-social-auth`)
4. Existing API Gateway HTTP API ID
5. Deployable Lambda zip artifact for account-state handlers

## Configure variables

```bash
cp terraform.tfvars.example terraform.tfvars
```

Set at minimum:

- `api_gateway_id`
- `cognito_user_pool_id`
- `cognito_app_client_id`
- `account_lambda_package_path`

Optional overrides:

- `dynamodb_user_state_table_name`
- `account_lambda_function_name`
- `account_routes`
- `api_gateway_stage_name` (default `$default`)

Default `account_routes`:

```hcl
[
  "GET /account/state",
  "PUT /account/state",
  "POST /account/migrate-guest"
]
```

## Plan (default) and apply (only when approved)

```bash
terraform init
terraform plan
# terraform apply   # run only when explicitly approved
```

## Runtime contract for account Lambda

This stack injects:

- `USER_STATE_TABLE_NAME`
- `COGNITO_USER_POOL_ID`
- `COGNITO_APP_CLIENT_ID`
- `COGNITO_ISSUER`

Your account Lambda code should read these values and key all persisted records by authenticated user subject.
