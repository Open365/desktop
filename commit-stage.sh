#!/bin/bash

showTimeElapsed() {
    OLD="$NOW"
    NOW="$(date +%s)"
    echo "****TIME ELAPSED: $((NOW-OLD)) seconds"
}
NOW="$(date +%s)"

set -e
set -u
set -x

if [ -f /.dockerinit ]; then
	Xvfb :0 &
    sleep 5
    export DISPLAY=:0
fi

showTimeElapsed
npm install
showTimeElapsed
bower install --allow-root
showTimeElapsed
istanbul cover --report cobertura --dir build/reports/ -x "**/vendor/**" -- grunt test
showTimeElapsed
