#!/bin/ash

showTimeElapsed() {
    OLD="$NOW"
    NOW="$(date +%s)"
    echo "****TIME ELAPSED: $((NOW-OLD)) seconds"
}
NOW="$(date +%s)"

set -e
set -u
set -x

apk update
apk add chromium xvfb bash xorg-server-dev libexif libexif-dev ruby ruby-dev \
    nasm bash libpng-dev libpng python libffi-dev \
            make autoconf automake gcc g++ bzip2 git ruby
npm install -g grunt grunt-cli istanbul
gem update --no-document --system
gem install --no-document json_pure compass
export CHROME_BIN=/usr/bin/chromium-browser
Xvfb :0 -extension RANDR &
sleep 5
export DISPLAY=:0


showTimeElapsed
npm install
showTimeElapsed
bower install --allow-root
showTimeElapsed
istanbul cover --report cobertura --dir build/reports/ -x "**/vendor/**" -- grunt test
showTimeElapsed
