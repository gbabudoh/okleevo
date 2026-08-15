#!/usr/bin/env bash
# Installs/refreshes this app's crontab entries. Idempotent — safe to run on
# every deploy, since it only ever replaces the block it owns (marked below),
# rather than appending a fresh copy each time.
#
# Usage: bash scripts/install-cron.sh
# Run as whichever user should own these cron jobs (add it to your deploy
# script/CI step, right after the app restarts).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRIGGER="$SCRIPT_DIR/trigger-cron.sh"
LOG="/var/log/okleevo-cron.log"

MARKER_START="# >>> okleevo cron jobs >>>"
MARKER_END="# <<< okleevo cron jobs <<<"

BLOCK="$MARKER_START
0 6 * * *  $TRIGGER /api/cron/invoice-overdue     >> $LOG 2>&1
0 * * * *  $TRIGGER /api/cron/campaigns-scheduled  >> $LOG 2>&1
$MARKER_END"

EXISTING="$(crontab -l 2>/dev/null || true)"
STRIPPED="$(printf '%s\n' "$EXISTING" | sed "/$MARKER_START/,/$MARKER_END/d")"

printf '%s\n%s\n' "$STRIPPED" "$BLOCK" | crontab -

echo "Installed cron jobs:"
crontab -l | sed -n "/$MARKER_START/,/$MARKER_END/p"
