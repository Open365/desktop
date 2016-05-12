#!/bin/bash
set -x
set -e
set -u
sudo yum install npm
sudo npm install -g bower
sudo npm install -g grunt-cli
sudo npm install i18next-conv -g
sudo yum install gem
sudo yum install ruby-devel
sudo gem update --system
gem install compass
gem install json_pure