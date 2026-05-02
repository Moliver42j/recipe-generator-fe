variable "aws_region" {
  description = "AWS region for API, Lambda, and DynamoDB resources."
  type        = string
}

variable "project_name" {
  description = "Project/service name used in resource naming."
  type        = string
}

variable "environment" {
  description = "Environment name (e.g. dev, staging, prod)."
  type        = string
}

variable "api_gateway_id" {
  description = "Existing API Gateway REST API (v1) ID that serves recipe/account routes."
  type        = string
}

variable "api_gateway_stage_name" {
  description = "Stage name used by API Gateway for Lambda invoke permissions."
  type        = string
  default     = "default"
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID used by API Gateway JWT authorizer."
  type        = string
}

variable "cognito_app_client_id" {
  description = "Cognito User Pool App Client ID accepted as JWT audience."
  type        = string
}

variable "dynamodb_user_state_table_name" {
  description = "Name for the DynamoDB user-state table."
  type        = string
  default     = null
}

variable "account_lambda_function_name" {
  description = "Name for the account-state Lambda function."
  type        = string
  default     = null
}

variable "account_lambda_package_path" {
  description = "Path to deployed Lambda zip package for account-state handlers."
  type        = string
}

variable "account_lambda_handler" {
  description = "Lambda handler for account-state routes."
  type        = string
  default     = "index.handler"
}

variable "account_lambda_runtime" {
  description = "Lambda runtime for account-state routes."
  type        = string
  default     = "nodejs20.x"
}

variable "account_lambda_timeout" {
  description = "Timeout (seconds) for account-state Lambda."
  type        = number
  default     = 15
}

variable "account_lambda_memory_size" {
  description = "Memory (MB) for account-state Lambda."
  type        = number
  default     = 256
}

variable "account_routes" {
  description = "Route keys for authenticated account endpoints protected by JWT authorizer."
  type        = list(string)
  default = [
    "GET /account/state",
    "PUT /account/state",
    "POST /account/migrate-guest"
  ]
}

variable "tags" {
  description = "Tags applied to all resources."
  type        = map(string)
  default     = {}
}

variable "enable_guardrail_alarms" {
  description = "When true, create CloudWatch alarms for rollout latency/error/cost guardrails."
  type        = bool
  default     = true
}

variable "guardrail_alarm_actions" {
  description = "SNS topic ARNs or other alarm action ARNs notified when guardrail alarms fire."
  type        = list(string)
  default     = []
}

variable "latency_alarm_period_seconds" {
  description = "CloudWatch period (seconds) used by p50/p95 latency alarms."
  type        = number
  default     = 300
}

variable "p50_latency_threshold_ms" {
  description = "Rollback guardrail threshold for Lambda p50 duration (milliseconds)."
  type        = number
  default     = 300
}

variable "p95_latency_threshold_ms" {
  description = "Rollback guardrail threshold for Lambda p95 duration (milliseconds)."
  type        = number
  default     = 1200
}

variable "error_rate_threshold_percent" {
  description = "Rollback guardrail threshold for Lambda error rate percentage."
  type        = number
  default     = 2
}

variable "dynamodb_usage_period_seconds" {
  description = "CloudWatch period (seconds) used by DynamoDB usage/cost indicator alarms."
  type        = number
  default     = 900
}

variable "dynamodb_read_units_threshold" {
  description = "Guardrail threshold for DynamoDB ConsumedReadCapacityUnits (sum per usage period)."
  type        = number
  default     = 40000
}

variable "dynamodb_write_units_threshold" {
  description = "Guardrail threshold for DynamoDB ConsumedWriteCapacityUnits (sum per usage period)."
  type        = number
  default     = 40000
}

variable "dynamodb_throttled_requests_threshold" {
  description = "Guardrail threshold for DynamoDB throttled requests (sum per latency period)."
  type        = number
  default     = 1
}
