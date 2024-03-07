#!/usr/bin/env bash

# docker entrypoint fot storage node, to allow running with telemetry
if [[ "$ENABLE_TELEMETRY" = "yes" ]] && [[ $1 = "server" ]]; then
    node --require @joystream/opentelemetry ./bin/run $*
else
    ./bin/run $*
fi
