  #!/bin/sh
  set -e

  echo "Waiting for database..."

  until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
    sleep 2
  done

  echo "Database is up"

  echo "Starting backend server"
  node src/server.js
