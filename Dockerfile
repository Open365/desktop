FROM docker-registry.eyeosbcn.com/alpine-frontend-base

ENV InstallationDir /usr/share/nginx/html/desktop

RUN mkdir -p ${InstallationDir}

COPY start.sh /

CMD /start.sh

WORKDIR ${InstallationDir}

COPY . ${InstallationDir}

RUN /scripts-base/buildDependencies.sh --production --install && \
    npm install -g gifsicle && \
    gem update --no-document --system && \
    gem install --no-document json_pure compass && \
    gem cleanup && \
    gem sources -c && \
    ./build.sh && \
    npm cache clean && \
    /scripts-base/buildDependencies.sh --production --purgue && \
    rm -r \
        /var/cache/apk/* \
        bower_components \
        node_modules

VOLUME ${InstallationDir}
