#!/usr/bin/env bash
#
# Start the whole stack locally: databases in Docker, services from Maven.
#
#   ./scripts/dev.sh          start everything
#   ./scripts/dev.sh stop     stop the databases too
#
# Ctrl+C stops the services. Logs go to logs/<service>.log.
#
# The IntelliJ equivalent is the "0 All Services" compound run configuration,
# but you still need the databases: docker compose -f docker-compose.dev.yml up -d

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

COMPOSE="docker compose -f docker-compose.dev.yml"

if [ "${1:-}" = "stop" ]; then
    echo "Stopping databases..."
    $COMPOSE down
    exit 0
fi

# ---------------------------------------------------------------- databases
echo "Starting Mongo and Postgres..."
$COMPOSE up -d

echo -n "Waiting for databases to report healthy"
for _ in $(seq 1 60); do
    unhealthy=$($COMPOSE ps --format '{{.Health}}' | grep -cv '^healthy$' || true)
    [ "$unhealthy" -eq 0 ] && break
    echo -n "."
    sleep 2
done
echo " ok"

# ---------------------------------------------------------------- services
PIDS=()

cleanup() {
    echo
    echo "Stopping services..."
    for pid in "${PIDS[@]:-}"; do
        kill "$pid" 2>/dev/null || true
    done
    wait 2>/dev/null || true
    echo "Services stopped. Databases are still running (./scripts/dev.sh stop)."
}
trap cleanup INT TERM

start() { # dir, then env assignments
    local dir=$1; shift
    echo "  -> $dir"
    ( cd "$dir" && env "$@" mvn -q spring-boot:run ) > "$LOGS/$dir.log" 2>&1 &
    PIDS+=($!)
}

EUREKA=http://localhost:8761/eureka

echo "Starting eureka_server..."
start eureka_server SERVER_PORT=8761

# The others retry registration, but giving Eureka a head start keeps the
# startup logs readable.
echo -n "Waiting for Eureka"
for _ in $(seq 1 60); do
    curl -sf http://localhost:8761/actuator/health >/dev/null 2>&1 && break
    echo -n "."
    sleep 2
done
echo " ok"

echo "Starting services..."
start api_gateway       SERVER_PORT=8760 EUREKA_URI=$EUREKA
start movie_service     SERVER_PORT=8080 GRPC_PORT=9090 EUREKA_URI=$EUREKA \
                        MONGO_URI=mongodb://localhost:27017 MONGO_DB=moviedb
start inventory_service SERVER_PORT=8081 GRPC_PORT=9091 EUREKA_URI=$EUREKA \
                        POSTGRES_HOST=localhost POSTGRES_DB=inventorydb \
                        POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres
start order_service     SERVER_PORT=8082 GRPC_PORT=9092 EUREKA_URI=$EUREKA \
                        POSTGRES_HOST=localhost POSTGRES_DB=orderdb \
                        POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres \
                        "STRIPE_SECRET=${STRIPE_SECRET:-}" "STRIPE_PUBLIC=${STRIPE_PUBLIC:-}"
start user_service      SERVER_PORT=8083 GRPC_PORT=9093 EUREKA_URI=$EUREKA \
                        MONGO_URI=mongodb://localhost:27017 MONGO_DB=userdb

cat <<EOF

All services starting. Logs: $LOGS/<service>.log

  Eureka dashboard   http://localhost:8761
  API gateway        http://localhost:8760
  movie / inventory / order / user   8080 / 8081 / 8082 / 8083

Frontend:  cd web_app && npm run dev

Ctrl+C to stop the services.
EOF

wait
