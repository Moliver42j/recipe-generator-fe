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
  api_gateway_execution_arn      = "arn:${data.aws_partition.current.partition}:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${var.api_gateway_id}"
  account_route_config = {
    for route in var.account_routes : route => {
      method   = upper(split(" ", trimspace(route))[0])
      path     = trim(split(" ", trimspace(route))[1], "/")
      segments = split("/", trim(split(" ", trimspace(route))[1], "/"))
    }
  }
  account_options_config = {
    for path in distinct([for route in values(local.account_route_config) : route.path]) : path => {
      path     = path
      segments = split("/", path)
      methods = sort(distinct([
        for route in values(local.account_route_config) : route.method
        if route.path == path
      ]))
    }
  }
  account_child_path_parts = toset([
    for route in values(local.account_route_config) : route.segments[1]
    if length(route.segments) > 1
  ])
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

resource "aws_api_gateway_authorizer" "cognito" {
  name            = "${local.name}-cognito-authorizer"
  rest_api_id     = var.api_gateway_id
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [data.aws_cognito_user_pool.target.arn]
  identity_source = "method.request.header.Authorization"
}

resource "aws_api_gateway_resource" "account" {
  rest_api_id = var.api_gateway_id
  parent_id   = data.aws_api_gateway_resource.root.id
  path_part   = "account"
}

resource "aws_api_gateway_resource" "account_children" {
  for_each = local.account_child_path_parts

  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.account.id
  path_part   = each.value
}

resource "aws_api_gateway_method" "account" {
  for_each = local.account_route_config

  rest_api_id   = var.api_gateway_id
  resource_id   = length(each.value.segments) > 1 ? aws_api_gateway_resource.account_children[each.value.segments[1]].id : aws_api_gateway_resource.account.id
  http_method   = each.value.method
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "account" {
  for_each = local.account_route_config

  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_method.account[each.key].resource_id
  http_method             = aws_api_gateway_method.account[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.account_state.invoke_arn
}

resource "aws_api_gateway_method" "account_options" {
  for_each = local.account_options_config

  rest_api_id   = var.api_gateway_id
  resource_id   = length(each.value.segments) > 1 ? aws_api_gateway_resource.account_children[each.value.segments[1]].id : aws_api_gateway_resource.account.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "account_options" {
  for_each = local.account_options_config

  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_method.account_options[each.key].resource_id
  http_method = aws_api_gateway_method.account_options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "account_options" {
  for_each = local.account_options_config

  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_method.account_options[each.key].resource_id
  http_method = aws_api_gateway_method.account_options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_integration_response" "account_options" {
  for_each = local.account_options_config

  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_method.account_options[each.key].resource_id
  http_method = aws_api_gateway_method.account_options[each.key].http_method
  status_code = aws_api_gateway_method_response.account_options[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Authorization,Content-Type'"
    "method.response.header.Access-Control-Allow-Methods" = "'${join(",", concat(["OPTIONS"], each.value.methods))}'"
  }
}

resource "aws_api_gateway_deployment" "account_routes" {
  rest_api_id = var.api_gateway_id
  stage_name  = var.api_gateway_stage_name

  triggers = {
    redeployment = sha1(jsonencode({
      authorizer_id   = aws_api_gateway_authorizer.cognito.id
      account_paths   = [for resource in aws_api_gateway_resource.account_children : resource.path]
      account_methods = [for method in aws_api_gateway_method.account : method.id]
      account_integrations = [
        for integration in aws_api_gateway_integration.account : integration.id
      ]
      account_options_methods = [for method in aws_api_gateway_method.account_options : method.id]
      account_options_method_responses = [
        for response in aws_api_gateway_method_response.account_options : response.id
      ]
      account_options_integrations = [
        for integration in aws_api_gateway_integration.account_options : integration.id
      ]
      account_options_integration_responses = [
        for response in aws_api_gateway_integration_response.account_options : response.id
      ]
    }))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.account,
    aws_api_gateway_integration_response.account_options
  ]
}

resource "aws_lambda_permission" "allow_api_gateway_account_routes" {
  statement_id  = "AllowExecutionFromApiGatewayAccountRoutes"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.account_state.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${local.api_gateway_execution_arn}/${var.api_gateway_stage_name}/*/account/*"
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
