provider "aws" {
  region = var.aws_region
}

data "aws_partition" "current" {}

data "aws_caller_identity" "current" {}

data "aws_api_gateway_resource" "root" {
  rest_api_id = var.api_gateway_id
  path        = "/"
}

data "aws_cognito_user_pool" "target" {
  user_pool_id = var.cognito_user_pool_id
}
