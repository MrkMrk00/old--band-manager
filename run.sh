#!/usr/bin/env bash

docker-compose up -d

EXEC='npm'

if pnpm -v > /dev/null; then
    EXEC='pnpm'
fi

echo "Executing with $EXEC"

if [[ $1 == 'dev' ]]; then
    $EXEC run dev:turbo
    exit
fi

$EXEC run build
$EXEC run start

docker-compose down