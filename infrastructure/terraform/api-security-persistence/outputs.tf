output "dynamodb_user_state_table_name" {
  description = "DynamoDB table name for persisted per-user account state."
  value       = aws_dynamodb_table.user_state.name
}

output "dynamodb_user_state_table_arn" {
  description = "DynamoDB table ARN for persisted per-user account state."
  value       = aws_dynamodb_table.user_state.arn
}

output "account_lambda_function_name" {
  description = "Lambda function serving authenticated account routes."
  value       = aws_lambda_function.account_state.function_name
}

output "account_lambda_role_name" {
  description = "IAM role name attached to account Lambda."
  value       = aws_iam_role.account_lambda.name
}

output "api_jwt_authorizer_id" {
  description = "API Gateway JWT authorizer ID."
  value       = aws_apigatewayv2_authorizer.jwt.id
}

output "account_route_ids" {
  description = "API Gateway route IDs for authenticated account routes."
  value       = { for route_key, route in aws_apigatewayv2_route.account : route_key => route.id }
}
