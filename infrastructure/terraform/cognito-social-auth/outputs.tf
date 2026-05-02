output "cognito_user_pool_id" {
  description = "Cognito User Pool ID."
  value       = aws_cognito_user_pool.this.id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool App Client ID (public PKCE SPA client)."
  value       = aws_cognito_user_pool_client.spa_pkce.id
}

output "cognito_hosted_ui_domain" {
  description = "Cognito Hosted UI domain."
  value       = aws_cognito_user_pool_domain.this.domain
}

output "cognito_hosted_ui_base_url" {
  description = "Base URL for Cognito Hosted UI."
  value       = "https://${aws_cognito_user_pool_domain.this.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
}
