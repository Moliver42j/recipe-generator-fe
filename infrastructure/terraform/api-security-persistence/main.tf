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

resource "aws_cloudwatch_metric_alarm" "account_lambda_p50_latency_high" {
  count = var.enable_guardrail_alarms ? 1 : 0

  alarm_name          = "${local.name}-account-lambda-p50-latency-high"
  alarm_description   = "Rollback guardrail: account Lambda p50 duration exceeds threshold."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  datapoints_to_alarm = 2
  threshold           = var.p50_latency_threshold_ms
  treat_missing_data  = "notBreaching"

  namespace          = "AWS/Lambda"
  metric_name        = "Duration"
  extended_statistic = "p50"
  period             = var.latency_alarm_period_seconds
  dimensions = {
    FunctionName = aws_lambda_function.account_state.function_name
  }

  alarm_actions = var.guardrail_alarm_actions
  ok_actions    = var.guardrail_alarm_actions
  tags          = local.tags
}

resource "aws_cloudwatch_metric_alarm" "account_lambda_p95_latency_high" {
  count = var.enable_guardrail_alarms ? 1 : 0

  alarm_name          = "${local.name}-account-lambda-p95-latency-high"
  alarm_description   = "Rollback guardrail: account Lambda p95 duration exceeds threshold."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  datapoints_to_alarm = 2
  threshold           = var.p95_latency_threshold_ms
  treat_missing_data  = "notBreaching"

  namespace          = "AWS/Lambda"
  metric_name        = "Duration"
  extended_statistic = "p95"
  period             = var.latency_alarm_period_seconds
  dimensions = {
    FunctionName = aws_lambda_function.account_state.function_name
  }

  alarm_actions = var.guardrail_alarm_actions
  ok_actions    = var.guardrail_alarm_actions
  tags          = local.tags
}

resource "aws_cloudwatch_metric_alarm" "account_lambda_error_rate_high" {
  count = var.enable_guardrail_alarms ? 1 : 0

  alarm_name          = "${local.name}-account-lambda-error-rate-high"
  alarm_description   = "Rollback guardrail: account Lambda error rate exceeds threshold."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  datapoints_to_alarm = 2
  threshold           = var.error_rate_threshold_percent
  treat_missing_data  = "notBreaching"

  metric_query {
    id          = "error_rate"
    expression  = "IF(invocations > 0, (errors / invocations) * 100, 0)"
    label       = "ErrorRatePercent"
    return_data = true
  }

  metric_query {
    id = "errors"
    metric {
      namespace   = "AWS/Lambda"
      metric_name = "Errors"
      period      = var.latency_alarm_period_seconds
      stat        = "Sum"
      dimensions = {
        FunctionName = aws_lambda_function.account_state.function_name
      }
    }
    return_data = false
  }

  metric_query {
    id = "invocations"
    metric {
      namespace   = "AWS/Lambda"
      metric_name = "Invocations"
      period      = var.latency_alarm_period_seconds
      stat        = "Sum"
      dimensions = {
        FunctionName = aws_lambda_function.account_state.function_name
      }
    }
    return_data = false
  }

  alarm_actions = var.guardrail_alarm_actions
  ok_actions    = var.guardrail_alarm_actions
  tags          = local.tags
}

resource "aws_cloudwatch_metric_alarm" "dynamodb_read_usage_high" {
  count = var.enable_guardrail_alarms ? 1 : 0

  alarm_name          = "${local.name}-dynamodb-read-usage-high"
  alarm_description   = "Cost guardrail: DynamoDB read unit consumption spike on user-state table."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  datapoints_to_alarm = 2
  threshold           = var.dynamodb_read_units_threshold
  treat_missing_data  = "notBreaching"

  namespace   = "AWS/DynamoDB"
  metric_name = "ConsumedReadCapacityUnits"
  statistic   = "Sum"
  period      = var.dynamodb_usage_period_seconds
  dimensions = {
    TableName = aws_dynamodb_table.user_state.name
  }

  alarm_actions = var.guardrail_alarm_actions
  ok_actions    = var.guardrail_alarm_actions
  tags          = local.tags
}

resource "aws_cloudwatch_metric_alarm" "dynamodb_write_usage_high" {
  count = var.enable_guardrail_alarms ? 1 : 0

  alarm_name          = "${local.name}-dynamodb-write-usage-high"
  alarm_description   = "Cost guardrail: DynamoDB write unit consumption spike on user-state table."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  datapoints_to_alarm = 2
  threshold           = var.dynamodb_write_units_threshold
  treat_missing_data  = "notBreaching"

  namespace   = "AWS/DynamoDB"
  metric_name = "ConsumedWriteCapacityUnits"
  statistic   = "Sum"
  period      = var.dynamodb_usage_period_seconds
  dimensions = {
    TableName = aws_dynamodb_table.user_state.name
  }

  alarm_actions = var.guardrail_alarm_actions
  ok_actions    = var.guardrail_alarm_actions
  tags          = local.tags
}

resource "aws_cloudwatch_metric_alarm" "dynamodb_throttled_requests_high" {
  count = var.enable_guardrail_alarms ? 1 : 0

  alarm_name          = "${local.name}-dynamodb-throttled-requests-high"
  alarm_description   = "Rollback guardrail: DynamoDB throttled requests detected for user-state table."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  datapoints_to_alarm = 2
  threshold           = var.dynamodb_throttled_requests_threshold
  treat_missing_data  = "notBreaching"

  namespace   = "AWS/DynamoDB"
  metric_name = "ThrottledRequests"
  statistic   = "Sum"
  period      = var.latency_alarm_period_seconds
  dimensions = {
    TableName = aws_dynamodb_table.user_state.name
  }

  alarm_actions = var.guardrail_alarm_actions
  ok_actions    = var.guardrail_alarm_actions
  tags          = local.tags
}
