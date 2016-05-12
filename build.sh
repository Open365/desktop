#!/bin/sh
set -e
set -x


npm install
bower install --allow-root
grunt build --verbose

#if [ "$1" = "debug" ]; then
#	grunt build:debug
#else
#	grunt build
#fi
