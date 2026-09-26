#!/usr/bin/env bash
#
# Show, grant or remove a user's role (Firebase custom claim "roles").
# See scripts/GrantRole.java for what each form does.
#
#   ./scripts/grant-role.sh --list
#   ./scripts/grant-role.sh admin@admin.com ADMIN
#   ./scripts/grant-role.sh admin@admin.com --revoke ADMIN
#
# Runs GrantRole.java as a single-file program on the gateway's classpath (it
# already has the Firebase Admin SDK), with the service account from secrets/.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "${JAVA_HOME:-}" ] && [ -d /opt/homebrew/opt/openjdk@25 ]; then
    export JAVA_HOME=/opt/homebrew/opt/openjdk@25
fi
JAVA="${JAVA_HOME:+$JAVA_HOME/bin/}java"

ACCOUNT="${SECRETS_DIR:-$ROOT/secrets}/firebase-service-account.json"
[ -f "$ACCOUNT" ] || { echo "Missing $ACCOUNT (see secrets/README.md)"; exit 1; }

CP="$(mktemp -t grant-role-cp)"
trap 'rm -f "$CP"' EXIT
(cd "$ROOT/api_gateway" && mvn -o -q dependency:build-classpath -Dmdep.outputFile="$CP")

"$JAVA" -cp "$(cat "$CP")" "$ROOT/scripts/GrantRole.java" "$ACCOUNT" "$@"
