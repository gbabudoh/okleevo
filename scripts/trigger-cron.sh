#!/usr/bin/env bash
# Triggers one of this app's /api/cron/* routes over HTTP, the way Vercel Cron
# would — for deployments (like a VPS) that aren't on Vercel and need their
# own OS-level scheduler instead. See crontab example at the bottom of this file.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/../.env}"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [ -z "${1:-}" ]; then
  echo "Usage: $0 /api/cron/<job-name>" >&2
  echo "e.g.:  $0 /api/cron/campaigns-scheduled" >&2
  exit 1
fi

: "${NEXT_PUBLIC_APP_URL:?NEXT_PUBLIC_APP_URL not set (checked $ENV_FILE)}"
: "${CRON_SECRET:?CRON_SECRET not set (checked $ENV_FILE)}"

curl -fsS -X GET "${NEXT_PUBLIC_APP_URL%/}$1" \
  -H "Authorization: Bearer $CRON_SECRET"
echo

# ── Example crontab (run `crontab -e` on the VPS) ──────────────────────────
# 0 6 * * *  /path/to/app/scripts/trigger-cron.sh /api/cron/invoice-overdue      >> /var/log/okleevo-cron.log 2>&1
# 0 * * * *  /path/to/app/scripts/trigger-cron.sh /api/cron/campaigns-scheduled  >> /var/log/okleevo-cron.log 2>&1
