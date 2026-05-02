# Cognito social auth foundation (Google/Apple + Hosted UI + PKCE)

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
3. SSM SecureString parameters created for enabled secrets:
   - Google OAuth client secret (when `enable_google = true`)
   - Apple private key (`.p8` contents, when `enable_apple = true`)

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

For Google-first rollout, set `enable_apple = false` and you can skip creating Apple SSM/key inputs until later.

## 2) Configure variables

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit values in `terraform.tfvars`:

- `cognito_domain_prefix` must be globally unique in-region.
- `callback_urls` / `logout_urls` must match SPA URLs.
- Set `enable_google` / `enable_apple` as needed.
- Fill non-secret IDs only for enabled providers.
- Keep secret values in SSM only.

### Production Google-first guidance

- Keep `enable_google = true`
- Set `enable_apple = false`
- Use Google secret parameter: `/dishfromthis/prod/cognito/google/client_secret`
- Apple variables/secrets can be added later, then switch `enable_apple = true`

### IdP console redirect URI

After the Hosted UI domain exists, configure this redirect URI in each enabled IdP console:

`https://<cognito_domain_prefix>.auth.<aws_region>.amazoncognito.com/oauth2/idpresponse`

For production in this repo, that resolves to:

`https://dishfromthis-prod-auth.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse`

#### Google Cloud Console steps (manual)

1. Open Google Cloud Console → **APIs & Services** → **Credentials**.
2. Open OAuth 2.0 Client ID:
   `182064678602-jt7qnm9bcj68lbdavcjqe7v9buu836ou.apps.googleusercontent.com`
3. In **Authorized redirect URIs**, add:
   `https://dishfromthis-prod-auth.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse`
4. Remove outdated Cognito redirect URIs if they are no longer used.
5. Click **Save**.

#### Verification checklist

- Google OAuth client contains the exact redirect URI above (no trailing slash).
- Cognito domain in Terraform matches prod domain prefix (`dishfromthis-prod-auth`) and region (`eu-west-1`).
- Test login from Hosted UI and confirm redirect completes to app callback URL without `redirect_uri_mismatch`.

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
