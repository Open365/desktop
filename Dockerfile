FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV InstallationDir /usr/share/nginx/html/desktop

RUN mkdir -p ${InstallationDir}

COPY start.sh /

CMD /start.sh

WORKDIR ${InstallationDir}

COPY . ${InstallationDir}

RUN apk update && \
    apk del nodejs && \
    apk add nodejs=4.3.0-r0 nasm bash libpng-dev libpng ruby-dev python libffi-dev \
            make autoconf automake gcc g++ bzip2 git ruby && \
    npm install -g nan && \
    npm -g install node-gyp && \
    npm -g install iconv \
    && npm install -g coffee-script grunt-cli i18next-conv bower gifsicle\
    && gem update --no-document --system \
    && gem install --no-document json_pure compass \
    && gem cleanup \
    && gem sources -c && \
    npm uninstall grunt-contrib-imagemin && \
    ./build.sh && \
    npm -g cache clean && \
    npm cache clean && \
    apk del make autoconf automake gcc g++ ruby ruby-dev python libpng-dev \
    libpng ruby-dev python libffi-dev && \
    rm -r /etc/ssl /var/cache/apk/* node_modules bower_components

VOLUME ${InstallationDir}
