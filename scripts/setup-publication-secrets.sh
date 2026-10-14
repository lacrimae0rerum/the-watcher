#!/usr/bin/env bash
# One-time setup for automatic Cybersecurity publication.
# Creates the `publication` GitHub environment, usable only from main, and stores its four
# secrets. Each value is read with hidden input and handed to gh on stdin: never as an
# argument, a file, or log output. Run it again to replace a value; an empty answer keeps
# the stored one.
set -euo pipefail

ENVIRONMENT=publication
DOMAIN=custodes-intellegentiae.exdataveritas.com

origin=$(git -C "$(dirname "$0")/.." remote get-url origin)
repo=$(sed -E 's#^(https://github\.com/|git@github\.com:)##; s#\.git$##' <<<"$origin")
if [[ ! "$repo" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
  echo "The origin remote is not a GitHub repository." >&2
  exit 1
fi
gh auth status >/dev/null 2>&1 || { echo "Run 'gh auth login' first." >&2; exit 1; }

echo "Repository: $repo"
echo "Environment: $ENVIRONMENT (only the main branch can use it)"
gh api --method PUT "repos/$repo/environments/$ENVIRONMENT" \
  -F 'deployment_branch_policy[protected_branches]=false' \
  -F 'deployment_branch_policy[custom_branch_policies]=true' >/dev/null
if ! gh api "repos/$repo/environments/$ENVIRONMENT/deployment-branch-policies" \
    --jq '.branch_policies[].name' | grep -qx main; then
  gh api --method POST "repos/$repo/environments/$ENVIRONMENT/deployment-branch-policies" \
    -f name=main -f type=branch >/dev/null
fi

store() { # name, where to find it
  local value=""
  echo
  echo "$1 — $2"
  read -rsp "Paste it (hidden; leave empty to keep the stored value): " value || true
  echo
  if [[ -z "$value" ]]; then
    echo "$1: kept"
    return
  fi
  printf '%s' "$value" | gh secret set "$1" --env "$ENVIRONMENT" --repo "$repo"
  value=""
}

store X_BEARER_TOKEN "X developer portal → your app → Keys and tokens → Bearer Token."
store NAN_API_KEY "Your NaN API key (api.nan.builders)."
store CLOUDFLARE_API_TOKEN "Cloudflare → API Tokens → Create Token → template 'Edit Cloudflare Workers', limited to your account and the exdataveritas.com zone."
store CLOUDFLARE_ACCOUNT_ID "Cloudflare → Workers & Pages → Account details → Account ID."

echo
echo "Done. Before the first deploy, remove any existing DNS record for $DOMAIN:"
echo "the Workers custom domain creates its own record and certificate."
