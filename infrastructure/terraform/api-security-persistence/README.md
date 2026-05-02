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
- Guardrail thresholds/action variables (latency, error-rate, Dynamo usage)

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

## Observability guardrails for backend refactor rollout

This stack now creates CloudWatch alarms (when `enable_guardrail_alarms = true`) for:

- Lambda p50 latency (`Duration` p50)
- Lambda p95 latency (`Duration` p95)
- Lambda error rate (`Errors / Invocations * 100`)
- DynamoDB read/write usage spikes (`ConsumedReadCapacityUnits`, `ConsumedWriteCapacityUnits`)
- DynamoDB throttling (`ThrottledRequests`)

Set `guardrail_alarm_actions` to an SNS topic ARN list to notify on alarm state changes.

### Default guardrail thresholds

- `p50_latency_threshold_ms = 300`
- `p95_latency_threshold_ms = 1200`
- `error_rate_threshold_percent = 2`
- `dynamodb_read_units_threshold = 40000` (sum over 15m)
- `dynamodb_write_units_threshold = 40000` (sum over 15m)
- `dynamodb_throttled_requests_threshold = 1`

Tune these per environment (dev/staging/prod) before rollout.

## Rollback trigger criteria

For rollout safety, treat any of the following as rollback triggers for the refactored backend path:

1. p95 latency alarm breaches (2 of 3 datapoints at 5m period).
2. p50 latency alarm breaches (2 of 3 datapoints at 5m period) and does not self-recover in the next window.
3. Error rate > threshold (default 2%) for 2 of 3 datapoints.
4. DynamoDB throttled requests alarm breaches for 2 consecutive datapoints.
5. DynamoDB read/write usage alarms breach in sustained windows and expected cost envelope is exceeded.

Recommended rollback action: redeploy last known-good Lambda artifact for account routes (`account_lambda_package_path`) and re-run `terraform plan` + approved `terraform apply`.
