# Cognito social auth foundation (Google + Apple + Hosted UI + PKCE)

This Terraform stack provisions:

- Cognito User Pool
- Cognito Hosted UI domain
- Social identity providers:
  - Google
  - Sign in with Apple
- Public User Pool App Client for SPA with OAuth2 Authorization Code + PKCE
- Callback/logout URL configuration for frontend SPA

## Prerequisites

1. Terraform `>= 1.5`
2. AWS credentials with permissions for Cognito + SSM read
3. SSM SecureString parameters created for secrets:
   - Google OAuth client secret
   - Apple private key (`.p8` contents)

## 1) Seed secrets in SSM Parameter Store

```bash
aws ssm put-parameter \
  --name /dishfromthis/dev/cognito/google/client_secret \
  --type SecureString \
  --value "<google-client-secret>" \
  --overwrite

aws ssm put-parameter \
  --name /dishfromthis/dev/cognito/apple/private_key \
  --type SecureString \
  --value "<apple-private-key-p8-content>" \
  --overwrite
```

## 2) Configure variables

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit values in `terraform.tfvars`:

- `cognito_domain_prefix` must be globally unique in-region.
- `callback_urls` / `logout_urls` must match SPA URLs.
- Fill non-secret IDs for Google/Apple.
- Keep secret values in SSM only.

### IdP console redirect URI

After the Hosted UI domain exists, configure this redirect URI in both Google and Apple developer consoles:

`https://<cognito_domain_prefix>.auth.<aws_region>.amazoncognito.com/oauth2/idpresponse`

## 3) Plan and apply

```bash
terraform init
terraform plan
# terraform apply   # run only when approved
```

## Outputs for frontend integration

Capture Terraform outputs after apply:

- `cognito_user_pool_id`
- `cognito_user_pool_client_id`
- `cognito_hosted_ui_domain`
- `cognito_hosted_ui_base_url`

Then set frontend env values described in `../../../.env.example`.
