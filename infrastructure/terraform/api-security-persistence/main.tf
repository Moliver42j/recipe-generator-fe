locals {
  name = "${var.project_name}-${var.environment}"
  tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.tags
  )

  dynamodb_user_state_table_name = coalesce(var.dynamodb_user_state_table_name, "${local.name}-user-state")
  account_lambda_function_name   = coalesce(var.account_lambda_function_name, "${local.name}-account-state")
  cognito_issuer                 = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.cognito_user_pool_id}"
}

resource "aws_dynamodb_table" "user_state" {
  name         = local.dynamodb_user_state_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = local.tags
}

resource "aws_iam_role" "account_lambda" {
  name = "${local.account_lambda_function_name}-role"

  assume_role_policy = jsonencode(
    {
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Allow"
          Principal = {
            Service = "lambda.amazonaws.com"
          }
          Action = "sts:AssumeRole"
        }
      ]
    }
  )

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "account_lambda_basic_execution" {
  role       = aws_iam_role.account_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "account_lambda_dynamodb_access" {
  name = "${local.account_lambda_function_name}-dynamodb-access"
  role = aws_iam_role.account_lambda.id

  policy = jsonencode(
    {
      Version = "2012-10-17"
      Statement = [
        {
          Sid    = "UserStateReadWrite"
          Effect = "Allow"
          Action = [
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:DeleteItem",
            "dynamodb:UpdateItem",
            "dynamodb:Query"
          ]
          Resource = [
            aws_dynamodb_table.user_state.arn,
            "${aws_dynamodb_table.user_state.arn}/index/*"
          ]
        }
      ]
    }
  )
}

resource "aws_lambda_function" "account_state" {
  function_name = local.account_lambda_function_name
  role          = aws_iam_role.account_lambda.arn

  filename         = var.account_lambda_package_path
  source_code_hash = filebase64sha256(var.account_lambda_package_path)
  handler          = var.account_lambda_handler
  runtime          = var.account_lambda_runtime
  timeout          = var.account_lambda_timeout
  memory_size      = var.account_lambda_memory_size

  environment {
    variables = {
      USER_STATE_TABLE_NAME = aws_dynamodb_table.user_state.name
      COGNITO_USER_POOL_ID  = var.cognito_user_pool_id
      COGNITO_APP_CLIENT_ID = var.cognito_app_client_id
      COGNITO_ISSUER        = local.cognito_issuer
    }
  }

  tags = local.tags

  depends_on = [
    aws_iam_role_policy_attachment.account_lambda_basic_execution,
    aws_iam_role_policy.account_lambda_dynamodb_access
  ]
}

resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = var.api_gateway_id
  authorizer_type  = "JWT"
  identity_sources = var.jwt_identity_sources
  name             = "${local.name}-jwt-authorizer"

  jwt_configuration {
    audience = [var.cognito_app_client_id]
    issuer   = local.cognito_issuer
  }
}

resource "aws_apigatewayv2_integration" "account_lambda" {
  api_id                 = var.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.account_state.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "account" {
  for_each = toset(var.account_routes)

  api_id             = var.api_gateway_id
  route_key          = each.value
  target             = "integrations/${aws_apigatewayv2_integration.account_lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
}

resource "aws_lambda_permission" "allow_api_gateway_account_routes" {
  statement_id  = "AllowExecutionFromApiGatewayAccountRoutes"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.account_state.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.aws_apigatewayv2_api.target.execution_arn}/${var.api_gateway_stage_name}/*"
}
