FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV InstallationDir /usr/share/nginx/html/desktop

RUN mkdir -p ${InstallationDir}

COPY start.sh /

CMD /start.sh

WORKDIR ${InstallationDir}

COPY . ${InstallationDir}

RUN /scripts-base/buildDependencies.sh --production --install && \
    npm install -g \
        bower \
        coffee-script \
        gifsicle \
        grunt-cli \
        i18next-conv \
        iconv \
        nan \
        node-gyp \
    && \
    gem update --no-document --system && \
    gem install --no-document \
        compass \
        json_pure \
    && \
    gem cleanup && \
    gem sources -c && \
    ./build.sh && \
    npm cache clean && \
    /scripts-base/buildDependencies.sh --production --purgue && \
    rm -r \
        /etc/ssl \
        /var/cache/apk/* \
        bower_components \
        node_modules

VOLUME ${InstallationDir}
