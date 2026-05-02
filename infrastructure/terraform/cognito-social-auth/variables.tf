variable "aws_region" {
  description = "AWS region for Cognito resources."
  type        = string
}

variable "project_name" {
  description = "Project/service name used in Cognito resource naming."
  type        = string
}

variable "environment" {
  description = "Environment name (e.g. dev, staging, prod)."
  type        = string
}

variable "cognito_domain_prefix" {
  description = "Unique prefix for Cognito Hosted UI domain."
  type        = string
}

variable "callback_urls" {
  description = "OAuth callback URLs for the SPA."
  type        = list(string)
}

variable "logout_urls" {
  description = "OAuth logout URLs for the SPA."
  type        = list(string)
}

variable "google_client_id" {
  description = "Google OAuth client ID."
  type        = string
  default     = null
}

variable "google_client_secret_ssm_parameter_name" {
  description = "SSM Parameter name containing Google OAuth client secret (SecureString)."
  type        = string
  default     = null
}

variable "enable_google" {
  description = "Whether to enable Google as a Cognito social identity provider."
  type        = bool
  default     = true
}

variable "apple_services_id" {
  description = "Apple Services ID (used as Sign in with Apple client_id)."
  type        = string
  default     = null
}

variable "apple_team_id" {
  description = "Apple Developer Team ID."
  type        = string
  default     = null
}

variable "apple_key_id" {
  description = "Apple Sign in with Apple key ID."
  type        = string
  default     = null
}

variable "apple_private_key_ssm_parameter_name" {
  description = "SSM Parameter name containing Apple private key (SecureString)."
  type        = string
  default     = null
}

variable "enable_apple" {
  description = "Whether to enable Sign in with Apple as a Cognito social identity provider."
  type        = bool
  default     = true
}

variable "oauth_scopes" {
  description = "OAuth scopes for Hosted UI authorization code flow."
  type        = list(string)
  default     = ["openid", "email", "profile"]
}

variable "tags" {
  description = "Tags applied to all resources."
  type        = map(string)
  default     = {}
}
