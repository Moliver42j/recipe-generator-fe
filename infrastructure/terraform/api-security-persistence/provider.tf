provider "aws" {
  region = var.aws_region
}

data "aws_apigatewayv2_api" "target" {
  api_id = var.api_gateway_id
}
