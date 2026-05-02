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
  description = "Existing API Gateway HTTP API ID that serves recipe/account routes."
  type        = string
}

variable "api_gateway_stage_name" {
  description = "Stage name used by API Gateway for Lambda invoke permissions."
  type        = string
  default     = "$default"
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID used by API Gateway JWT authorizer."
  type        = string
}

variable "cognito_app_client_id" {
  description = "Cognito User Pool App Client ID accepted as JWT audience."
  type        = string
}

variable "jwt_identity_sources" {
  description = "API Gateway request locations containing bearer JWTs."
  type        = list(string)
  default     = ["$request.header.Authorization"]
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
