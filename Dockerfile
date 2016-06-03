FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV InstallationDir /usr/share/nginx/html/desktop

RUN mkdir -p ${InstallationDir}

COPY start.sh /

CMD /start.sh

WORKDIR ${InstallationDir}

COPY . ${InstallationDir}

RUN apk update && \
    apk del nodejs && \
    apk add \
        autoconf \
        automake \
        bash \
        bzip2 \
        g++ \
        gcc \
        git \
        libffi-dev \
        libpng \
        libpng-dev \
        make \
        nasm \
        nodejs=4.3.0-r0 \
        python \
        ruby \
        ruby-dev \
    && \
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
    npm -g cache clean && \
    npm cache clean && \
    apk del \
        autoconf \
        automake \
        g++ \
        gcc \
        libffi-dev \
        libpng \
        libpng-dev \
        make \
        python \
        ruby \
        ruby-dev \
    && \
    rm -r \
        /etc/ssl \
        /var/cache/apk/* \
        bower_components \
        node_modules

VOLUME ${InstallationDir}
