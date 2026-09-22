#!/usr/bin/env bash
#
# Start all six services locally.
#
#   ./scripts/dev.sh
#
# Assumes Mongo (27017) and Postgres (5432) are already running on this Mac,
# which is what application.yml defaults to. Nothing else needs configuring:
# the defaults already point at localhost with the right database names and
# postgres/postgres credentials.
#
# Ctrl+C stops everything. Logs go to logs/<service>.log.
#
# The IntelliJ equivalent is the "0 All Services" compound run configuration.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

LOGS="$ROOT/logs"
mkdir -p "$LOGS"

# The project targets Java 25; Lombok cannot hook into a newer javac.
if [ -z "${JAVA_HOME:-}" ] && [ -d /opt/homebrew/opt/openjdk@25 ]; then
    export JAVA_HOME=/opt/homebrew/opt/openjdk@25
fi
echo "JAVA_HOME=${JAVA_HOME:-<unset, using default java>}"

# ------------------------------------------------------------ preflight
fail=0
nc -z localhost 27017 2>/dev/null || { echo "Mongo is not listening on 27017"; fail=1; }
nc -z localhost 5432  2>/dev/null || { echo "Postgres is not listening on 5432"; fail=1; }
[ "$fail" -eq 1 ] && { echo "Start your databases first."; exit 1; }
echo "Mongo and Postgres are up."

# ------------------------------------------------------------ services
PIDS=()

cleanup() {
    echo
    echo "Stopping services..."
    for pid in "${PIDS[@]:-}"; do
        kill "$pid" 2>/dev/null || true
    done
    wait 2>/dev/null || true
}
trap cleanup INT TERM

start() { # dir, then env assignments
    local dir=$1; shift
    echo "  -> $dir"
    if [ "$#" -gt 0 ]; then
        ( cd "$dir" && env "$@" mvn -q spring-boot:run ) > "$LOGS/$dir.log" 2>&1 &
    else
        ( cd "$dir" && mvn -q spring-boot:run ) > "$LOGS/$dir.log" 2>&1 &
    fi
    PIDS+=($!)
}

echo "Starting eureka_server..."
start eureka_server

# The rest retry registration anyway, but waiting keeps startup logs readable.
echo -n "Waiting for Eureka"
for _ in $(seq 1 60); do
    curl -sf http://localhost:8761/actuator/health >/dev/null 2>&1 && break
    echo -n "."
    sleep 2
done
echo " ok"

echo "Starting services..."
start api_gateway
# Ports are pinned only so the URLs below are predictable. Left alone these
# bind SERVER_PORT:0 — a random port — which works fine via Eureka.
start movie_service     SERVER_PORT=8080 GRPC_PORT=9090
start inventory_service SERVER_PORT=8081 GRPC_PORT=9091
start order_service     SERVER_PORT=8082 GRPC_PORT=9092
start user_service      SERVER_PORT=8083 GRPC_PORT=9093

cat <<EOF

All services starting. Logs: $LOGS/<service>.log

  Eureka dashboard   http://localhost:8761
  API gateway        http://localhost:8760
  movie / inventory / order / user   8080 / 8081 / 8082 / 8083

Frontend:  cd web_app && npm run dev

Ctrl+C to stop.
EOF

wait
