#!/bin/ash
set -e
set -x

npm install
bower install --allow-root
grunt build --verbose --debug
