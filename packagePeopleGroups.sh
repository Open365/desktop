#!/bin/sh
npm install
bower install -f
grunt build-activate-people-module
cd builder
./build.sh $1
