FROM docker-registry.eyeosbcn.com/eyeos-fedora21-frontend-base

ENV InstallationDir /usr/share/nginx/html/desktop

RUN mkdir -p ${InstallationDir}

COPY start.sh /

CMD /start.sh

WORKDIR ${InstallationDir}

COPY . ${InstallationDir}

RUN ./build.sh

VOLUME ${InstallationDir}
