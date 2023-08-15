#!/usr/bin/env bash

docker-compose up -d

EXEC='npm'

if pnpm -v; then
    EXEC='pnpm' > /dev/null
fi

echo "Executing with $EXEC"

if [[ $1 == 'dev' ]]; then
    $EXEC run dev:turbo
    exit
fi

$EXEC run build
$EXEC run start

docker-compose down